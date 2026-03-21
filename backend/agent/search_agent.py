from __future__ import annotations

import asyncio
import json
import logging
from typing import AsyncGenerator

import anthropic

from agent.client import get_client
from agent.prompts import build_find_people_prompt, build_search_system_prompt
from models.schemas import LeadCard, LeadType, ProfileSummary, StreamEvent

logger = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5"
CATEGORIES = [
    LeadType.EVENT,
    LeadType.PERSON,
    LeadType.COMMUNITY,
    LeadType.COMPANY,
    LeadType.RESOURCE,
]

CALL_TIMEOUT = 120.0       # seconds before a single API call is abandoned
RETRY_DELAYS = [30, 60, 90]  # backoff schedule on 429


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

async def _call_with_retry(client: anthropic.Anthropic, **kwargs) -> anthropic.types.Message:
    """Call client.messages.create(), retrying on 429 with exponential backoff."""
    last_exc: Exception | None = None
    for attempt, delay in enumerate(RETRY_DELAYS, 1):
        try:
            return client.messages.create(**kwargs)
        except anthropic.RateLimitError as exc:
            last_exc = exc
            if attempt == len(RETRY_DELAYS):
                break
            logger.warning(
                "[retry] 429 rate limit — waiting %ds (attempt %d/%d)",
                delay, attempt, len(RETRY_DELAYS),
            )
            await asyncio.sleep(delay)
    raise last_exc  # type: ignore[misc]


def _extract_search_queries(response: anthropic.types.Message) -> list[str]:
    """Pull the query strings out of web_search tool_use blocks."""
    queries: list[str] = []
    for block in response.content:
        if block.type == "tool_use" and block.name == "web_search":
            query = block.input.get("query", "") if isinstance(block.input, dict) else ""
            if query:
                queries.append(query)
    return queries


def _dedupe(cards: list[LeadCard], seen_urls: set[str]) -> list[LeadCard]:
    """Remove cards whose source URLs are all already in seen_urls; update seen_urls in place."""
    kept: list[LeadCard] = []
    for card in cards:
        card_urls = {str(u) for u in card.source_urls}
        if card_urls.issubset(seen_urls):
            logger.info("[dedupe] Dropping duplicate card: %r", card.title)
            continue
        seen_urls.update(card_urls)
        kept.append(card)
    return kept


# ---------------------------------------------------------------------------
# Core agent calls
# ---------------------------------------------------------------------------

async def search_category(
    profile: ProfileSummary,
    category: LeadType,
    max_results: int,
) -> list[LeadCard]:
    """Run the Claude agent for a single category and return verified LeadCards."""
    client = get_client()
    system_prompt = build_search_system_prompt(category, profile, max_results)

    response = await asyncio.wait_for(
        _call_with_retry(
            client,
            model=MODEL,
            max_tokens=4096,
            system=system_prompt,
            tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 3}],  # type: ignore[list-item]
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Find {category.value}s for this user. "
                        f"Run at least 2 different searches and return up to {max_results} "
                        f"verified leads as a JSON array."
                    ),
                }
            ],
        ),
        timeout=CALL_TIMEOUT,
    )

    queries = _extract_search_queries(response)
    text_blocks = [b for b in response.content if b.type == "text"]

    if not text_blocks:
        logger.warning(
            "[search_category] category=%s stop_reason=%s — no text block returned",
            category.value, response.stop_reason,
        )
        return []

    cards = _parse_lead_cards(text_blocks[-1].text.strip(), category)

    logger.info(
        "[search_category] category=%s searches=%d queries=%s "
        "input_tokens=%d output_tokens=%d cards_valid=%d",
        category.value,
        len(queries),
        queries,
        response.usage.input_tokens,
        response.usage.output_tokens,
        len(cards),
    )

    return cards


async def find_people_from_event(
    event_card: LeadCard,
    profile: ProfileSummary,
    max_results: int,
) -> list[LeadCard]:
    """Fetch an event's source URLs, extract speakers/organizers, find their profiles."""
    client = get_client()
    system_prompt = build_find_people_prompt(event_card, profile, max_results)

    response = await asyncio.wait_for(
        _call_with_retry(
            client,
            model=MODEL,
            max_tokens=4096,
            system=system_prompt,
            tools=[{"type": "web_search_20250305", "name": "web_search", "max_uses": 5}],  # type: ignore[list-item]
            messages=[
                {
                    "role": "user",
                    "content": (
                        f"Find the speakers and organizers for '{event_card.title}'. "
                        f"Fetch the event page, extract names, find each person's public profile. "
                        f"Return up to {max_results} verified people as a JSON array."
                    ),
                }
            ],
        ),
        timeout=CALL_TIMEOUT,
    )

    queries = _extract_search_queries(response)
    text_blocks = [b for b in response.content if b.type == "text"]

    if not text_blocks:
        logger.warning(
            "[find_people] event=%r stop_reason=%s — no text block returned",
            event_card.title, response.stop_reason,
        )
        return []

    cards = _parse_lead_cards(text_blocks[-1].text.strip(), LeadType.PERSON)

    logger.info(
        "[find_people] event=%r searches=%d queries=%s "
        "input_tokens=%d output_tokens=%d cards_valid=%d",
        event_card.title,
        len(queries),
        queries,
        response.usage.input_tokens,
        response.usage.output_tokens,
        len(cards),
    )

    return cards


# ---------------------------------------------------------------------------
# JSON parsing
# ---------------------------------------------------------------------------

def _parse_lead_cards(raw: str, category: LeadType) -> list[LeadCard]:
    """Parse the JSON array from the agent's final response."""
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]

    raw = raw.strip()
    if not raw or raw == "[]":
        return []

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1:
            logger.warning("[parse] Could not find JSON array in response: %.200s", raw)
            return []
        try:
            data = json.loads(raw[start : end + 1])
        except json.JSONDecodeError:
            logger.warning("[parse] JSON parse failed: %.200s", raw[start : end + 1])
            return []

    if not isinstance(data, list):
        data = [data]

    cards: list[LeadCard] = []
    for item in data:
        if not isinstance(item, dict):
            continue
        item["lead_type"] = category.value
        try:
            card = LeadCard.model_validate(item)
            cards.append(card)
        except Exception as e:
            logger.warning("[parse] Skipping invalid LeadCard (%s): title=%s", e, item.get("title", "?"))

    return cards


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

async def run_search(
    profile: ProfileSummary,
    max_per_category: int,
) -> AsyncGenerator[StreamEvent, None]:
    """Sequentially search all categories, yielding StreamEvents."""
    logger.info("[run_search] Starting search for profile: %s", profile.name or "unknown")

    seen_urls: set[str] = set()

    for i, category in enumerate(CATEGORIES):
        if i > 0:
            await asyncio.sleep(25)  # stay within per-minute token limits
        yield StreamEvent(event_type="status", data=f"Searching {category.value}s...")

        try:
            cards = await search_category(profile, category, max_per_category)
        except asyncio.TimeoutError:
            logger.error("[run_search] Timeout in category=%s after %.0fs", category.value, CALL_TIMEOUT)
            yield StreamEvent(event_type="error", data=f"Timed out searching {category.value}s — skipping.")
            continue
        except Exception as e:
            logger.error("[run_search] Error in category=%s: %s", category.value, e, exc_info=True)
            yield StreamEvent(event_type="error", data=f"Error searching {category.value}s: {e}")
            continue

        cards = _dedupe(cards, seen_urls)

        if not cards:
            yield StreamEvent(event_type="status", data=f"No {category.value}s found.")
        else:
            yield StreamEvent(event_type="status", data=f"Found {len(cards)} {category.value}(s).")
            for card in cards:
                yield StreamEvent(event_type="card", data=card)

    logger.info("[run_search] Search complete for profile: %s", profile.name or "unknown")
    yield StreamEvent(event_type="done", data="Search complete.")

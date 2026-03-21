from __future__ import annotations

import asyncio
import json
import logging
from typing import AsyncGenerator

from agent.client import get_client
from agent.prompts import build_search_system_prompt
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


async def search_category(
    profile: ProfileSummary,
    category: LeadType,
    max_results: int,
) -> list[LeadCard]:
    """Run the Claude agent for a single category and return verified LeadCards.

    The web_search_20250305 tool is a server-side built-in tool: Claude calls it,
    the Anthropic API executes the searches, injects the results into the model's
    context, and the model continues — all within a single API call. We get back
    stop_reason="end_turn" with the final text once all searches are done.
    """
    client = get_client()
    system_prompt = build_search_system_prompt(category, profile, max_results)

    response = client.messages.create(
        model=MODEL,
        max_tokens=4096,
        system=system_prompt,
        tools=[{"type": "web_search_20250305", "name": "web_search"}],  # type: ignore[list-item]
        messages=[
            {
                "role": "user",
                "content": (
                    f"Find {category.value}s for this user. "
                    f"Search thoroughly and return up to {max_results} verified leads as a JSON array."
                ),
            }
        ],
    )

    # Extract final text block (may follow tool_use/tool_result blocks in content)
    text_blocks = [b for b in response.content if b.type == "text"]
    if not text_blocks:
        logger.warning("No text in response for category %s (stop_reason=%s)", category, response.stop_reason)
        return []

    return _parse_lead_cards(text_blocks[-1].text.strip(), category)


def _parse_lead_cards(raw: str, category: LeadType) -> list[LeadCard]:
    """Parse the JSON array from the agent's final response."""
    # Strip markdown fences
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        raw = raw.rsplit("```", 1)[0]

    raw = raw.strip()
    if not raw or raw == "[]":
        return []

    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        # Try to find JSON array within surrounding text
        start = raw.find("[")
        end = raw.rfind("]")
        if start == -1 or end == -1:
            logger.warning("Could not parse JSON from agent response: %.200s", raw)
            return []
        try:
            data = json.loads(raw[start : end + 1])
        except json.JSONDecodeError:
            logger.warning("JSON parse failed after extraction: %.200s", raw[start : end + 1])
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
            logger.warning("Skipping invalid LeadCard: %s — %s", e, item.get("title", "?"))

    return cards


async def run_search(
    profile: ProfileSummary,
    max_per_category: int,
) -> AsyncGenerator[StreamEvent, None]:
    """Sequentially search all categories, yielding StreamEvents."""
    for i, category in enumerate(CATEGORIES):
        if i > 0:
            await asyncio.sleep(15)  # stay within per-minute token limits
        yield StreamEvent(event_type="status", data=f"Searching {category.value}s...")

        try:
            cards = await search_category(profile, category, max_per_category)
        except Exception as e:
            logger.error("Error searching category %s: %s", category, e)
            yield StreamEvent(event_type="error", data=f"Error searching {category.value}s: {e}")
            continue

        if not cards:
            yield StreamEvent(event_type="status", data=f"No {category.value}s found.")
        else:
            yield StreamEvent(event_type="status", data=f"Found {len(cards)} {category.value}(s).")
            for card in cards:
                yield StreamEvent(event_type="card", data=card)

    yield StreamEvent(event_type="done", data="Search complete.")

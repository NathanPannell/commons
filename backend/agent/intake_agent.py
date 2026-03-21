import asyncio
import json
import logging

from agent.client import get_client
from agent.prompts import INTAKE_SYSTEM_PROMPT
from agent.search_agent import _call_with_retry
from models.schemas import ProfileInput, ProfileSummary

logger = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5"
CALL_TIMEOUT = 30.0


async def parse_profile(profile_input: ProfileInput) -> ProfileSummary:
    """Call Claude to parse raw ProfileInput into a structured ProfileSummary."""
    client = get_client()

    parts: list[str] = []
    if profile_input.bio_text:
        parts.append(f"BIO:\n{profile_input.bio_text}")
    if profile_input.resume_text:
        parts.append(f"RESUME:\n{profile_input.resume_text}")
    if profile_input.target_roles:
        parts.append(f"Target roles: {', '.join(profile_input.target_roles)}")
    if profile_input.target_industries:
        parts.append(f"Target industries: {', '.join(profile_input.target_industries)}")
    if profile_input.target_locations:
        parts.append(f"Target locations: {', '.join(profile_input.target_locations)}")
    if profile_input.interests:
        parts.append(f"Interests: {', '.join(profile_input.interests)}")

    user_message = "\n\n".join(parts) if parts else "No input provided."

    response = await asyncio.wait_for(
        _call_with_retry(
            client,
            model=MODEL,
            max_tokens=2048,
            system=INTAKE_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_message}],
        ),
        timeout=CALL_TIMEOUT,
    )

    logger.info(
        "[intake] input_tokens=%d output_tokens=%d",
        response.usage.input_tokens,
        response.usage.output_tokens,
    )

    raw_json = response.content[0].text.strip()
    if raw_json.startswith("```"):
        raw_json = raw_json.split("\n", 1)[1]
        raw_json = raw_json.rsplit("```", 1)[0]

    data = json.loads(raw_json)
    data["raw_input"] = profile_input.model_dump()
    summary = ProfileSummary.model_validate(data)

    logger.info(
        "[intake] parsed name=%r skills=%d angles=%d locations=%s",
        summary.name,
        len(summary.skills),
        len(summary.angles),
        summary.locations,
    )

    return summary

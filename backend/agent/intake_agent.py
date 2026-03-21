import json

from agent.client import get_client
from agent.prompts import INTAKE_SYSTEM_PROMPT
from models.schemas import ProfileInput, ProfileSummary

MODEL = "claude-haiku-4-5"


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

    response = client.messages.create(
        model=MODEL,
        max_tokens=2048,
        system=INTAKE_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_message}],
    )

    raw_json = response.content[0].text.strip()
    # Strip markdown code fences if present
    if raw_json.startswith("```"):
        raw_json = raw_json.split("\n", 1)[1]
        raw_json = raw_json.rsplit("```", 1)[0]

    data = json.loads(raw_json)
    # Inject raw_input back
    data["raw_input"] = profile_input.model_dump()
    return ProfileSummary.model_validate(data)

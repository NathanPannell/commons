"""Manual test script for the search agent.

Usage (from the backend/ directory):
    python scripts/test_agent.py

Tests the event search category with a hardcoded UVic student profile.
"""
import asyncio
import sys
import os

# Add backend/ to path so imports work
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.schemas import LeadType, ProfileInput, ProfileSummary
from agent.search_agent import search_category


SAMPLE_PROFILE = ProfileSummary(
    name="Alex Chen",
    education="BSc Computer Science, University of Victoria (3rd year)",
    skills=["Python", "TypeScript", "React", "FastAPI", "PostgreSQL", "Git"],
    experience_summary=(
        "UVic CS student with two internships in web development. "
        "Built full-stack projects using React and FastAPI. "
        "No formal professional network yet — first-gen student."
    ),
    target_roles=["software engineer", "full-stack developer", "backend developer"],
    target_industries=["technology", "startups", "SaaS"],
    locations=["Victoria BC", "Vancouver BC", "Remote"],
    angles=[
        "First-gen student with no professional network looking for mentorship",
        "Strong Python/TypeScript skills, interested in full-stack and backend roles",
        "Based in Victoria BC, open to Vancouver and remote",
        "Looking for co-op placements and entry-level roles",
        "Interested in local Victoria tech community and meetups",
    ],
    raw_input=ProfileInput(
        bio_text="UVic CS student interested in full-stack web development",
        target_roles=["software engineer"],
        target_locations=["Victoria BC"],
    ),
)


async def main() -> None:
    print("=" * 60)
    print("Commons Agent Test — Events Category")
    print("=" * 60)
    print(f"Profile: {SAMPLE_PROFILE.name}")
    print(f"Location: {', '.join(SAMPLE_PROFILE.locations)}")
    print(f"Skills: {', '.join(SAMPLE_PROFILE.skills)}")
    print()
    print("Running event search (this may take 30-60 seconds)...")
    print()

    cards = await search_category(SAMPLE_PROFILE, LeadType.EVENT, max_results=3)

    if not cards:
        print("No leads found.")
        return

    for i, card in enumerate(cards, 1):
        print(f"[{i}] {card.title}")
        print(f"     Type: {card.lead_type.value}")
        print(f"     Subtitle: {card.subtitle}")
        print(f"     Why relevant: {card.why_relevant}")
        print(f"     Confidence: {card.confidence:.0%}")
        print(f"     Sources: {[str(u) for u in card.source_urls]}")
        print(f"     Action: {card.action_plan}")
        if card.date:
            print(f"     Date: {card.date}")
        if card.location:
            print(f"     Location: {card.location}")
        print()


if __name__ == "__main__":
    asyncio.run(main())

from __future__ import annotations

import uuid
from datetime import datetime
from enum import Enum
from typing import Union

from pydantic import BaseModel, HttpUrl, field_validator, model_validator


class LeadType(str, Enum):
    EVENT = "event"
    PERSON = "person"
    COMMUNITY = "community"
    COMPANY = "company"
    RESOURCE = "resource"


class ProfileInput(BaseModel):
    """Raw user input before parsing."""

    bio_text: str | None = None
    resume_text: str | None = None
    target_industries: list[str] = []
    target_roles: list[str] = []
    target_locations: list[str] = []
    interests: list[str] = []


class ProfileSummary(BaseModel):
    """Structured profile after Claude parses the input."""

    name: str | None = None
    education: str | None = None
    skills: list[str]
    experience_summary: str
    target_roles: list[str]
    target_industries: list[str]
    locations: list[str]
    angles: list[str]  # specific hooks the agent can use for matching
    raw_input: ProfileInput


class LeadCard(BaseModel):
    """A single actionable lead returned to the user."""

    id: str = ""
    lead_type: LeadType
    title: str
    subtitle: str
    why_relevant: str
    source_urls: list[HttpUrl]
    action_plan: str
    outreach_message: str | None = None
    date: datetime | None = None
    location: str | None = None
    platform: str | None = None
    confidence: float = 0.0

    @model_validator(mode="after")
    def assign_id(self) -> "LeadCard":
        if not self.id:
            self.id = str(uuid.uuid4())
        return self

    @field_validator("source_urls")
    @classmethod
    def must_have_source(cls, v: list[HttpUrl]) -> list[HttpUrl]:
        if not v:
            raise ValueError("LeadCard must have at least one source URL")
        return v

    @field_validator("confidence")
    @classmethod
    def clamp_confidence(cls, v: float) -> float:
        return max(0.0, min(1.0, v))


class SearchRequest(BaseModel):
    profile: ProfileSummary
    max_results_per_category: int = 5


class FindPeopleRequest(BaseModel):
    event_card: LeadCard
    profile: ProfileSummary
    max_results: int = 5


class StreamEvent(BaseModel):
    """SSE event wrapper."""

    event_type: str  # "card", "status", "error", "done"
    data: Union[LeadCard, str]

    model_config = {"arbitrary_types_allowed": True}

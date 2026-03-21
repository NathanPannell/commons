import asyncio
import logging

from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from agent.search_agent import find_people_from_event, run_search
from models.schemas import FindPeopleRequest, LeadCard, SearchRequest, StreamEvent

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/search")
async def search(request: SearchRequest) -> StreamingResponse:
    """Stream search results as Server-Sent Events.

    Each SSE event is a JSON-serialized StreamEvent with event_type:
    - "status": progress message (string)
    - "card":   a LeadCard object
    - "error":  error message (string)
    - "done":   search complete (string)
    """
    return StreamingResponse(
        _event_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


async def _event_generator(request: SearchRequest):
    """Yield SSE-formatted strings from the search agent."""
    try:
        async for event in run_search(request.profile, request.max_results_per_category):
            yield _format_sse(event)
    except Exception as e:
        logger.error("Fatal error in search stream: %s", e)
        error_event = StreamEvent(event_type="error", data=f"Fatal search error: {e}")
        yield _format_sse(error_event)
        done_event = StreamEvent(event_type="done", data="Search ended due to error.")
        yield _format_sse(done_event)


@router.post("/search/people-from-event")
async def people_from_event(request: FindPeopleRequest) -> StreamingResponse:
    """Stream person LeadCards found from an event's speakers/organizers."""
    return StreamingResponse(
        _find_people_generator(request),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )


async def _find_people_generator(request: FindPeopleRequest):
    yield _format_sse(StreamEvent(event_type="status", data=f"Fetching '{request.event_card.title}' page..."))
    try:
        cards = await find_people_from_event(request.event_card, request.profile, request.max_results)
        if not cards:
            yield _format_sse(StreamEvent(event_type="status", data="No speakers or organizers found."))
        else:
            yield _format_sse(StreamEvent(event_type="status", data=f"Found {len(cards)} people."))
            for card in cards:
                yield _format_sse(StreamEvent(event_type="card", data=card))
    except Exception as e:
        logger.error("Fatal error in find_people stream: %s", e)
        yield _format_sse(StreamEvent(event_type="error", data=f"Error finding people: {e}"))
    yield _format_sse(StreamEvent(event_type="done", data="Done."))


def _format_sse(event: StreamEvent) -> str:
    """Serialize a StreamEvent as an SSE data line."""
    if isinstance(event.data, LeadCard):
        payload = event.model_copy(update={"data": event.data.model_dump(mode="json")})
        return f"data: {payload.model_dump_json()}\n\n"
    return f"data: {event.model_dump_json()}\n\n"

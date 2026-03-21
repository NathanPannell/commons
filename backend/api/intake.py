import io
import json

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from agent.intake_agent import parse_profile
from models.schemas import ProfileInput, ProfileSummary

router = APIRouter()


@router.post("/intake", response_model=ProfileSummary)
async def intake(
    # JSON body path
    body: str | None = Form(default=None),
    # Multipart path
    bio_text: str | None = Form(default=None),
    resume_file: UploadFile | None = File(default=None),
    target_industries: str = Form(default="[]"),
    target_roles: str = Form(default="[]"),
    target_locations: str = Form(default="[]"),
    interests: str = Form(default="[]"),
) -> ProfileSummary:
    """Parse raw user input into a structured ProfileSummary.

    Accepts either:
    - application/json: {"bio_text": "...", "target_roles": [...], ...}
    - multipart/form-data: bio_text field + optional resume PDF file upload
    """
    # If a raw JSON body string was passed via the 'body' form field, parse it
    if body:
        try:
            data = json.loads(body)
            profile_input = ProfileInput.model_validate(data)
        except Exception as e:
            raise HTTPException(status_code=422, detail=f"Invalid JSON body: {e}")
    else:
        resume_text: str | None = None
        if resume_file and resume_file.filename:
            resume_text = await _extract_pdf_text(resume_file)

        try:
            industries = json.loads(target_industries)
            roles = json.loads(target_roles)
            locations = json.loads(target_locations)
            parsed_interests = json.loads(interests)
        except json.JSONDecodeError:
            industries, roles, locations, parsed_interests = [], [], [], []

        profile_input = ProfileInput(
            bio_text=bio_text or None,
            resume_text=resume_text,
            target_industries=industries,
            target_roles=roles,
            target_locations=locations,
            interests=parsed_interests,
        )

    try:
        summary = await parse_profile(profile_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile parsing failed: {e}")

    return summary


async def _extract_pdf_text(upload: UploadFile) -> str:
    """Extract plain text from an uploaded PDF using pdfplumber."""
    import pdfplumber

    contents = await upload.read()
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(contents)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


# Pure JSON endpoint variant so curl testing is easy
@router.post("/intake/json", response_model=ProfileSummary)
async def intake_json(profile_input: ProfileInput) -> ProfileSummary:
    """Convenience endpoint accepting a plain JSON ProfileInput body."""
    try:
        return await parse_profile(profile_input)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile parsing failed: {e}")

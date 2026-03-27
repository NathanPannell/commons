# Commons

(Won 2nd place at the Claude Builder's Club x UvicHacks Hackathon in 2026!)

An AI-powered lead generation platform for job seekers. Submit your profile and target preferences, and Commons surfaces actionable leads — events, people, communities, companies, and resources — with ready-to-send outreach messages.

## How It Works

1. **Intake** — Paste your bio or upload a resume (PDF). Specify target roles, industries, and locations.
2. **Parse** — An AI agent extracts your skills, experience, and searchable "angles" into a structured profile.
3. **Search** — Five parallel AI agents run web searches across lead categories simultaneously.
4. **Results** — Lead cards stream back in real time, each with context on relevance and a draft outreach message.

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Python, FastAPI, Uvicorn |
| LLM | Claude Haiku 4.5 (Anthropic SDK) |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Serving | Docker, Nginx |

## Prerequisites

- Docker & Docker Compose
- A [Moonshot API key](https://platform.moonshot.ai)

## Quick Start

```bash
cp .env.example .env
# Add your key to .env:
# ANTHROPIC_API_KEY=sk-...

docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

## Local Development

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev  # http://localhost:5173
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/intake` | Parse profile from form + optional PDF |
| `POST` | `/api/intake/json` | Parse profile from JSON body |
| `POST` | `/api/search` | Stream lead cards (SSE) |
| `POST` | `/api/search/people-from-event` | Stream speaker/organizer profiles from an event (SSE) |

Search endpoints return Server-Sent Events with types: `agent_status`, `card`, `error`, `done`.

## Lead Categories

Each search run launches five agents in parallel:

- **Events** — Conferences, meetups, webinars
- **People** — Individuals worth connecting with
- **Communities** — Discord servers, Slack groups, forums
- **Companies** — Employers matching your skills and location
- **Resources** — Courses, certifications, job boards

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | API key for the claude-haiku-4-5 model |

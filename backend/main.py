import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.health import router as health_router
from api.intake import router as intake_router
from api.search import router as search_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="BridgeIn API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/api")
app.include_router(intake_router, prefix="/api")
app.include_router(search_router, prefix="/api")

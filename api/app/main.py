"""DevPulse API — developer analytics over a ClickHouse event stream."""
import os
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import analytics
from .db import bootstrap_schema
from .seed import seed
from .models import Summary, VelocityPoint, DeployPoint, AuthorStat

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("devpulse")

app = FastAPI(title="DevPulse API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup() -> None:
    bootstrap_schema()
    if os.getenv("SEED_ON_START", "true").lower() == "true":
        inserted = seed()
        if inserted:
            log.info("Seeded %d sample events", inserted)


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.get("/api/summary", response_model=Summary)
def get_summary() -> dict:
    return analytics.summary()


@app.get("/api/velocity", response_model=list[VelocityPoint])
def get_velocity() -> list[dict]:
    return analytics.velocity()


@app.get("/api/deploys", response_model=list[DeployPoint])
def get_deploys() -> list[dict]:
    return analytics.deploy_frequency()


@app.get("/api/authors", response_model=list[AuthorStat])
def get_authors() -> list[dict]:
    return analytics.top_authors()

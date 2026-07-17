"""Pydantic response models for the DevPulse API."""
from pydantic import BaseModel


class Summary(BaseModel):
    total_commits: int
    total_deploys: int
    deploy_success_rate: float
    avg_build_ms: float
    active_authors: int


class VelocityPoint(BaseModel):
    week: str
    commits: int
    prs_merged: int


class DeployPoint(BaseModel):
    date: str
    deploys: int
    failures: int


class AuthorStat(BaseModel):
    author: str
    commits: int
    additions: int
    deletions: int

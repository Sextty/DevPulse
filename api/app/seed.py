"""Generate deterministic-ish sample engineering events for the last ~120 days."""
import random
from datetime import datetime, timedelta

from .db import get_client, CLICKHOUSE_DB

REPOS = ["web-app", "api-gateway", "mobile", "infra"]
AUTHORS = ["alina", "marcus", "wassim", "priya", "diego", "yuki"]
BRANCHES = ["main", "feature/auth", "fix/cache", "release/2.1", "chore/deps"]


def row_count() -> int:
    c = get_client(CLICKHOUSE_DB)
    return int(c.query("SELECT count() FROM events").first_row[0])


def seed(days: int = 120) -> int:
    """Insert sample events if the table is empty. Returns rows inserted."""
    if row_count() > 0:
        return 0

    rng = random.Random(42)
    now = datetime.utcnow()
    rows: list[list] = []

    for d in range(days):
        day = now - timedelta(days=d)
        # more activity on weekdays
        weekday_factor = 1.0 if day.weekday() < 5 else 0.3
        commits_today = int(rng.randint(4, 22) * weekday_factor)

        for _ in range(commits_today):
            ts = day - timedelta(
                hours=rng.randint(0, 23), minutes=rng.randint(0, 59)
            )
            author = rng.choice(AUTHORS)
            repo = rng.choice(REPOS)
            rows.append([
                ts, repo, author, "commit", rng.choice(BRANCHES),
                0, "success", rng.randint(3, 320), rng.randint(0, 140),
            ])

        # a few PRs merged
        for _ in range(int(rng.randint(0, 4) * weekday_factor)):
            ts = day - timedelta(hours=rng.randint(9, 18))
            rows.append([
                ts, rng.choice(REPOS), rng.choice(AUTHORS), "pr_merged",
                "main", 0, "success", rng.randint(50, 900), rng.randint(10, 400),
            ])

        # builds
        for _ in range(rng.randint(2, 10)):
            ts = day - timedelta(hours=rng.randint(0, 23))
            ok = rng.random() > 0.12
            rows.append([
                ts, rng.choice(REPOS), rng.choice(AUTHORS), "build",
                rng.choice(BRANCHES), rng.randint(40_000, 480_000),
                "success" if ok else "failed", 0, 0,
            ])

        # deploys (fewer)
        for _ in range(rng.randint(0, 3)):
            ts = day - timedelta(hours=rng.randint(10, 20))
            ok = rng.random() > 0.09
            rows.append([
                ts, rng.choice(REPOS), rng.choice(AUTHORS), "deploy",
                "main", rng.randint(20_000, 210_000),
                "success" if ok else "failed", 0, 0,
            ])

    c = get_client(CLICKHOUSE_DB)
    c.insert(
        "events",
        rows,
        column_names=[
            "ts", "repo", "author", "event_type", "branch",
            "duration_ms", "status", "additions", "deletions",
        ],
    )
    return len(rows)


if __name__ == "__main__":
    from .db import bootstrap_schema
    bootstrap_schema()
    print(f"Inserted {seed()} events")

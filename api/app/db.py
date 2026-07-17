"""ClickHouse client factory and schema bootstrap."""
import os
import clickhouse_connect

CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "localhost")
CLICKHOUSE_PORT = int(os.getenv("CLICKHOUSE_PORT", "8123"))
CLICKHOUSE_USER = os.getenv("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "")
CLICKHOUSE_DB = os.getenv("CLICKHOUSE_DB", "devpulse")


def get_client(database: str | None = None):
    """Return a ClickHouse client. Pass database=None to connect without a db
    (used while bootstrapping the database itself)."""
    return clickhouse_connect.get_client(
        host=CLICKHOUSE_HOST,
        port=CLICKHOUSE_PORT,
        username=CLICKHOUSE_USER,
        password=CLICKHOUSE_PASSWORD,
        database=database if database is not None else "",
    )


def bootstrap_schema() -> None:
    """Create the database and events table if they don't exist yet."""
    root = get_client(database="default")
    root.command(f"CREATE DATABASE IF NOT EXISTS {CLICKHOUSE_DB}")

    client = get_client(CLICKHOUSE_DB)
    client.command(
        """
        CREATE TABLE IF NOT EXISTS events (
            ts          DateTime64(3),
            repo        LowCardinality(String),
            author      LowCardinality(String),
            event_type  LowCardinality(String),   -- commit | pr_opened | pr_merged | deploy | build
            branch      String,
            duration_ms UInt32,                     -- build/deploy duration; 0 for commits
            status      LowCardinality(String),     -- success | failed | pending
            additions   UInt32,
            deletions   UInt32
        )
        ENGINE = MergeTree
        ORDER BY (repo, ts)
        """
    )

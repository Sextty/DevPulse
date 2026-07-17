"""Aggregation queries over the events table."""
from .db import get_client, CLICKHOUSE_DB


def _client():
    return get_client(CLICKHOUSE_DB)


def summary() -> dict:
    c = _client()
    row = c.query(
        """
        SELECT
            countIf(event_type = 'commit')                          AS total_commits,
            countIf(event_type = 'deploy')                          AS total_deploys,
            round(100 * countIf(event_type = 'deploy' AND status = 'success')
                  / greatest(countIf(event_type = 'deploy'), 1), 1) AS deploy_success_rate,
            round(avgIf(duration_ms, event_type = 'build'), 0)      AS avg_build_ms,
            uniqExact(author)                                       AS active_authors
        FROM events
        """
    ).first_row
    return {
        "total_commits": int(row[0]),
        "total_deploys": int(row[1]),
        "deploy_success_rate": float(row[2] or 0),
        "avg_build_ms": float(row[3] or 0),
        "active_authors": int(row[4]),
    }


def velocity() -> list[dict]:
    c = _client()
    rows = c.query(
        """
        SELECT
            toStartOfWeek(ts)                       AS week,
            countIf(event_type = 'commit')          AS commits,
            countIf(event_type = 'pr_merged')       AS prs_merged
        FROM events
        GROUP BY week
        ORDER BY week
        """
    ).result_rows
    return [
        {"week": str(r[0]), "commits": int(r[1]), "prs_merged": int(r[2])}
        for r in rows
    ]


def deploy_frequency() -> list[dict]:
    c = _client()
    rows = c.query(
        """
        SELECT
            toDate(ts)                                          AS date,
            countIf(event_type = 'deploy')                      AS deploys,
            countIf(event_type = 'deploy' AND status = 'failed') AS failures
        FROM events
        WHERE event_type = 'deploy'
        GROUP BY date
        ORDER BY date
        """
    ).result_rows
    return [
        {"date": str(r[0]), "deploys": int(r[1]), "failures": int(r[2])}
        for r in rows
    ]


def top_authors(limit: int = 8) -> list[dict]:
    c = _client()
    rows = c.query(
        """
        SELECT
            author,
            countIf(event_type = 'commit') AS commits,
            sum(additions)                 AS additions,
            sum(deletions)                 AS deletions
        FROM events
        GROUP BY author
        ORDER BY commits DESC
        LIMIT {limit:UInt32}
        """,
        parameters={"limit": limit},
    ).result_rows
    return [
        {
            "author": r[0],
            "commits": int(r[1]),
            "additions": int(r[2]),
            "deletions": int(r[3]),
        }
        for r in rows
    ]

# DevPulse — Developer Analytics Dashboard

Real-time engineering metrics over a ClickHouse event stream: team velocity,
deploy frequency, build success rate, and top contributors — visualised with D3.
Every metric can be sliced **per repository** via the filter in the top bar
(`?repo=` on every endpoint, parameterized in ClickHouse).

![stack](https://img.shields.io/badge/stack-React%20·%20D3%20·%20FastAPI%20·%20ClickHouse-10b981)

**▶ [Try the live demo](https://portfoliowassim.vercel.app/demo/devpulse)** — runs right in your browser, no setup.

## Stack

| Tier | Tech |
|------|------|
| Frontend | React + Vite, **D3.js** (grouped bars, area/line charts) |
| API | **Python + FastAPI**, `clickhouse-connect` |
| Store | **ClickHouse** (`MergeTree`, columnar analytics) |
| Runtime | Docker Compose |

## Quickstart

```bash
docker compose up --build
```

Then open:

- **Dashboard** → http://localhost:5173
- **API docs** → http://localhost:8000/docs
- **ClickHouse HTTP** → http://localhost:8123

On first start the API bootstraps the `devpulse.events` table and seeds ~120
days of sample commits, PRs, builds, and deploys (deterministic, seed=42), so
the dashboard has data immediately.

## Local development (without Docker)

You need a running ClickHouse. Then:

```bash
# API
cd api
pip install -r requirements.txt
export CLICKHOUSE_HOST=localhost
uvicorn app.main:app --reload

# Web (separate terminal) — Vite proxies /api to :8000
cd web
npm install
npm run dev
```

## API

| Route | Description |
|-------|-------------|
| `GET /api/summary` | commits, deploys, deploy success %, avg build time, active devs |
| `GET /api/velocity` | commits & PRs merged per week |
| `GET /api/deploys` | deploys & failures per day |
| `GET /api/authors` | top contributors by commit count |

## Data model

A single wide `events` table (`event_type` ∈ `commit | pr_opened | pr_merged | build | deploy`)
ordered by `(repo, ts)` — the shape ClickHouse is happiest aggregating. See
`api/app/db.py` for the schema and `api/app/analytics.py` for the queries.

## License

MIT © Wassim Jebali

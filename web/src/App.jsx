import React, { useEffect, useState } from "react";
import { api } from "./api.js";
import StatCard from "./components/StatCard.jsx";
import VelocityChart from "./components/VelocityChart.jsx";
import DeployChart from "./components/DeployChart.jsx";
import AuthorsTable from "./components/AuthorsTable.jsx";

export default function App() {
  const [summary, setSummary] = useState(null);
  const [velocity, setVelocity] = useState([]);
  const [deploys, setDeploys] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.summary(), api.velocity(), api.deploys(), api.authors()])
      .then(([s, v, d, a]) => {
        setSummary(s);
        setVelocity(v);
        setDeploys(d);
        setAuthors(a);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="pulse-dot" />
          DevPulse
        </div>
        <div className="subtitle">Developer Analytics Dashboard</div>
      </header>

      {error && (
        <div className="error">
          Could not reach the API ({error}). Is the backend running on :8000?
        </div>
      )}

      <section className="stat-grid">
        <StatCard label="Commits" value={summary?.total_commits} accent="#10b981" />
        <StatCard label="Deploys" value={summary?.total_deploys} accent="#38bdf8" />
        <StatCard
          label="Deploy success"
          value={summary ? `${summary.deploy_success_rate}%` : undefined}
          accent="#a78bfa"
        />
        <StatCard
          label="Avg build"
          value={summary ? `${Math.round(summary.avg_build_ms / 1000)}s` : undefined}
          accent="#f59e0b"
        />
        <StatCard label="Active devs" value={summary?.active_authors} accent="#f472b6" />
      </section>

      <section className="panel">
        <h2>Team velocity — commits &amp; PRs merged per week</h2>
        <VelocityChart data={velocity} />
      </section>

      <section className="panel">
        <h2>Deploy frequency</h2>
        <DeployChart data={deploys} />
      </section>

      <section className="panel">
        <h2>Top contributors</h2>
        <AuthorsTable rows={authors} />
      </section>

      <footer className="foot">
        DevPulse · FastAPI + ClickHouse + React/D3 · sample data seeded on start
      </footer>
    </div>
  );
}

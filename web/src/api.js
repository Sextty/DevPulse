// All requests are relative to the current origin. In dev, Vite proxies /api to
// the FastAPI server; in Docker, nginx proxies /api to the api service.
async function get(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

const withRepo = (path, repo) =>
  repo ? `${path}?repo=${encodeURIComponent(repo)}` : path;

export const api = {
  repos: () => get("/repos"),
  summary: (repo) => get(withRepo("/summary", repo)),
  velocity: (repo) => get(withRepo("/velocity", repo)),
  deploys: (repo) => get(withRepo("/deploys", repo)),
  authors: (repo) => get(withRepo("/authors", repo)),
};

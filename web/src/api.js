// All requests are relative to the current origin. In dev, Vite proxies /api to
// the FastAPI server; in Docker, nginx proxies /api to the api service.
async function get(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json();
}

export const api = {
  summary: () => get("/summary"),
  velocity: () => get("/velocity"),
  deploys: () => get("/deploys"),
  authors: () => get("/authors"),
};

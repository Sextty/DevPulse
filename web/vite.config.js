import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In local dev, proxy /api to the FastAPI server so the frontend code can use
// relative URLs (same as it does behind nginx in Docker).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8000",
    },
  },
});

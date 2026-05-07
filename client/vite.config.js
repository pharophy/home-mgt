import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: Number(process.env.VITE_PORT ?? 5173),
    // Root dev startup keeps the backend on a dedicated port to avoid the production listener.
    proxy: {
      "/api": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:3002",
        changeOrigin: true
      },
      "/generated-assets": {
        target: process.env.VITE_API_TARGET ?? "http://localhost:3002",
        changeOrigin: true
      }
    }
  },
  test: {
    environment: "happy-dom",
    setupFiles: "./src/test/setup.ts"
  }
});

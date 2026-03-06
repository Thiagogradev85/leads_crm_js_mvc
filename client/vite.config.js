import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Proxy para o backend em dev (evita problemas de CORS)
    proxy: {
      "/health": "http://localhost:8000",
      "/states": "http://localhost:8000",
      "/clients": "http://localhost:8000",
      "/import": "http://localhost:8000",
      "/catalogs": "http://localhost:8000",
      "/sellers": "http://localhost:8000",
    },
  },
  build: {
    outDir: "dist",
  },
});

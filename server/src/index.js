import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS: em dev permite localhost, em produção permite tudo (mesmo servidor)
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:5173"];
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));

// API routes (antes do static para ter prioridade)
app.use(router);

// Em produção, serve o frontend buildado (Vite)
const clientDist = path.resolve(__dirname, "../../client/dist");
app.use(express.static(clientDist));

// SPA fallback: qualquer rota não-API devolve o index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

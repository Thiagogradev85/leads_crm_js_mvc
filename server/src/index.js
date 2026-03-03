import express from "express";
import cors from "cors";
import router from "./routes/index.js";

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: true }));
app.use(express.json({ limit: "2mb" }));

app.use(router);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});

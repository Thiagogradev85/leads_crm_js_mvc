import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ClientController } from "../controllers/ClientController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Garante que a pasta de uploads existe
const uploadDir = path.resolve(__dirname, "../../data/tmp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

router.get("/health", ClientController.health);
router.get("/states", ClientController.states);
router.get("/clients", ClientController.list);
router.post("/clients", ClientController.create);
router.put("/clients/:id", ClientController.update);
router.delete("/clients/:id", ClientController.delete);
router.post("/import", upload.single("file"), ClientController.import);

export default router;

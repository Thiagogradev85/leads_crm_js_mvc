import { Database } from "bun:sqlite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");
export const db = new Database(dbPath);

// Apply schema
const schemaPath = path.resolve(__dirname, "./schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

// Helpers
export function nowIso() {
  return new Date().toISOString();
}

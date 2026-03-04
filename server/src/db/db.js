import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Em produção (Render), usa disco persistente se disponível
const dataDir = process.env.DATA_DIR || path.resolve(__dirname, "../../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "app.db");

// Auto-detect runtime: Bun usa bun:sqlite, Node usa better-sqlite3
let db;
if (typeof globalThis.Bun !== "undefined") {
  const { Database } = await import("bun:sqlite");
  db = new Database(dbPath);
} else {
  const BetterSqlite3 = (await import("better-sqlite3")).default;
  db = new BetterSqlite3(dbPath);
}
export { db };

// Apply schema
const schemaPath = path.resolve(__dirname, "./schema.sql");
const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

// Helpers
export function nowIso() {
  return new Date().toISOString();
}

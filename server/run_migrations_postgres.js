// Script Node.js para rodar migrations PostgreSQL no Neon.tech automaticamente
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  const migrationsDir = path.resolve(__dirname, "migrations");
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith("_postgres.sql"))
    .sort();
  await client.connect();
  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
    console.log(`Executando migration: ${file}`);
    await client.query(sql);
  }
  await client.end();
  console.log("Migrations aplicadas com sucesso!");
}

runMigrations().catch(e => {
  console.error(e);
  process.exit(1);
});

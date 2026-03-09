// db.postgres.js - conexão e helpers para PostgreSQL (Neon.tech)
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on("error", (err) => {
  console.error("Erro inesperado no pool do PostgreSQL:", err);
});

export default pool;
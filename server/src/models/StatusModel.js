import pool from "../db/db.postgres.js";

export const StatusModel = {
  async list() {
    const { rows } = await pool.query("SELECT id, name FROM status ORDER BY id");
    return rows;
  },
};

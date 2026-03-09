import pool from "../db/db.postgres.js";
function nowIso() { return new Date().toISOString(); }

export const ObservationModel = {
  async listByClient(clientId) {
    const result = await pool.query(
      "SELECT * FROM observations WHERE client_id = $1 ORDER BY created_at DESC",
      [clientId]
    );
    return result.rows;
  },

  async create(clientId, { type = "observacao", content }) {
    if (!content || !String(content).trim()) throw new Error("Conteúdo é obrigatório");
    const now = nowIso();
    const result = await pool.query(
      "INSERT INTO observations (client_id, type, content, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [clientId, type, String(content).trim(), now]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      "DELETE FROM observations WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  },
};

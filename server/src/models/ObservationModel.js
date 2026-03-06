import { client } from "../db/db.postgres.js";
import { nowIso } from "../db/db.js";

export const ObservationModel = {
  async listByClient(clientId) {
    const result = await client.query(
      "SELECT * FROM observations WHERE client_id = $1 ORDER BY created_at DESC",
      [clientId]
    );
    return result.rows;
  },

  async create(clientId, { type = "observacao", content }) {
    if (!content || !String(content).trim()) throw new Error("Conteúdo é obrigatório");
    const now = nowIso();
    const result = await client.query(
      "INSERT INTO observations (client_id, type, content, created_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [clientId, type, String(content).trim(), now]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await client.query(
      "DELETE FROM observations WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  },
};

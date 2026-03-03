import { db, nowIso } from "../db/db.js";

export const ObservationModel = {
  listByClient(clientId) {
    return db
      .prepare("SELECT * FROM observations WHERE client_id = ? ORDER BY datetime(created_at) DESC")
      .all(clientId);
  },

  create(clientId, { type = "observacao", content }) {
    if (!content || !String(content).trim()) throw new Error("Conteúdo é obrigatório");

    const stmt = db.prepare(`
      INSERT INTO observations (client_id, type, content, created_at)
      VALUES ($client_id, $type, $content, $created_at)
    `);
    const res = stmt.run({
      $client_id: clientId,
      $type: type,
      $content: String(content).trim(),
      $created_at: nowIso(),
    });
    return db.prepare("SELECT * FROM observations WHERE id = ?").get(res.lastInsertRowid);
  },

  delete(id) {
    const existing = db.prepare("SELECT * FROM observations WHERE id = ?").get(id);
    if (!existing) return false;
    db.prepare("DELETE FROM observations WHERE id = ?").run(id);
    return true;
  },
};

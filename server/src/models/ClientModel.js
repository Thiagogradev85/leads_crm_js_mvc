import { db, nowIso } from "../db/db.js";

export const ClientModel = {
  list({ uf, status, q } = {}) {
    let sql = "SELECT * FROM clients WHERE 1=1";
    const params = {};

    if (uf) {
      sql += " AND uf = @uf";
      params.uf = uf.toUpperCase();
    }
    if (status) {
      sql += " AND status = @status";
      params.status = status;
    }
    if (q) {
      sql += " AND (lower(loja) LIKE @q OR lower(cidade) LIKE @q OR lower(email) LIKE @q OR lower(whatsapp) LIKE @q)";
      params.q = `%${q.toLowerCase()}%`;
    }

    // Prioridade: WhatsApp primeiro, depois Capital, depois updated_at
    sql += `
      ORDER BY
        CASE WHEN trim(whatsapp) <> '' THEN 0 ELSE 1 END,
        CASE WHEN lower(prioridade) LIKE '%capital%' THEN 0 ELSE 1 END,
        datetime(updated_at) DESC,
        lower(cidade) ASC,
        lower(loja) ASC
    `;

    return db.prepare(sql).all(params);
  },

  get(id) {
    return db.prepare("SELECT * FROM clients WHERE id = ?").get(id);
  },

  states() {
    return db.prepare("SELECT DISTINCT uf FROM clients WHERE uf <> '' ORDER BY uf ASC").all().map(r => r.uf);
  },

  upsertByKey(payload) {
    const loja = (payload.loja || "").trim();
    const cidade = (payload.cidade || "").trim();
    const uf = (payload.uf || "").trim().toUpperCase();

    if (!loja || !uf) throw new Error("Campos obrigatórios: loja, uf");

    const existing = db.prepare(
      "SELECT * FROM clients WHERE lower(loja)=lower(?) AND lower(cidade)=lower(?) AND uf=?"
    ).get(loja, cidade, uf);

    const data = {
      prioridade: payload.prioridade ?? "",
      loja,
      cidade,
      uf,
      endereco: payload.endereco ?? "",
      telefone: payload.telefone ?? "",
      whatsapp: payload.whatsapp ?? "",
      email: payload.email ?? "",
      fonte: payload.fonte ?? "",
      temperatura: payload.temperatura ?? "",
      status: payload.status ?? "enviado",
      updated_at: nowIso(),
    };

    if (existing) {
      // Update only non-empty fields (avoids overwriting good data with blanks)
      const merged = { ...existing };
      for (const k of Object.keys(data)) {
        const v = data[k];
        if (v !== null && v !== undefined && String(v).trim() !== "") merged[k] = v;
      }
      db.prepare(`
        UPDATE clients SET
          prioridade=@prioridade, endereco=@endereco, telefone=@telefone, whatsapp=@whatsapp,
          email=@email, fonte=@fonte, temperatura=@temperatura, status=@status, updated_at=@updated_at
        WHERE id=@id
      `).run({ ...merged, id: existing.id });
      return this.get(existing.id);
    } else {
      const created_at = nowIso();
      const stmt = db.prepare(`
        INSERT INTO clients (prioridade, loja, cidade, uf, endereco, telefone, whatsapp, email, fonte, temperatura, status, created_at, updated_at)
        VALUES (@prioridade, @loja, @cidade, @uf, @endereco, @telefone, @whatsapp, @email, @fonte, @temperatura, @status, @created_at, @updated_at)
      `);
      const res = stmt.run({ ...data, created_at, updated_at: created_at });
      return this.get(res.lastInsertRowid);
    }
  },

  update(id, payload) {
    const existing = this.get(id);
    if (!existing) return null;

    const patch = { ...existing };
    for (const [k, v] of Object.entries(payload)) {
      if (v === undefined) continue;
      if (k === "uf" && v) patch.uf = String(v).trim().toUpperCase();
      else patch[k] = v ?? "";
    }
    patch.updated_at = nowIso();

    db.prepare(`
      UPDATE clients SET
        prioridade=@prioridade, loja=@loja, cidade=@cidade, uf=@uf,
        endereco=@endereco, telefone=@telefone, whatsapp=@whatsapp, email=@email,
        fonte=@fonte, temperatura=@temperatura, status=@status, updated_at=@updated_at
      WHERE id=@id
    `).run({ ...patch, id });

    return this.get(id);
  },

  delete(id) {
    const existing = this.get(id);
    if (!existing) return false;
    db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    return true;
  },
};

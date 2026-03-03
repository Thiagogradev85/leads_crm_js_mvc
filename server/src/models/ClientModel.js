import { db, nowIso } from "../db/db.js";

// Todos os 27 estados do Brasil
const ALL_UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SE","SP","TO"
];

export const ClientModel = {
  list({ uf, status, q } = {}) {
    let sql = "SELECT * FROM clients WHERE 1=1";
    const params = {};

    if (uf) {
      sql += " AND uf = $uf";
      params.$uf = uf.toUpperCase();
    }
    if (status) {
      sql += " AND status = $status";
      params.$status = status;
    }
    if (q) {
      sql += " AND (lower(loja) LIKE $q OR lower(cidade) LIKE $q OR lower(email) LIKE $q OR lower(whatsapp) LIKE $q)";
      params.$q = `%${q.toLowerCase()}%`;
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
    // Retorna todos os 27 estados, marcando quais têm clientes
    const withClients = new Set(
      db.prepare("SELECT DISTINCT uf FROM clients WHERE uf <> '' ORDER BY uf ASC").all().map(r => r.uf)
    );
    return ALL_UFS.map(uf => ({ uf, count: withClients.has(uf) ? this.countByUf(uf) : 0 }));
  },

  countByUf(uf) {
    const row = db.prepare("SELECT COUNT(*) as total FROM clients WHERE uf = ?").get(uf);
    return row?.total ?? 0;
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
      status: payload.status ?? "prospeccao",
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
          prioridade=$prioridade, endereco=$endereco, telefone=$telefone, whatsapp=$whatsapp,
          email=$email, fonte=$fonte, temperatura=$temperatura, status=$status, updated_at=$updated_at
        WHERE id=$id
      `).run({ $prioridade: merged.prioridade, $endereco: merged.endereco, $telefone: merged.telefone, $whatsapp: merged.whatsapp, $email: merged.email, $fonte: merged.fonte, $temperatura: merged.temperatura, $status: merged.status, $updated_at: merged.updated_at, $id: existing.id });
      return { ...this.get(existing.id), _existed: true };
    } else {
      const created_at = nowIso();
      const stmt = db.prepare(`
        INSERT INTO clients (prioridade, loja, cidade, uf, endereco, telefone, whatsapp, email, fonte, temperatura, status, created_at, updated_at)
        VALUES ($prioridade, $loja, $cidade, $uf, $endereco, $telefone, $whatsapp, $email, $fonte, $temperatura, $status, $created_at, $updated_at)
      `);
      const res = stmt.run({ $prioridade: data.prioridade, $loja: data.loja, $cidade: data.cidade, $uf: data.uf, $endereco: data.endereco, $telefone: data.telefone, $whatsapp: data.whatsapp, $email: data.email, $fonte: data.fonte, $temperatura: data.temperatura, $status: data.status, $created_at: created_at, $updated_at: created_at });
      return { ...this.get(res.lastInsertRowid), _existed: false };
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
        prioridade=$prioridade, loja=$loja, cidade=$cidade, uf=$uf,
        endereco=$endereco, telefone=$telefone, whatsapp=$whatsapp, email=$email,
        fonte=$fonte, temperatura=$temperatura, status=$status, updated_at=$updated_at
      WHERE id=$id
    `).run({ $prioridade: patch.prioridade, $loja: patch.loja, $cidade: patch.cidade, $uf: patch.uf, $endereco: patch.endereco, $telefone: patch.telefone, $whatsapp: patch.whatsapp, $email: patch.email, $fonte: patch.fonte, $temperatura: patch.temperatura, $status: patch.status, $updated_at: patch.updated_at, $id: id });

    return this.get(id);
  },

  delete(id) {
    const existing = this.get(id);
    if (!existing) return false;
    db.prepare("DELETE FROM clients WHERE id = ?").run(id);
    return true;
  },
};

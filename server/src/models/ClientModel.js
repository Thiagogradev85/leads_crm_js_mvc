import { client } from "../db/db.postgres.js";
import { nowIso } from "../db/db.js";

// Todos os 27 estados do Brasil
const ALL_UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SE","SP","TO"
];

export const ClientModel = {
  async list({ uf, status, q, page = 1, pageSize = 20 } = {}) {
    let sql = "SELECT * FROM clients WHERE 1=1";
    const params = [];
    let idx = 1;
    if (uf) {
      sql += ` AND uf = $${idx}`;
      params.push(uf.toUpperCase());
      idx++;
    }
    if (status) {
      sql += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (q) {
      sql += ` AND (lower(loja) LIKE $${idx} OR lower(cidade) LIKE $${idx} OR lower(email) LIKE $${idx} OR lower(whatsapp) LIKE $${idx})`;
      params.push(`%${q.toLowerCase()}%`);
      idx++;
    }
    // Conta o total antes do LIMIT
    const countSql = `SELECT COUNT(*) as total FROM clients WHERE 1=1` + sql.slice("SELECT * FROM clients WHERE 1=1".length);
    const countResult = await client.query(countSql, params);
    const total = Number(countResult.rows[0]?.total || 0);

    // Paginação
    const offset = (page - 1) * pageSize;
    sql += `
      ORDER BY
        CASE WHEN trim(whatsapp) <> '' THEN 0 ELSE 1 END,
        CASE WHEN lower(prioridade) LIKE '%capital%' THEN 0 ELSE 1 END,
        updated_at DESC,
        lower(cidade) ASC,
        lower(loja) ASC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(pageSize, offset);
    const result = await client.query(sql, params);
    return { rows: result.rows, total };
  },

  async get(id) {
    const result = await client.query("SELECT * FROM clients WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async states() {
    // Retorna todos os 27 estados, marcando quais têm clientes
    const result = await client.query("SELECT DISTINCT uf FROM clients WHERE uf <> '' ORDER BY uf ASC");
    const withClients = new Set(result.rows.map(r => r.uf));
    const counts = {};
    for (const uf of withClients) {
      counts[uf] = await this.countByUf(uf);
    }
    return ALL_UFS.map(uf => ({ uf, count: counts[uf] || 0 }));
  },

  async countByUf(uf) {
    const result = await client.query("SELECT COUNT(*) as total FROM clients WHERE uf = $1", [uf]);
    return result.rows[0]?.total ?? 0;
  },

  async upsertByKey(payload) {
    const loja = (payload.loja || "").trim();
    const cidade = (payload.cidade || "").trim();
    const uf = (payload.uf || "").trim().toUpperCase();
    if (!loja || !uf) throw new Error("Campos obrigatórios: loja, uf");
    const existing = await client.query(
      "SELECT * FROM clients WHERE lower(loja)=lower($1) AND lower(cidade)=lower($2) AND uf=$3",
      [loja, cidade, uf]
    );
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
    if (existing.rows.length) {
      // Update only non-empty fields (evita sobrescrever com vazio)
      const merged = { ...existing.rows[0] };
      for (const k of Object.keys(data)) {
        const v = data[k];
        if (v !== null && v !== undefined && String(v).trim() !== "") merged[k] = v;
      }
      await client.query(
        `UPDATE clients SET prioridade=$1, endereco=$2, telefone=$3, whatsapp=$4, email=$5, fonte=$6, temperatura=$7, status=$8, updated_at=$9 WHERE id=$10`,
        [merged.prioridade, merged.endereco, merged.telefone, merged.whatsapp, merged.email, merged.fonte, merged.temperatura, merged.status, merged.updated_at, merged.id]
      );
      const updated = await this.get(merged.id);
      return { ...updated, _existed: true };
    } else {
      const created_at = nowIso();
      const insert = await client.query(
        `INSERT INTO clients (prioridade, loja, cidade, uf, endereco, telefone, whatsapp, email, fonte, temperatura, status, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [data.prioridade, data.loja, data.cidade, data.uf, data.endereco, data.telefone, data.whatsapp, data.email, data.fonte, data.temperatura, data.status, created_at, created_at]
      );
      return { ...insert.rows[0], _existed: false };
    }
  },

  async update(id, payload) {
    const existing = await this.get(id);
    if (!existing) return null;
    const patch = { ...existing };
    for (const [k, v] of Object.entries(payload)) {
      if (v === undefined) continue;
      if (k === "uf" && v) patch.uf = String(v).trim().toUpperCase();
      else patch[k] = v ?? "";
    }
    patch.updated_at = nowIso();
    await client.query(
      `UPDATE clients SET prioridade=$1, loja=$2, cidade=$3, uf=$4, endereco=$5, telefone=$6, whatsapp=$7, email=$8, fonte=$9, temperatura=$10, status=$11, updated_at=$12 WHERE id=$13`,
      [patch.prioridade, patch.loja, patch.cidade, patch.uf, patch.endereco, patch.telefone, patch.whatsapp, patch.email, patch.fonte, patch.temperatura, patch.status, patch.updated_at, id]
    );
    return await this.get(id);
  },

  async delete(id) {
    const existing = await this.get(id);
    if (!existing) return false;
    await client.query("DELETE FROM clients WHERE id = $1", [id]);
    return true;
  },
};

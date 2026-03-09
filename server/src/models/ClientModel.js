import pool from "../db/db.postgres.js";
function nowIso() { return new Date().toISOString(); }

// Todos os 27 estados do Brasil
const ALL_UFS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG",
  "PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SE","SP","TO"
];

export const ClientModel = {
    async totalLeads() {
      const result = await pool.query("SELECT COUNT(*) as total FROM clients");
      return Number(result.rows[0]?.total || 0);
    },
  async list({ uf, status, q, page = 1, pageSize = 20 } = {}) {
    let sql = `SELECT c.*, s.nome as vendedor_nome, st.name as status_nome FROM clients c
      LEFT JOIN sellers s ON c.vendedor_id = s.id
      LEFT JOIN status st ON c.status_id = st.id
      WHERE 1=1`;
    let countSql = `SELECT COUNT(*) as total FROM clients c WHERE 1=1`;
    const params = [];
    const countParams = [];
    let idx = 1;
    let countIdx = 1;
    if (uf) {
      sql += ` AND c.uf = $${idx}`;
      countSql += ` AND c.uf = $${countIdx}`;
      params.push(uf.toUpperCase());
      countParams.push(uf.toUpperCase());
      idx++;
      countIdx++;
    }
    if (status) {
      sql += ` AND c.status_id = $${idx}`;
      countSql += ` AND c.status_id = $${countIdx}`;
      params.push(status);
      countParams.push(status);
      idx++;
      countIdx++;
    }
    if (q) {
      sql += ` AND (lower(c.loja) LIKE $${idx} OR lower(c.cidade) LIKE $${idx} OR lower(c.email) LIKE $${idx} OR lower(c.whatsapp) LIKE $${idx})`;
      countSql += ` AND (lower(c.loja) LIKE $${countIdx} OR lower(c.cidade) LIKE $${countIdx} OR lower(c.email) LIKE $${countIdx} OR lower(c.whatsapp) LIKE $${countIdx})`;
      params.push(`%${q.toLowerCase()}%`);
      countParams.push(`%${q.toLowerCase()}%`);
      idx++;
      countIdx++;
    }
    // Conta o total antes do LIMIT
    const countResult = await pool.query(countSql, countParams);
    const total = Number(countResult.rows[0]?.total || 0);

    // Paginação
    const offset = (page - 1) * pageSize;
    sql += `
      ORDER BY
        CASE WHEN trim(c.whatsapp) <> '' THEN 0 ELSE 1 END,
        CASE WHEN lower(c.prioridade) LIKE '%capital%' THEN 0 ELSE 1 END,
        c.updated_at DESC,
        lower(c.cidade) ASC,
        lower(c.loja) ASC
      LIMIT $${idx} OFFSET $${idx + 1}
    `;
    params.push(pageSize, offset);
    const result = await pool.query(sql, params);
    // Renomeia status_nome para status para compatibilidade frontend
    const rows = result.rows.map(r => ({ ...r, status: r.status_nome }));
    return { rows, total };
  },

  async get(id) {
    const result = await pool.query(
      `SELECT c.*, s.nome as vendedor_nome, st.name as status_nome FROM clients c
        LEFT JOIN sellers s ON c.vendedor_id = s.id
        LEFT JOIN status st ON c.status_id = st.id
        WHERE c.id = $1`,
      [id]
    );
    const row = result.rows[0];
    if (!row) return null;
    return { ...row, status: row.status_nome };
  },

  async states() {
    // Retorna todos os 27 estados, marcando quais têm clientes
    const result = await pool.query("SELECT DISTINCT uf FROM clients WHERE uf <> '' ORDER BY uf ASC");
    const withClients = new Set(result.rows.map(r => r.uf));
    const counts = {};
    for (const uf of withClients) {
      counts[uf] = await this.countByUf(uf);
    }
    return ALL_UFS.map(uf => ({ uf, count: counts[uf] || 0 }));
  },

  async countByUf(uf) {
    const result = await pool.query("SELECT COUNT(*) as total FROM clients WHERE uf = $1", [uf]);
    return result.rows[0]?.total ?? 0;
  },

  async upsertByKey(payload) {
    const loja = (payload.loja || "").trim();
    const cidade = (payload.cidade || "").trim();
    const uf = (payload.uf || "").trim().toUpperCase();
    if (!loja || !uf) throw new Error("Campos obrigatórios: loja, uf");
    const existing = await pool.query(
      "SELECT * FROM clients WHERE lower(loja)=lower($1) AND lower(cidade)=lower($2) AND uf=$3",
      [loja, cidade, uf]
    );
    // status_id obrigatório
    const status_id = payload.status_id ?? payload.statusId ?? payload.status_id ?? null;
    if (!status_id) throw new Error("status_id obrigatório");
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
      status_id,
      vendedor_id: payload.vendedor_id ?? null,
      updated_at: nowIso(),
    };
    if (existing.rows.length) {
      // Update only non-empty fields (evita sobrescrever com vazio)
      const merged = { ...existing.rows[0] };
      for (const k of Object.keys(data)) {
        const v = data[k];
        if (v !== null && v !== undefined && String(v).trim() !== "") merged[k] = v;
      }
      await pool.query(
        `UPDATE clients SET prioridade=$1, endereco=$2, telefone=$3, whatsapp=$4, email=$5, fonte=$6, temperatura=$7, status_id=$8, vendedor_id=$9, updated_at=$10 WHERE id=$11`,
        [merged.prioridade, merged.endereco, merged.telefone, merged.whatsapp, merged.email, merged.fonte, merged.temperatura, merged.status_id, merged.vendedor_id, merged.updated_at, merged.id]
      );
      const updated = await this.get(merged.id);
      return { ...updated, _existed: true };
    } else {
      const created_at = nowIso();
      const insert = await pool.query(
        `INSERT INTO clients (prioridade, loja, cidade, uf, endereco, telefone, whatsapp, email, fonte, temperatura, status_id, vendedor_id, created_at, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`,
        [data.prioridade, data.loja, data.cidade, data.uf, data.endereco, data.telefone, data.whatsapp, data.email, data.fonte, data.temperatura, data.status_id, data.vendedor_id, created_at, created_at]
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
    if (payload.vendedor_id !== undefined) patch.vendedor_id = payload.vendedor_id;
    if (payload.status_id !== undefined) patch.status_id = payload.status_id;
    patch.updated_at = nowIso();
    await pool.query(
      `UPDATE clients SET prioridade=$1, loja=$2, cidade=$3, uf=$4, endereco=$5, telefone=$6, whatsapp=$7, email=$8, fonte=$9, temperatura=$10, status_id=$11, vendedor_id=$12, updated_at=$13 WHERE id=$14`,
      [patch.prioridade, patch.loja, patch.cidade, patch.uf, patch.endereco, patch.telefone, patch.whatsapp, patch.email, patch.fonte, patch.temperatura, patch.status_id, patch.vendedor_id, patch.updated_at, id]
    );
    return await this.get(id);
  },

  async delete(id) {
    const existing = await this.get(id);
    if (!existing) return false;
    await pool.query("DELETE FROM clients WHERE id = $1", [id]);
    return true;
  },
};

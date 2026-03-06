import { client } from "../db/db.postgres.js";

export const SellerModel = {
  async list() {
    const result = await client.query("SELECT id, nome, email, ativo FROM sellers ORDER BY nome ASC");
    return result.rows;
  },

  async get(id) {
    const result = await client.query("SELECT id, nome, email, ativo FROM sellers WHERE id = $1", [id]);
    return result.rows[0] || null;
  },

  async create({ nome, email, ativo = true }) {
    if (!nome) throw new Error("Nome do vendedor é obrigatório");
    const result = await client.query(
      "INSERT INTO sellers (nome, email, ativo) VALUES ($1, $2, $3) RETURNING id, nome, email, ativo",
      [nome, email || null, ativo]
    );
    return result.rows[0];
  },

  async update(id, { nome, email, ativo }) {
    if (!nome) throw new Error("Nome do vendedor é obrigatório");
    const result = await client.query(
      "UPDATE sellers SET nome = $1, email = $2, ativo = $3 WHERE id = $4 RETURNING id, nome, email, ativo",
      [nome, email || null, ativo !== undefined ? ativo : true, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await client.query("DELETE FROM sellers WHERE id = $1 RETURNING *", [id]);
    return !!result.rows[0];
  },
};

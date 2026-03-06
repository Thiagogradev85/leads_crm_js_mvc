import { client } from "../db/db.postgres.js";
import { nowIso } from "../db/db.js";

export const CatalogModel = {
  // ─── Product Follow-ups ───

  async listProductFollowups(productId) {
    const result = await client.query(
      "SELECT * FROM catalog_product_followups WHERE product_id = $1 ORDER BY created_at DESC",
      [productId]
    );
    return result.rows;
  },


  async addProductFollowup(productId, message) {
    await client.query(
      "INSERT INTO catalog_product_followups (product_id, message, created_at) VALUES ($1, $2, $3)",
      [productId, message, nowIso()]
    );
    return this.listProductFollowups(productId);
  },


  async deleteProductFollowup(id) {
    const result = await client.query(
      "DELETE FROM catalog_product_followups WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  },
  // ─── Catalogs ───


  async listCatalogs() {
    const result = await client.query(
      "SELECT * FROM catalogs ORDER BY ativo DESC, created_at DESC"
    );
    return result.rows;
  },


  async getCatalog(id) {
    const result = await client.query(
      "SELECT * FROM catalogs WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },


  async createCatalog({ nome, mes_referencia }) {
    if (!nome || !mes_referencia) throw new Error("Nome e mês de referência são obrigatórios");
    const result = await client.query(
      "INSERT INTO catalogs (nome, mes_referencia, ativo, created_at) VALUES ($1, $2, 1, $3) RETURNING *",
      [nome, mes_referencia, nowIso()]
    );
    return result.rows[0];
  },


  async updateCatalog(id, data) {
    const cat = await this.getCatalog(id);
    if (!cat) return null;
    const nome = data.nome ?? cat.nome;
    const mes = data.mes_referencia ?? cat.mes_referencia;
    const termino = data.data_termino ?? cat.data_termino;
    const ativo = data.ativo !== undefined ? (data.ativo ? 1 : 0) : cat.ativo;
    await client.query(
      "UPDATE catalogs SET nome=$1, mes_referencia=$2, data_termino=$3, ativo=$4 WHERE id=$5",
      [nome, mes, termino, ativo, id]
    );
    return this.getCatalog(id);
  },


  async closeCatalog(id) {
    const cat = await this.getCatalog(id);
    if (!cat) return null;
    const now = nowIso().slice(0, 10); // YYYY-MM-DD
    await client.query(
      "UPDATE catalogs SET ativo=0, data_termino=$1 WHERE id=$2",
      [now, id]
    );
    return this.getCatalog(id);
  },


  async deleteCatalog(id) {
    const result = await client.query(
      "DELETE FROM catalogs WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  },

  // ─── Products (PostgreSQL) ───

  async listProducts(catalogId) {
    const result = await client.query(
      "SELECT * FROM catalog_products WHERE catalog_id = $1 ORDER BY modelo ASC",
      [catalogId]
    );
    return result.rows;
  },

  async getProduct(id) {
    const result = await client.query(
      "SELECT * FROM catalog_products WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },

  async upsertProduct(catalogId, payload) {
    const modelo = (payload.modelo || "").trim();
    if (!modelo) throw new Error("Modelo é obrigatório");
    // Verifica se já existe
    const existing = await client.query(
      "SELECT * FROM catalog_products WHERE catalog_id = $1 AND lower(modelo) = lower($2)",
      [catalogId, modelo]
    );
    const now = nowIso();
    if (existing.rows[0]) {
      await client.query(
        `UPDATE catalog_products SET
          tipo=$1, nome=$2, bateria=$3, motor=$4, pneus=$5,
          velocidade=$6, autonomia=$7, tempo_carga=$8, carregador=$9,
          impermeabilidade=$10, peso=$11, estoque=$12, extras=$13,
          preco=$14, suspensao=$15, freio=$16
        WHERE id=$17`,
        [
          payload.tipo || "scooter", payload.nome || "", payload.bateria || "", payload.motor || "",
          payload.pneus || "", payload.velocidade || "", payload.autonomia || "", payload.tempo_carga || "",
          payload.carregador || "", payload.impermeabilidade || "", payload.peso || "", payload.estoque ?? 0,
          payload.extras || "", payload.preco ?? 0, payload.suspensao || "", payload.freio || "", existing.rows[0].id
        ]
      );
      return { ...(await this.getProduct(existing.rows[0].id)), _updated: true };
    } else {
      const result = await client.query(
        `INSERT INTO catalog_products
          (catalog_id, tipo, modelo, nome, bateria, motor, pneus, velocidade, autonomia,
           tempo_carga, carregador, impermeabilidade, peso, estoque, extras, created_at, preco, suspensao, freio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
        RETURNING *`,
        [
          catalogId, payload.tipo || "scooter", modelo, payload.nome || "", payload.bateria || "",
          payload.motor || "", payload.pneus || "", payload.velocidade || "", payload.autonomia || "",
          payload.tempo_carga || "", payload.carregador || "", payload.impermeabilidade || "", payload.peso || "",
          payload.estoque ?? 0, payload.extras || "", now, payload.preco ?? 0, payload.suspensao || "", payload.freio || ""
        ]
      );
      return { ...(await this.getProduct(result.rows[0].id)), _new: true };
    }
  },

  async updateProduct(id, data) {
    const prod = await this.getProduct(id);
    if (!prod) return null;
    const fields = ["tipo", "modelo", "nome", "bateria", "motor", "pneus", "velocidade",
      "autonomia", "tempo_carga", "carregador", "impermeabilidade", "peso", "estoque", "extras", "preco", "suspensao", "freio"];
    const merged = { ...prod };
    for (const f of fields) {
      if (data[f] !== undefined) merged[f] = data[f];
    }
    await client.query(
      `UPDATE catalog_products SET
        tipo=$1, modelo=$2, nome=$3, bateria=$4, motor=$5, pneus=$6,
        velocidade=$7, autonomia=$8, tempo_carga=$9, carregador=$10,
        impermeabilidade=$11, peso=$12, estoque=$13, extras=$14,
        preco=$15, suspensao=$16, freio=$17
      WHERE id=$18`,
      [
        merged.tipo, merged.modelo, merged.nome, merged.bateria, merged.motor, merged.pneus,
        merged.velocidade, merged.autonomia, merged.tempo_carga, merged.carregador,
        merged.impermeabilidade, merged.peso, merged.estoque, merged.extras,
        merged.preco ?? 0, merged.suspensao || "", merged.freio || "", id
      ]
    );
    return await this.getProduct(id);
  },

  async deleteProduct(id) {
    const result = await client.query(
      "DELETE FROM catalog_products WHERE id = $1",
      [id]
    );
    return result.rowCount > 0;
  },

  async updateStock(id, estoque) {
    const prod = await this.getProduct(id);
    if (!prod) return null;
    await client.query(
      "UPDATE catalog_products SET estoque = $1 WHERE id = $2",
      [estoque, id]
    );
    return await this.getProduct(id);
  },
};

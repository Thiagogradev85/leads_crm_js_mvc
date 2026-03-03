import { db, nowIso } from "../db/db.js";

export const CatalogModel = {
  // ─── Catalogs ───

  listCatalogs() {
    return db.prepare("SELECT * FROM catalogs ORDER BY ativo DESC, datetime(created_at) DESC").all();
  },

  getCatalog(id) {
    return db.prepare("SELECT * FROM catalogs WHERE id = ?").get(id);
  },

  createCatalog({ nome, mes_referencia }) {
    if (!nome || !mes_referencia) throw new Error("Nome e mês de referência são obrigatórios");
    const stmt = db.prepare(
      "INSERT INTO catalogs (nome, mes_referencia, ativo, created_at) VALUES ($nome, $mes, 1, $now)"
    );
    stmt.run({ $nome: nome, $mes: mes_referencia, $now: nowIso() });
    const id = db.prepare("SELECT last_insert_rowid() as id").get().id;
    return this.getCatalog(id);
  },

  updateCatalog(id, data) {
    const cat = this.getCatalog(id);
    if (!cat) return null;
    const nome = data.nome ?? cat.nome;
    const mes = data.mes_referencia ?? cat.mes_referencia;
    const termino = data.data_termino ?? cat.data_termino;
    const ativo = data.ativo !== undefined ? (data.ativo ? 1 : 0) : cat.ativo;
    db.prepare(
      "UPDATE catalogs SET nome=$nome, mes_referencia=$mes, data_termino=$termino, ativo=$ativo WHERE id=$id"
    ).run({ $nome: nome, $mes: mes, $termino: termino, $ativo: ativo, $id: id });
    return this.getCatalog(id);
  },

  closeCatalog(id) {
    const cat = this.getCatalog(id);
    if (!cat) return null;
    const now = nowIso().slice(0, 10); // YYYY-MM-DD
    db.prepare("UPDATE catalogs SET ativo=0, data_termino=$termino WHERE id=$id").run({ $termino: now, $id: id });
    return this.getCatalog(id);
  },

  deleteCatalog(id) {
    const r = db.prepare("DELETE FROM catalogs WHERE id = ?").run(id);
    return r.changes > 0;
  },

  // ─── Products ───

  listProducts(catalogId) {
    return db.prepare("SELECT * FROM catalog_products WHERE catalog_id = ? ORDER BY modelo ASC").all(catalogId);
  },

  getProduct(id) {
    return db.prepare("SELECT * FROM catalog_products WHERE id = ?").get(id);
  },

  upsertProduct(catalogId, payload) {
    const modelo = (payload.modelo || "").trim();
    if (!modelo) throw new Error("Modelo é obrigatório");

    const existing = db.prepare(
      "SELECT * FROM catalog_products WHERE catalog_id = ? AND lower(modelo) = lower(?)"
    ).get(catalogId, modelo);

    const data = {
      $catalog_id: catalogId,
      $tipo: payload.tipo || "scooter",
      $modelo: modelo,
      $nome: payload.nome || "",
      $bateria: payload.bateria || "",
      $motor: payload.motor || "",
      $pneus: payload.pneus || "",
      $velocidade: payload.velocidade || "",
      $autonomia: payload.autonomia || "",
      $tempo_carga: payload.tempo_carga || "",
      $carregador: payload.carregador || "",
      $impermeabilidade: payload.impermeabilidade || "",
      $peso: payload.peso || "",
      $estoque: payload.estoque ?? 0,
      $extras: payload.extras || "",
      $now: nowIso(),
    };

    if (existing) {
      db.prepare(`
        UPDATE catalog_products SET
          tipo=$tipo, nome=$nome, bateria=$bateria, motor=$motor, pneus=$pneus,
          velocidade=$velocidade, autonomia=$autonomia, tempo_carga=$tempo_carga,
          carregador=$carregador, impermeabilidade=$impermeabilidade, peso=$peso,
          estoque=$estoque, extras=$extras
        WHERE id=$id
      `).run({ ...data, $id: existing.id });
      return { ...this.getProduct(existing.id), _updated: true };
    } else {
      db.prepare(`
        INSERT INTO catalog_products
          (catalog_id, tipo, modelo, nome, bateria, motor, pneus, velocidade, autonomia,
           tempo_carga, carregador, impermeabilidade, peso, estoque, extras, created_at)
        VALUES ($catalog_id, $tipo, $modelo, $nome, $bateria, $motor, $pneus, $velocidade,
                $autonomia, $tempo_carga, $carregador, $impermeabilidade, $peso, $estoque, $extras, $now)
      `).run(data);
      const id = db.prepare("SELECT last_insert_rowid() as id").get().id;
      return { ...this.getProduct(id), _new: true };
    }
  },

  updateProduct(id, data) {
    const prod = this.getProduct(id);
    if (!prod) return null;
    const fields = ["tipo", "modelo", "nome", "bateria", "motor", "pneus", "velocidade",
      "autonomia", "tempo_carga", "carregador", "impermeabilidade", "peso", "estoque", "extras"];
    const merged = { ...prod };
    for (const f of fields) {
      if (data[f] !== undefined) merged[f] = data[f];
    }
    db.prepare(`
      UPDATE catalog_products SET
        tipo=$tipo, modelo=$modelo, nome=$nome, bateria=$bateria, motor=$motor, pneus=$pneus,
        velocidade=$velocidade, autonomia=$autonomia, tempo_carga=$tempo_carga,
        carregador=$carregador, impermeabilidade=$impermeabilidade, peso=$peso,
        estoque=$estoque, extras=$extras
      WHERE id=$id
    `).run({
      $tipo: merged.tipo, $modelo: merged.modelo, $nome: merged.nome, $bateria: merged.bateria,
      $motor: merged.motor, $pneus: merged.pneus, $velocidade: merged.velocidade,
      $autonomia: merged.autonomia, $tempo_carga: merged.tempo_carga, $carregador: merged.carregador,
      $impermeabilidade: merged.impermeabilidade, $peso: merged.peso, $estoque: merged.estoque,
      $extras: merged.extras, $id: id,
    });
    return this.getProduct(id);
  },

  deleteProduct(id) {
    const r = db.prepare("DELETE FROM catalog_products WHERE id = ?").run(id);
    return r.changes > 0;
  },

  updateStock(id, estoque) {
    const prod = this.getProduct(id);
    if (!prod) return null;
    db.prepare("UPDATE catalog_products SET estoque = ? WHERE id = ?").run(estoque, id);
    return this.getProduct(id);
  },
};

import { CatalogModel } from "../models/CatalogModel.js";
import { parseCatalogPdf } from "../services/parseCatalogPdf.js";
import fs from "node:fs";

export const CatalogController = {
  // ─── Product Follow-ups ───
  async listProductFollowups(req, res) {
    const prodId = Number(req.params.prodId);
    const result = await CatalogModel.listProductFollowups(prodId);
    res.json(result);
  },

  async addProductFollowup(req, res) {
    const prodId = Number(req.params.prodId);
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Mensagem obrigatória" });
    const result = await CatalogModel.addProductFollowup(prodId, message);
    res.json(result);
  },

  async deleteProductFollowup(req, res) {
    const id = Number(req.params.fuId);
    const ok = await CatalogModel.deleteProductFollowup(id);
    if (!ok) return res.status(404).json({ error: "Follow-up não encontrado" });
    res.json({ deleted: true });
  },
  // ─── Catalogs ───

  async listCatalogs(req, res) {
    const result = await CatalogModel.listCatalogs();
    res.json(result);
  },

  async getCatalog(req, res) {
    const id = Number(req.params.id);
    const cat = await CatalogModel.getCatalog(id);
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });
    const products = await CatalogModel.listProducts(id);
    res.json({ ...cat, products });
  },

  async createCatalog(req, res) {
    try {
      const cat = await CatalogModel.createCatalog(req.body || {});
      res.json(cat);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  async updateCatalog(req, res) {
    const id = Number(req.params.id);
    const cat = await CatalogModel.updateCatalog(id, req.body || {});
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });
    res.json(cat);
  },

  async closeCatalog(req, res) {
    const id = Number(req.params.id);
    const cat = await CatalogModel.closeCatalog(id);
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });
    res.json(cat);
  },

  async deleteCatalog(req, res) {
    const id = Number(req.params.id);
    const ok = await CatalogModel.deleteCatalog(id);
    if (!ok) return res.status(404).json({ error: "Catálogo não encontrado" });
    res.json({ deleted: true });
  },

  // ─── Products ───

  async listProducts(req, res) {
    const catalogId = Number(req.params.id);
    const result = await CatalogModel.listProducts(catalogId);
    res.json(result);
  },

  async addProduct(req, res) {
    const catalogId = Number(req.params.id);
    try {
      // Garante que os campos estejam presentes e com valores padrão
      const payload = {
        ...req.body,
        preco: req.body.preco ?? 0,
        suspensao: req.body.suspensao ?? "",
        freio: req.body.freio ?? ""
      };
      const prod = await CatalogModel.upsertProduct(catalogId, payload);
      res.json(prod);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  async updateProduct(req, res) {
    const prodId = Number(req.params.prodId);
    // Garante que os campos estejam presentes e com valores padrão
    const payload = {
      ...req.body,
      preco: req.body.preco ?? 0,
      suspensao: req.body.suspensao ?? "",
      freio: req.body.freio ?? ""
    };
    const prod = await CatalogModel.updateProduct(prodId, payload);
    if (!prod) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(prod);
  },

  async deleteProduct(req, res) {
    const prodId = Number(req.params.prodId);
    const ok = await CatalogModel.deleteProduct(prodId);
    if (!ok) return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ deleted: true });
  },

  async updateStock(req, res) {
    const prodId = Number(req.params.prodId);
    const estoque = Number(req.body?.estoque ?? 0);
    const prod = await CatalogModel.updateStock(prodId, estoque);
    if (!prod) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(prod);
  },

  // ─── PDF Import ───

  async importPdf(req, res) {
    const catalogId = Number(req.params.id);
    const cat = CatalogModel.getCatalog(catalogId);
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });

    if (!req.file?.path) return res.status(400).json({ error: "Envie um arquivo .pdf" });

    try {
      const products = await parseCatalogPdf(req.file.path);
      let imported = 0;
      let updated = 0;

      for (const p of products) {
        const result = CatalogModel.upsertProduct(catalogId, p);
        if (result._updated) updated++;
        else imported++;
      }

      try { fs.unlinkSync(req.file.path); } catch (_) {}
      res.json({ ok: true, imported, updated, total: products.length });
    } catch (e) {
      try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch (_) {}
      res.status(400).json({ error: String(e.message || e) });
    }
  },
};

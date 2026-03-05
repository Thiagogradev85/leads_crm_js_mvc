  // ─── Product Follow-ups ───
  listProductFollowups(req, res) {
    const prodId = Number(req.params.prodId);
    res.json(CatalogModel.listProductFollowups(prodId));
  },

  addProductFollowup(req, res) {
    const prodId = Number(req.params.prodId);
    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Mensagem obrigatória" });
    res.json(CatalogModel.addProductFollowup(prodId, message));
  },

  deleteProductFollowup(req, res) {
    const id = Number(req.params.fuId);
    const ok = CatalogModel.deleteProductFollowup(id);
    if (!ok) return res.status(404).json({ error: "Follow-up não encontrado" });
    res.json({ deleted: true });
  },
import { CatalogModel } from "../models/CatalogModel.js";
import { parseCatalogPdf } from "../services/parseCatalogPdf.js";
import fs from "node:fs";

export const CatalogController = {
  // ─── Catalogs ───

  listCatalogs(req, res) {
    res.json(CatalogModel.listCatalogs());
  },

  getCatalog(req, res) {
    const id = Number(req.params.id);
    const cat = CatalogModel.getCatalog(id);
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });
    const products = CatalogModel.listProducts(id);
    res.json({ ...cat, products });
  },

  createCatalog(req, res) {
    try {
      const cat = CatalogModel.createCatalog(req.body || {});
      res.json(cat);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  updateCatalog(req, res) {
    const id = Number(req.params.id);
    const cat = CatalogModel.updateCatalog(id, req.body || {});
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });
    res.json(cat);
  },

  closeCatalog(req, res) {
    const id = Number(req.params.id);
    const cat = CatalogModel.closeCatalog(id);
    if (!cat) return res.status(404).json({ error: "Catálogo não encontrado" });
    res.json(cat);
  },

  deleteCatalog(req, res) {
    const id = Number(req.params.id);
    const ok = CatalogModel.deleteCatalog(id);
    if (!ok) return res.status(404).json({ error: "Catálogo não encontrado" });
    res.json({ deleted: true });
  },

  // ─── Products ───

  listProducts(req, res) {
    const catalogId = Number(req.params.id);
    res.json(CatalogModel.listProducts(catalogId));
  },

  addProduct(req, res) {
    const catalogId = Number(req.params.id);
    try {
      const prod = CatalogModel.upsertProduct(catalogId, req.body || {});
      res.json(prod);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  updateProduct(req, res) {
    const prodId = Number(req.params.prodId);
    const prod = CatalogModel.updateProduct(prodId, req.body || {});
    if (!prod) return res.status(404).json({ error: "Produto não encontrado" });
    res.json(prod);
  },

  deleteProduct(req, res) {
    const prodId = Number(req.params.prodId);
    const ok = CatalogModel.deleteProduct(prodId);
    if (!ok) return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ deleted: true });
  },

  updateStock(req, res) {
    const prodId = Number(req.params.prodId);
    const estoque = Number(req.body?.estoque ?? 0);
    const prod = CatalogModel.updateStock(prodId, estoque);
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

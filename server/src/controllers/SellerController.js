import { SellerModel } from "../models/SellerModel.js";

export const SellerController = {
  async list(req, res) {
    try {
      const sellers = await SellerModel.list();
      res.json(sellers);
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar vendedores", details: String(e) });
    }
  },

  async get(req, res) {
    try {
      const seller = await SellerModel.get(Number(req.params.id));
      if (!seller) return res.status(404).json({ error: "Vendedor não encontrado" });
      res.json(seller);
    } catch (e) {
      res.status(500).json({ error: "Erro ao buscar vendedor", details: String(e) });
    }
  },

  async create(req, res) {
    try {
      const seller = await SellerModel.create(req.body);
      res.json(seller);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  async update(req, res) {
    try {
      const seller = await SellerModel.update(Number(req.params.id), req.body);
      if (!seller) return res.status(404).json({ error: "Vendedor não encontrado" });
      res.json(seller);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  async delete(req, res) {
    try {
      const ok = await SellerModel.delete(Number(req.params.id));
      if (!ok) return res.status(404).json({ error: "Vendedor não encontrado" });
      res.json({ deleted: true });
    } catch (e) {
      res.status(500).json({ error: String(e.message || e) });
    }
  },
};

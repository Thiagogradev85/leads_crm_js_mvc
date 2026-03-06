// (Removed invalid async total function here)
import { ClientModel } from "../models/ClientModel.js";
import { ObservationModel } from "../models/ObservationModel.js";
import { importExcel } from "../services/importExcel.js";
import fs from "node:fs";

export const ClientController = {
  health(req, res) {
    res.json({ ok: true });
  },


  async states(req, res) {
    try {
      const result = await ClientModel.states();
      res.json(result);
    } catch (e) {
      console.error("Erro em /states:", e);
      res.status(500).json({ error: "Erro ao buscar estados", details: String(e) });
    }
  },

  async list(req, res) {
    try {
      const { uf, status, q } = req.query;
      const page = parseInt(req.query.page || 1, 10);
      const pageSize = parseInt(req.query.pageSize || 20, 10);
      const { rows, total } = await ClientModel.list({ uf, status, q, page, pageSize });
      res.json({ rows, total, page, pageSize });
    } catch (e) {
      console.error("Erro em /clients:", e);
      res.status(500).json({ error: "Erro ao buscar clientes", details: String(e) });
    }
  },

  async create(req, res) {
    try {
      const row = await ClientModel.upsertByKey(req.body || {});
      res.json(row);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  async update(req, res) {
    const id = Number(req.params.id);
    const row = await ClientModel.update(id, req.body || {});
    if (!row) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(row);
  },

  async delete(req, res) {
    const id = Number(req.params.id);
    const ok = await ClientModel.delete(id);
    if (!ok) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json({ deleted: true });
  },

  async import(req, res) {
    if (!req.file?.path) return res.status(400).json({ error: "Envie um arquivo .xlsx" });
    try {
      const result = await importExcel(req.file.path);
      // Limpa arquivo temporário
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      res.json({ ...result, ok: true });
    } catch (e) {
      // Limpa arquivo temporário mesmo em caso de erro
      try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch (_) {}
      console.error("Erro em /import:", e);
      res.status(500).json({ error: "Erro ao importar Excel", details: String(e) });
    }
  },

  // ─── Observations / Follow-ups ───

  async getClient(req, res) {
    const id = Number(req.params.id);
    const client = await ClientModel.get(id);
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(client);
  },

  listObservations(req, res) {
    const clientId = Number(req.params.id);
    const client = ClientModel.get(clientId);
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(ObservationModel.listByClient(clientId));
  },

  createObservation(req, res) {
    const clientId = Number(req.params.id);
    const client = ClientModel.get(clientId);
    if (!client) return res.status(404).json({ error: "Cliente não encontrado" });
    try {
      const obs = ObservationModel.create(clientId, req.body || {});
      res.json(obs);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  deleteObservation(req, res) {
    const obsId = Number(req.params.obsId);
    const ok = ObservationModel.delete(obsId);
    if (!ok) return res.status(404).json({ error: "Observação não encontrada" });
    res.json({ deleted: true });
  },
};

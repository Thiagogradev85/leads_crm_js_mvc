import { ClientModel } from "../models/ClientModel.js";
import { importExcel } from "../services/importExcel.js";
import fs from "node:fs";

export const ClientController = {
  health(req, res) {
    res.json({ ok: true });
  },

  states(req, res) {
    res.json(ClientModel.states());
  },

  list(req, res) {
    const { uf, status, q } = req.query;
    const rows = ClientModel.list({ uf, status, q });
    res.json(rows);
  },

  create(req, res) {
    try {
      const row = ClientModel.upsertByKey(req.body || {});
      res.json(row);
    } catch (e) {
      res.status(400).json({ error: String(e.message || e) });
    }
  },

  update(req, res) {
    const id = Number(req.params.id);
    const row = ClientModel.update(id, req.body || {});
    if (!row) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json(row);
  },

  delete(req, res) {
    const id = Number(req.params.id);
    const ok = ClientModel.delete(id);
    if (!ok) return res.status(404).json({ error: "Cliente não encontrado" });
    res.json({ deleted: true });
  },

  import(req, res) {
    if (!req.file?.path) return res.status(400).json({ error: "Envie um arquivo .xlsx" });
    try {
      const result = importExcel(req.file.path);
      // Limpa arquivo temporário
      try { fs.unlinkSync(req.file.path); } catch (_) {}
      res.json({ ...result, ok: true });
    } catch (e) {
      // Limpa arquivo temporário mesmo em caso de erro
      try { if (req.file?.path) fs.unlinkSync(req.file.path); } catch (_) {}
      res.status(400).json({ error: String(e.message || e) });
    }
  },
};

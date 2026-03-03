import XLSX from "xlsx";
import { ClientModel } from "../models/ClientModel.js";

const STATUSES = new Set(["prospeccao", "enviado", "respondeu", "nao_interessa", "pediu_catalogo"]);

function norm(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

export function importExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  let imported = 0;
  let updated = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });

    for (const r of rows) {
      // Support multiple header variants
      const payload = {
        prioridade: r["Prioridade (Capital/Interior)"] || r["Prioridade"] || "",
        loja: r["Loja"] || r["Cliente"] || r["Nome"] || "",
        cidade: r["Cidade"] || "",
        uf: r["UF"] || r["Estado"] || "",
        endereco: r["Endereço"] || r["Endereco"] || "",
        telefone: r["Telefone"] || "",
        whatsapp: r["WhatsApp"] || r["Whatsapp"] || "",
        email: r["Email"] || r["E-mail"] || "",
        fonte: r["Fonte"] || "",
        temperatura: r["Temperatura (A+B)"] || r["Temperatura"] || "",
        status: r["Status"] || "prospeccao",
      };

      payload.loja = norm(payload.loja);
      payload.cidade = norm(payload.cidade);
      payload.uf = norm(payload.uf).toUpperCase();
      payload.whatsapp = norm(payload.whatsapp);
      payload.telefone = norm(payload.telefone);
      payload.email = norm(payload.email);
      payload.endereco = norm(payload.endereco);
      payload.fonte = norm(payload.fonte);
      payload.prioridade = norm(payload.prioridade);
      payload.temperatura = norm(payload.temperatura);

      if (!payload.loja || !payload.uf) continue;
      if (!STATUSES.has(payload.status)) payload.status = "prospeccao";

      // Upsert retorna _existed: true se atualizou, false se inseriu
      const result = ClientModel.upsertByKey(payload);
      if (result._existed) {
        updated += 1;
      } else {
        imported += 1;
      }
    }
  }
  return { imported, updated, duplicates: updated };
}

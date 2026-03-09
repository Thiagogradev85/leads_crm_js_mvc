
import XLSX from "xlsx";
import { ClientModel } from "../models/ClientModel.js";

const STATUS_SET = new Set(["prospeccao", "enviado", "respondeu", "nao_interessa", "pediu_catalogo"]);

function norm(v) {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function findCol(cols, ...candidatos) {
  // Procura coluna por nome exato ou contendo substring (case-insensitive)
  for (const c of candidatos) {
    const found = cols.find(col => col.toLowerCase() === c.toLowerCase());
    if (found) return found;
  }
  // Procura por substring
  for (const c of candidatos) {
    const found = cols.find(col => col.toLowerCase().includes(c.toLowerCase()));
    if (found) return found;
  }
  return null;
}

export async function importExcel(filePath) {
  const wb = XLSX.readFile(filePath);
  let imported = 0;
  let updated = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: "" });
    if (!rows.length) continue;
    const cols = Object.keys(rows[0]);

    // Detecta colunas flexíveis
    const lojaCol = findCol(cols, "loja", "nome", "cliente", "nome da loja");
    const bairroCol = findCol(cols, "bairro");
    const ufCol = findCol(cols, "uf", "estado");
    const cidadeCol = findCol(cols, "cidade");
    const prioridadeCol = findCol(cols, "prioridade");
    const enderecoCol = findCol(cols, "endereço", "endereco");
    const telefoneCol = findCol(cols, "telefone");
    const whatsappCol = findCol(cols, "whatsapp");
    const emailCol = findCol(cols, "email", "e-mail");
    const fonteCol = findCol(cols, "fonte");
    const temperaturaCol = findCol(cols, "temperatura");
    const statusCol = findCol(cols, "status");

    for (const r of rows) {
      let ufValue = ufCol ? r[ufCol] : "";
      // Se não houver coluna UF, tenta extrair do final do campo BAIRRO
      if (!ufValue && bairroCol && r[bairroCol]) {
        // Exemplo: "Brasília - DF" → "DF"
        const match = String(r[bairroCol]).match(/([A-Z]{2})\s*$/i);
        if (match) ufValue = match[1].toUpperCase();
      }
      const payload = {
        prioridade: prioridadeCol ? r[prioridadeCol] : "",
        loja: lojaCol ? r[lojaCol] : "",
        cidade: cidadeCol ? r[cidadeCol] : "",
        uf: ufValue,
        endereco: enderecoCol ? r[enderecoCol] : "",
        telefone: telefoneCol ? r[telefoneCol] : "",
        whatsapp: whatsappCol ? r[whatsappCol] : "",
        email: emailCol ? r[emailCol] : "",
        fonte: fonteCol ? r[fonteCol] : "",
        temperatura: temperaturaCol ? r[temperaturaCol] : "",
        status: statusCol ? r[statusCol] : "prospeccao",
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
      if (!STATUS_SET.has(payload.status)) payload.status = "prospeccao";

      // Upsert retorna _existed: true se atualizou, false se inseriu
      const result = await ClientModel.upsertByKey(payload);
      if (result._existed) {
        updated += 1;
      } else {
        imported += 1;
      }
    }
  }
  return { imported, updated, duplicates: updated };
}

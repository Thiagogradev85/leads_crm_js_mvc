import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * Parses a catalog PDF and extracts product specs.
 * Expected pattern per product:
 *   Modelo / O nome  <MODEL_NAME>
 *   Detalhes do produto
 *   A bateria       48V 12.6 Ah
 *   Motor elétrico  500W-1000W
 *   pneus           10 Polegada de pneu
 *   velocidade      40 km/h
 *   A gama máxima   50km
 *   Tempo de carregamento  7.5 horas
 *   carregador      2 A
 *   À prova de água IP54
 *   O peso          32 kg
 */

const FIELD_MAP = [
  { pattern: /\bbateria\b/i, key: "bateria" },
  { pattern: /\bmotor\b/i, key: "motor" },
  { pattern: /\bpneu/i, key: "pneus" },
  { pattern: /\bvelocidade\b/i, key: "velocidade" },
  { pattern: /gama\s*m[aá]xima|autonomia|alcance/i, key: "autonomia" },
  { pattern: /tempo\s*de\s*carreg/i, key: "tempo_carga" },
  { pattern: /\bcarregador\b/i, key: "carregador" },
  { pattern: /prova\s*de\s*[aá]gua|imperm|ip\d/i, key: "impermeabilidade" },
  { pattern: /\bpeso\b/i, key: "peso" },
];

function emptyProduct() {
  return {
    tipo: "scooter",
    modelo: "",
    nome: "",
    bateria: "",
    motor: "",
    pneus: "",
    velocidade: "",
    autonomia: "",
    tempo_carga: "",
    carregador: "",
    impermeabilidade: "",
    peso: "",
    extras: "",
  };
}

export async function parseCatalogPdf(filePath) {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  const text = data.text;

  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const products = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Detect "Modelo" header line — next useful token is the model name
    const modeloMatch = line.match(/modelo\s*$/i) || line.match(/^modelo\s*$/i);
    if (modeloMatch) {
      // Save previous product
      if (current && current.modelo) products.push(current);
      current = emptyProduct();

      // Model name could be on same line or next line(s)
      // Look ahead for the model code (usually short like L10, C1, X9 PRO etc)
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const next = lines[j].trim();
        // Skip "O nome", "O  nome" variations
        if (/^o\s+nome$/i.test(next)) continue;
        if (/^detalhes/i.test(next)) break;
        // This should be the model name
        if (next && next.length < 40) {
          current.modelo = next;
          current.nome = next;
          break;
        }
      }
      continue;
    }

    // Combined "Modelo O nome  CODE" on one line
    const combinedMatch = line.match(/modelo\s+(?:o\s+nome\s+)?(.+)/i);
    if (combinedMatch && !current?.modelo) {
      if (current && current.modelo) products.push(current);
      current = emptyProduct();
      current.modelo = combinedMatch[1].trim();
      current.nome = current.modelo;
      continue;
    }

    // If we have a current product, try to match fields
    if (current) {
      // Detect product type from context
      if (/\bbike|bicicleta|e-bike/i.test(line)) {
        current.tipo = "bike";
      } else if (/\bpatinete|scooter/i.test(line)) {
        current.tipo = "scooter";
      }

      for (const { pattern, key } of FIELD_MAP) {
        if (pattern.test(line)) {
          // Extract value: everything after the field label
          // The value might be on the same line or next line
          const parts = line.split(/\t+|\s{2,}/);
          if (parts.length >= 2) {
            current[key] = parts.slice(1).join(" ").trim();
          } else {
            // Value might be on the next line
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              if (nextLine && !FIELD_MAP.some((f) => f.pattern.test(nextLine)) && !/modelo/i.test(nextLine)) {
                current[key] = nextLine;
              }
            }
          }
          break;
        }
      }
    }
  }

  // Don't forget the last product
  if (current && current.modelo) products.push(current);

  return products;
}

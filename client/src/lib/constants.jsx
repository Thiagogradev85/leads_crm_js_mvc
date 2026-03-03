import {
  Filter, MessageCircle, FileSpreadsheet,
  ThermometerSun, ThermometerSnowflake, Thermometer,
} from "lucide-react";
import React from "react";

// ─── Status options ───
export const STATUS = [
  { value: "", label: "Todos", icon: Filter },
  { value: "prospeccao", label: "Prospecção", icon: MessageCircle },
  { value: "enviado", label: "Enviado", icon: MessageCircle },
  { value: "respondeu", label: "Respondeu", icon: MessageCircle },
  { value: "nao_interessa", label: "Não interessa", icon: MessageCircle },
  { value: "pediu_catalogo", label: "Pediu catálogo", icon: FileSpreadsheet },
];

// ─── Status pill CSS classes ───
export function statusPill(status) {
  switch (status) {
    case "prospeccao":
      return "bg-violet-500/15 text-violet-300 border-violet-500/30 shadow-violet-500/5";
    case "enviado":
      return "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/5";
    case "respondeu":
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/5";
    case "nao_interessa":
      return "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/5";
    case "pediu_catalogo":
      return "bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-sky-500/5";
    default:
      return "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/5";
  }
}

// ─── Status label from value ───
export function statusLabel(value) {
  const s = STATUS.find((s) => s.value === value);
  return s ? s.label : value;
}

// ─── Temperature icon ───
export function tempIcon(temp) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente"))
    return <ThermometerSun size={14} className="text-orange-400" />;
  if (t.includes("frio"))
    return <ThermometerSnowflake size={14} className="text-blue-400" />;
  return <Thermometer size={14} className="text-yellow-400" />;
}

// ─── Format date for display ───
export function formatDate(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

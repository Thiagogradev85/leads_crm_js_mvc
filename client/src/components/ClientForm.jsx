import React, { useState } from "react";
import { Plus, Save, Store, MapPin, Globe, MessageCircle, Phone, Mail, Star, Thermometer } from "lucide-react";
import { STATUS } from "../lib/constants";

const EMPTY_FORM = {
  prioridade: "Capital",
  loja: "",
  cidade: "",
  uf: "",
  endereco: "",
  telefone: "",
  whatsapp: "",
  email: "",
  fonte: "",
  temperatura: "Morno",
  status: "enviado",
};

export default function ClientForm({ onSave, initialData }) {
  const [form, setForm] = useState(initialData || EMPTY_FORM);

  async function handleSave() {
    const payload = { ...form, uf: (form.uf || "").toUpperCase() };
    if (!payload.loja.trim() || !payload.uf.trim()) {
      alert("Loja e UF são obrigatórios.");
      return;
    }
    await onSave(payload);
    setForm({ ...EMPTY_FORM, prioridade: form.prioridade, temperatura: form.temperatura, status: form.status });
  }

  const textFields = [
    { key: "loja", label: "Loja", icon: Store, required: true },
    { key: "cidade", label: "Cidade", icon: MapPin },
    { key: "uf", label: "UF", icon: Globe, required: true },
    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
    { key: "telefone", label: "Telefone", icon: Phone },
    { key: "email", label: "Email", icon: Mail },
  ];

  const selectFields = [
    { key: "prioridade", label: "Prioridade", icon: Star, options: ["Capital", "Interior"] },
    { key: "temperatura", label: "Temperatura", icon: Thermometer, options: ["Quente", "Morno", "Frio"] },
    {
      key: "status",
      label: "Status",
      icon: MessageCircle,
      options: STATUS.filter((s) => s.value).map((s) => ({ v: s.value, l: s.label })),
    },
  ];

  return (
    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Plus size={16} className="text-emerald-400" />
        </div>
        <div>
          <div className="font-semibold text-sm">Adicionar / Atualizar Lead</div>
          <div className="text-xs text-zinc-500">Duplicatas são detectadas por Loja + Cidade + UF</div>
        </div>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {textFields.map(({ key, label, icon: Icon, required }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
                <Icon size={12} />
                {label}
                {required && <span className="text-rose-400">*</span>}
              </label>
              <input
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
                placeholder={label}
              />
            </div>
          ))}
          <div className="md:col-span-3">
            <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
              <MapPin size={12} />
              Endereço
            </label>
            <input
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
              placeholder="Endereço completo"
            />
          </div>
        </div>

        <div className="flex gap-4 mt-4 flex-wrap items-end">
          {selectFields.map(({ key, label, icon: Icon, options }) => (
            <div key={key}>
              <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
                <Icon size={12} />
                {label}
              </label>
              <select
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700/50 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none pr-8 cursor-pointer"
              >
                {options.map((o) =>
                  typeof o === "string" ? (
                    <option key={o} value={o} className="bg-zinc-800 text-white">{o}</option>
                  ) : (
                    <option key={o.v} value={o.v} className="bg-zinc-800 text-white">{o.l}</option>
                  )
                )}
              </select>
            </div>
          ))}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
          >
            <Save size={16} />
            Salvar
          </button>
        </div>
      </div>
    </section>
  );
}

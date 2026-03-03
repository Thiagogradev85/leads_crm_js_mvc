import React, { useEffect, useMemo, useState } from "react";
import { deleteClient, getStates, importExcel, listClients, updateClient, upsertClient } from "./lib/api.js";
import {
  UploadCloud, Search, Trash2, MapPin, Phone, Mail, MessageCircle,
  Store, Plus, Save, Users, Filter, ChevronDown, Building2,
  ThermometerSun, ThermometerSnowflake, Thermometer, Star, Globe,
  FileSpreadsheet, RefreshCw, Hash, ExternalLink
} from "lucide-react";

const STATUS = [
  { value: "", label: "Todos", icon: Filter },
  { value: "enviado", label: "Enviado", icon: MessageCircle },
  { value: "respondeu", label: "Respondeu", icon: MessageCircle },
  { value: "nao_interessa", label: "Não interessa", icon: MessageCircle },
  { value: "pediu_catalogo", label: "Pediu catálogo", icon: FileSpreadsheet },
];

function statusPill(status) {
  switch (status) {
    case "respondeu": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-emerald-500/5";
    case "nao_interessa": return "bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-rose-500/5";
    case "pediu_catalogo": return "bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-sky-500/5";
    default: return "bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-amber-500/5";
  }
}

function statusLabel(value) {
  const s = STATUS.find(s => s.value === value);
  return s ? s.label : value;
}

function tempIcon(temp) {
  const t = (temp || "").toLowerCase();
  if (t.includes("quente")) return <ThermometerSun size={14} className="text-orange-400" />;
  if (t.includes("frio")) return <ThermometerSnowflake size={14} className="text-blue-400" />;
  return <Thermometer size={14} className="text-yellow-400" />;
}

export default function App() {
  const [states, setStates] = useState([]);
  const [uf, setUf] = useState("");
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
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
  });

  async function refreshStates() {
    const st = await getStates(); // [{ uf, count }]
    setStates(st);
    if (!uf && st.length) setUf(st[0].uf);
  }

  async function refreshClients() {
    if (!uf) return;
    setLoading(true);
    const rows = await listClients({ uf, status, q });
    setClients(rows);
    setLoading(false);
  }

  useEffect(() => { refreshStates().catch(console.error); }, []);
  useEffect(() => { refreshClients().catch(console.error); }, [uf, status, q]);

  const totalClients = states.reduce((acc, s) => acc + s.count, 0);
  const currentStateData = states.find(s => s.uf === uf);

  async function onImport(file) {
    setLoading(true);
    const result = await importExcel(file);
    await refreshStates();
    await refreshClients();
    setLoading(false);
    alert(`Importação concluída!\n\n✅ Novos: ${result.imported}\n🔄 Atualizados: ${result.updated}\n\nDuplicatas são detectadas por Loja+Cidade+UF.`);
  }

  async function onSave() {
    const payload = { ...form, uf: (form.uf || "").toUpperCase() };
    if (!payload.loja.trim() || !payload.uf.trim()) {
      alert("Loja e UF são obrigatórios.");
      return;
    }
    await upsertClient(payload);
    setForm({ ...form, loja: "", cidade: "", whatsapp: "", telefone: "", email: "", endereco: "" });
    setShowForm(false);
    await refreshStates();
    if (!uf) setUf(payload.uf);
    await refreshClients();
  }

  async function onDelete(id) {
    if (!confirm("Tem certeza que deseja deletar este cliente?")) return;
    await deleteClient(id);
    await refreshStates();
    await refreshClients();
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* ═══════════ SIDEBAR ═══════════ */}
      <aside className="w-72 border-r border-zinc-800/80 flex flex-col bg-zinc-950/80 backdrop-blur-sm">
        {/* Logo */}
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-tight">Leads CRM</div>
              <div className="text-xs text-zinc-500">Gestão de Contatos</div>
            </div>
          </div>
        </div>

        {/* Stats mini */}
        <div className="px-5 py-3 border-b border-zinc-800/80">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Total de leads</span>
            <span className="text-emerald-400 font-semibold">{totalClients}</span>
          </div>
        </div>

        {/* States list */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-medium">
              <Globe size={12} />
              <span>Estados ({states.filter(s => s.count > 0).length}/{states.length})</span>
            </div>
          </div>
          <div className="flex-1 overflow-auto px-3 pb-3 space-y-0.5">
            {states.map((s) => (
              <button
                key={s.uf}
                onClick={() => setUf(s.uf)}
                className={
                  "w-full text-left px-3 py-2 rounded-lg border transition-all duration-150 flex justify-between items-center group " +
                  (uf === s.uf
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : s.count > 0
                      ? "bg-transparent border-transparent hover:bg-zinc-800/60 hover:border-zinc-700/50 text-zinc-300"
                      : "bg-transparent border-transparent hover:bg-zinc-900/40 text-zinc-600")
                }
              >
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className={uf === s.uf ? "text-emerald-400" : s.count > 0 ? "text-zinc-500 group-hover:text-zinc-400" : "text-zinc-700"} />
                  <span className="font-medium text-sm">{s.uf}</span>
                </div>
                <span className={
                  "text-xs font-medium tabular-nums px-1.5 py-0.5 rounded-md " +
                  (uf === s.uf
                    ? "bg-emerald-500/20 text-emerald-300"
                    : s.count > 0
                      ? "text-zinc-500 group-hover:text-zinc-400"
                      : "text-zinc-700")
                  }
                >
                  {s.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Import section */}
        <div className="p-4 border-t border-zinc-800/80">
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-medium mb-3">
            <UploadCloud size={14} />
            <span>Importar Excel</span>
          </label>
          <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group">
            <FileSpreadsheet size={18} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
            <span className="text-sm text-zinc-400 group-hover:text-emerald-300 transition-colors">Selecionar .xlsx</span>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
              className="hidden"
            />
          </label>
          <div className="text-[10px] text-zinc-600 mt-2 text-center">Colunas: Loja, Cidade, UF, WhatsApp…</div>
        </div>
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Building2 size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xl font-semibold flex items-center gap-2">
                  {uf || "—"}
                  {currentStateData && (
                    <span className="text-sm font-normal text-zinc-500">
                      · {currentStateData.count} {currentStateData.count === 1 ? "lead" : "leads"}
                    </span>
                  )}
                </div>
                <div className="text-xs text-zinc-500">Ordenação: WhatsApp → Capital → Data</div>
              </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              {/* Search */}
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm w-64 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
                  placeholder="Buscar loja, cidade, WhatsApp..."
                />
              </div>

              {/* Status filter */}
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="pl-8 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
                >
                  {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>

              {/* Add button */}
              <button
                onClick={() => setShowForm(!showForm)}
                className={
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all " +
                  (showForm
                    ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30")
                }
              >
                <Plus size={16} />
                {showForm ? "Fechar" : "Novo Lead"}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* ── Form ── */}
          {showForm && (
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
                  {[
                    { key: "loja", label: "Loja", icon: Store, required: true },
                    { key: "cidade", label: "Cidade", icon: MapPin },
                    { key: "uf", label: "UF", icon: Globe, required: true },
                    { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                    { key: "telefone", label: "Telefone", icon: Phone },
                    { key: "email", label: "Email", icon: Mail },
                  ].map(({ key, label, icon: Icon, required }) => (
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
                  {[
                    { key: "prioridade", label: "Prioridade", icon: Star, options: ["Capital", "Interior"] },
                    { key: "temperatura", label: "Temperatura", icon: Thermometer, options: ["Quente", "Morno", "Frio"] },
                    { key: "status", label: "Status", icon: MessageCircle, options: STATUS.filter(s => s.value).map(s => ({ v: s.value, l: s.label })) },
                  ].map(({ key, label, icon: Icon, options }) => (
                    <div key={key}>
                      <label className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1.5 font-medium">
                        <Icon size={12} />
                        {label}
                      </label>
                      <select
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-sm focus:outline-none focus:border-emerald-500/50 appearance-none pr-8 cursor-pointer"
                      >
                        {options.map((o) =>
                          typeof o === "string"
                            ? <option key={o} value={o}>{o}</option>
                            : <option key={o.v} value={o.v}>{o.l}</option>
                        )}
                      </select>
                    </div>
                  ))}

                  <button
                    onClick={onSave}
                    className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all"
                  >
                    <Save size={16} />
                    Salvar
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* ── Table ── */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Hash size={14} className="text-zinc-500" />
                <span className="text-zinc-400">{clients.length} registros</span>
                {loading && <RefreshCw size={14} className="text-emerald-400 animate-spin ml-2" />}
              </div>
            </div>
            <div className="overflow-auto">
              <table className="min-w-[1100px] w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/60 text-xs uppercase tracking-wider text-zinc-500">
                    <th className="px-4 py-3 text-left font-medium">Loja</th>
                    <th className="px-4 py-3 text-left font-medium">Cidade</th>
                    <th className="px-4 py-3 text-left font-medium">WhatsApp</th>
                    <th className="px-4 py-3 text-left font-medium">Email</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {clients.map((c) => (
                    <tr key={c.id} className="hover:bg-zinc-800/20 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Store size={14} className="text-zinc-400" />
                          </div>
                          <div>
                            <div className="font-medium text-zinc-200">{c.loja}</div>
                            <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                              {c.prioridade && (
                                <span className="flex items-center gap-0.5">
                                  <Star size={10} className={c.prioridade.toLowerCase().includes("capital") ? "text-amber-400" : "text-zinc-600"} />
                                  {c.prioridade}
                                </span>
                              )}
                              {c.temperatura && (
                                <span className="flex items-center gap-0.5">
                                  {tempIcon(c.temperatura)}
                                  {c.temperatura}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <MapPin size={13} className="text-zinc-600" />
                          {c.cidade || <span className="text-zinc-600">—</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {c.whatsapp ? (
                          <a
                            className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors"
                            href={`https://wa.me/55${String(c.whatsapp).replace(/\D/g,"")}`}
                            target="_blank"
                          >
                            <MessageCircle size={14} />
                            <span>{c.whatsapp}</span>
                            <ExternalLink size={11} className="text-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : <span className="text-zinc-600 flex items-center gap-1.5"><MessageCircle size={14} className="text-zinc-700" /> —</span>}
                      </td>
                      <td className="px-4 py-3">
                        {c.email ? (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-zinc-300 hover:text-sky-300 transition-colors">
                            <Mail size={13} className="text-zinc-500" />
                            <span className="truncate max-w-[180px]">{c.email}</span>
                          </a>
                        ) : <span className="text-zinc-600 flex items-center gap-1.5"><Mail size={13} className="text-zinc-700" /> —</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium shadow-sm ${statusPill(c.status)}`}>
                          <select
                            value={c.status}
                            onChange={(e) => updateClient(c.id, { status: e.target.value }).then(refreshClients)}
                            className="bg-transparent outline-none cursor-pointer text-xs"
                          >
                            {STATUS.filter(s => s.value).map((s) => (
                              <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                          </select>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => onDelete(c.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all opacity-50 group-hover:opacity-100"
                        >
                          <Trash2 size={13} />
                          <span>Deletar</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!clients.length && (
                    <tr>
                      <td className="px-4 py-12 text-center" colSpan={6}>
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                            <Users size={24} className="text-zinc-600" />
                          </div>
                          <div className="text-zinc-500 text-sm">Nenhum lead encontrado para {uf}</div>
                          <div className="text-zinc-600 text-xs">Importe um Excel ou adicione manualmente</div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

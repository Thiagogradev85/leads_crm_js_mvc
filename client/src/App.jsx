import React, { useEffect, useMemo, useState } from "react";
import { deleteClient, getStates, importExcel, listClients, updateClient, upsertClient } from "./lib/api.js";

const STATUS = [
  { value: "", label: "Todos" },
  { value: "enviado", label: "Enviado" },
  { value: "respondeu", label: "Respondeu" },
  { value: "nao_interessa", label: "Não interessa" },
  { value: "pediu_catalogo", label: "Pediu catálogo" },
];

function statusPill(status) {
  switch (status) {
    case "respondeu": return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    case "nao_interessa": return "bg-rose-500/15 text-rose-300 border-rose-500/30";
    case "pediu_catalogo": return "bg-sky-500/15 text-sky-300 border-sky-500/30";
    default: return "bg-amber-500/15 text-amber-300 border-amber-500/30";
  }
}

export default function App() {
  const [states, setStates] = useState([]);
  const [uf, setUf] = useState("");
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

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
    const rows = await listClients({ uf, status, q });
    setClients(rows);
  }

  useEffect(() => { refreshStates().catch(console.error); }, []);
  useEffect(() => { refreshClients().catch(console.error); }, [uf, status, q]);

  const filteredCount = clients.length;

  async function onImport(file) {
    await importExcel(file);
    await refreshStates();
    await refreshClients();
    alert("Importação concluída! Duplicatas são detectadas por Loja+Cidade+UF.");
  }

  async function onSave() {
    const payload = { ...form, uf: (form.uf || "").toUpperCase() };
    if (!payload.loja.trim() || !payload.uf.trim()) {
      alert("Loja e UF são obrigatórios.");
      return;
    }
    await upsertClient(payload);
    setForm({ ...form, loja: "", cidade: "", whatsapp: "", telefone: "", email: "" });
    await refreshStates();
    if (!uf) setUf(payload.uf);
    await refreshClients();
  }

  async function onDelete(id) {
    if (!confirm("Deletar este cliente?")) return;
    await deleteClient(id);
    await refreshStates();
    await refreshClients();
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-72 border-r border-zinc-800 p-4">
        <div className="text-xl font-semibold">Leads CRM</div>
        <div className="text-sm text-zinc-400 mt-1">Importe Excel, edite e acompanhe status.</div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-2">Estados (UF)</div>
          <div className="space-y-1 max-h-[420px] overflow-auto pr-1">
            {states.map((s) => (
              <button
                key={s.uf}
                onClick={() => setUf(s.uf)}
                className={
                  "w-full text-left px-3 py-2 rounded-lg border flex justify-between items-center " +
                  (uf === s.uf
                    ? "bg-zinc-900 border-zinc-700"
                    : s.count > 0
                      ? "bg-zinc-950 border-zinc-900 hover:bg-zinc-900/60 hover:border-zinc-800"
                      : "bg-zinc-950/50 border-zinc-900/50 hover:bg-zinc-900/40 text-zinc-500")
                }
              >
                <span>{s.uf}</span>
                <span className={"text-xs " + (s.count > 0 ? "text-emerald-400" : "text-zinc-600")}>{s.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <label className="text-xs uppercase tracking-wider text-zinc-500 mb-2 block">Importar .xlsx</label>
          <input
            type="file"
            accept=".xlsx"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            className="block w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-zinc-50 hover:file:bg-zinc-700"
          />
          <div className="text-xs text-zinc-500 mt-2">Dica: use colunas Loja/Cidade/UF/WhatsApp…</div>
        </div>
      </aside>

      <main className="flex-1 p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <div className="text-2xl font-semibold">Clientes — {uf || "—"}</div>
            <div className="text-sm text-zinc-400">Ordenado por WhatsApp primeiro, depois Capital.</div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div>
              <div className="text-xs text-zinc-500 mb-1">Buscar</div>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 w-72"
                placeholder="Loja, cidade, WhatsApp..."
              />
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">Status</div>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div className="text-xs text-zinc-500 self-end pb-2">Total: {filteredCount}</div>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="overflow-auto">
            <table className="min-w-[1200px] w-full text-sm">
              <thead className="bg-zinc-900/70 text-zinc-200">
                <tr>
                  <th className="px-3 py-3 text-left">Loja</th>
                  <th className="px-3 py-3 text-left">Cidade</th>
                  <th className="px-3 py-3 text-left">WhatsApp</th>
                  <th className="px-3 py-3 text-left">Email</th>
                  <th className="px-3 py-3 text-left">Status</th>
                  <th className="px-3 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className="border-t border-zinc-800 hover:bg-zinc-900/40">
                    <td className="px-3 py-3">
                      <div className="font-medium">{c.loja}</div>
                      <div className="text-xs text-zinc-400">{c.uf} • {c.prioridade} • {c.temperatura}</div>
                    </td>
                    <td className="px-3 py-3">{c.cidade}</td>
                    <td className="px-3 py-3">
                      {c.whatsapp ? (
                        <a className="text-emerald-300 hover:underline" href={`https://wa.me/55${String(c.whatsapp).replace(/\D/g,"")}`} target="_blank">
                          {c.whatsapp}
                        </a>
                      ) : <span className="text-zinc-500">—</span>}
                    </td>
                    <td className="px-3 py-3">{c.email || <span className="text-zinc-500">—</span>}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full border ${statusPill(c.status)}`}>
                        <select
                          value={c.status}
                          onChange={(e) => updateClient(c.id, { status: e.target.value }).then(refreshClients)}
                          className="bg-transparent outline-none"
                        >
                          {STATUS.filter(s => s.value).map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => onDelete(c.id)}
                        className="px-3 py-2 rounded-lg bg-rose-500/15 text-rose-300 border border-rose-500/25 hover:bg-rose-500/20"
                      >
                        Deletar
                      </button>
                    </td>
                  </tr>
                ))}
                {!clients.length && (
                  <tr>
                    <td className="px-3 py-8 text-zinc-500" colSpan={6}>
                      Sem registros para este estado. Importe um Excel ou adicione manualmente.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 p-4">
          <div className="text-lg font-semibold">Adicionar / Atualizar (Upsert)</div>
          <div className="text-sm text-zinc-400">Se já existir (Loja + Cidade + UF), ele atualiza sem duplicar.</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            {["loja","cidade","uf","whatsapp","telefone","email"].map((k) => (
              <div key={k}>
                <div className="text-xs text-zinc-500 mb-1 uppercase">{k}</div>
                <input
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
                />
              </div>
            ))}
            <div className="md:col-span-3">
              <div className="text-xs text-zinc-500 mb-1 uppercase">endereco</div>
              <input
                value={form.endereco}
                onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-4 flex-wrap">
            <div>
              <div className="text-xs text-zinc-500 mb-1 uppercase">prioridade</div>
              <select value={form.prioridade} onChange={(e) => setForm({ ...form, prioridade: e.target.value })}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <option>Capital</option>
                <option>Interior</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1 uppercase">temperatura</div>
              <select value={form.temperatura} onChange={(e) => setForm({ ...form, temperatura: e.target.value })}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                <option>Quente</option>
                <option>Morno</option>
                <option>Frio</option>
              </select>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1 uppercase">status</div>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                {STATUS.filter(s => s.value).map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <button onClick={onSave}
              className="self-end px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 hover:bg-emerald-500/20">
              Salvar
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

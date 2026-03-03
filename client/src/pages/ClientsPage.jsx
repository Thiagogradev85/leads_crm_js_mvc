import React, { useEffect, useState } from "react";
import { Search, Filter, ChevronDown, Plus, Building2 } from "lucide-react";
import { listClients, updateClient, upsertClient, deleteClient } from "../lib/api";
import { STATUS } from "../lib/constants";
import ClientTable from "../components/ClientTable";
import ClientForm from "../components/ClientForm";

export default function ClientsPage({ uf, onRefreshStates }) {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function refreshClients() {
    if (!uf) return;
    setLoading(true);
    const rows = await listClients({ uf, status, q });
    setClients(rows);
    setLoading(false);
  }

  useEffect(() => {
    refreshClients().catch(console.error);
  }, [uf, status, q]);

  async function onSave(payload) {
    await upsertClient(payload);
    setShowForm(false);
    onRefreshStates?.();
    await refreshClients();
  }

  async function onDelete(id) {
    if (!confirm("Tem certeza que deseja deletar este cliente?")) return;
    await deleteClient(id);
    onRefreshStates?.();
    await refreshClients();
  }

  async function onStatusChange(id, value) {
    await updateClient(id, { status: value });
    await refreshClients();
  }

  const currentCount = clients.length;

  return (
    <>
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
                <span className="text-sm font-normal text-zinc-500">
                  · {currentCount} {currentCount === 1 ? "lead" : "leads"}
                </span>
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
                className="pl-8 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                {STATUS.map((s) => (
                  <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
                    {s.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none"
              />
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
        {showForm && <ClientForm onSave={onSave} />}
        <ClientTable
          clients={clients}
          loading={loading}
          uf={uf}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}

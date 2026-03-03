import React, { useEffect, useState } from "react";
import { Search, Filter, ChevronDown, Users } from "lucide-react";
import { listClients, updateClient, deleteClient } from "../lib/api";
import { STATUS } from "../lib/constants";
import ClientTable from "../components/ClientTable";

export default function AllLeadsPage({ onRefreshStates }) {
  const [clients, setClients] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshClients() {
    setLoading(true);
    const rows = await listClients({ uf: "", status, q });
    setClients(rows);
    setLoading(false);
  }

  useEffect(() => {
    refreshClients().catch(console.error);
  }, [status, q]);

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
              <Users size={18} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-semibold flex items-center gap-2">
                Todos os Leads
                <span className="text-sm font-normal text-zinc-500">
                  · {currentCount} {currentCount === 1 ? "lead" : "leads"}
                </span>
              </div>
              <div className="text-xs text-zinc-500">Todos os estados · Ordenação: WhatsApp → Capital → Data</div>
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
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        <ClientTable
          clients={clients}
          loading={loading}
          uf="TODOS"
          showUf
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />
      </div>
    </>
  );
}

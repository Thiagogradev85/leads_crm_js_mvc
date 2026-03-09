
import React, { useEffect, useState, useCallback } from "react";
import { Search, Filter, ChevronDown, Plus, Building2 } from "lucide-react";
import { listClients, updateClient, upsertClient, deleteClient, listSellers, getStatus } from "../lib/api";
// import { STATUS } from "../lib/constants";
import ClientTable from "../components/ClientTable";
import ClientForm from "../components/ClientForm";

export default function ClientsPage({ uf, onRefreshStates }) {
  const [statusList, setStatusList] = useState([]);
  // Buscar lista de status da API ao montar
  useEffect(() => {
    async function refreshStatus() {
      try {
        const data = await getStatus();
        console.log("retorno status:", data);
        const parsed = Array.isArray(data)
          ? data
          : data?.rows || data?.data || data?.statuses || data?.status || data?.results || [];
        console.log("status parsed:", parsed);
        setStatusList(parsed);
      } catch (err) {
        console.error("Erro ao carregar status:", err);
        setStatusList([]);
      }
    }
    refreshStatus();
  }, []);
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const [sellers, setSellers] = useState([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(""); // status_id
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("");
  const [sortDir, setSortDir] = useState("asc");
  const [editClient, setEditClient] = useState(null);

  // Função robusta para atualizar clientes e sincronizar paginação
  const refreshClients = useCallback(
    async (newPage = page, newPageSize = pageSize, newSortKey = sortKey, newSortDir = sortDir) => {
      if (!uf) return;
      setLoading(true);
      try {
        const result = await listClients({
          uf,
          status: status ? Number(status) : undefined, // sempre envia status_id
          q,
          page: newPage,
          pageSize: newPageSize,
          sortKey: newSortKey,
          sortDir: newSortDir,
        });
        setClients(result.rows || []);
        setTotal(result.total || 0);
        setPage(result.page || newPage);
        setPageSize(result.pageSize || newPageSize);
      } finally {
        setLoading(false);
      }
    },
    [uf, status, q, page, pageSize, sortKey, sortDir]
  );

  async function refreshSellers() {
    try {
      const data = await listSellers();
      setSellers(
        Array.isArray(data)
          ? data
          : data?.vendedores || data?.sellers || []
      );
    } catch {
      setSellers([]);
    }
  }

  // Sempre que uf, status ou q mudar, volta para página 1
  useEffect(() => {
    setPage(1);
    refreshClients(1, pageSize, sortKey, sortDir).catch(console.error);
  }, [uf, status, q, sortKey, sortDir, refreshClients]);

  useEffect(() => {
    refreshSellers();
  }, []);

  async function onSave(payload) {
    await upsertClient(payload);
    setShowForm(false);
    setEditClient(null);
    onRefreshStates?.();
    await refreshClients();
  }

  async function onDelete(id) {
    if (!confirm("Tem certeza que deseja deletar este cliente?")) return;
    await deleteClient(id);
    onRefreshStates?.();
    await refreshClients();
  }

  async function onStatusChange(id, status_id) {
    await updateClient(id, { status_id });
    await refreshClients();
  }

  async function onSellerChange(id, vendedor_id) {
    await updateClient(id, { vendedor_id });
    await refreshClients();
  }

  async function handleEdit(client) {
    setEditClient(client);
    setShowForm(true);
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
                <option value="">Todos os status</option>
                {statusList.map((s) => (
                  <option key={s.id} value={s.id} className="bg-zinc-900 text-white">
                    {s.name}
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
        {showForm && <ClientForm onSave={onSave} initialData={editClient} />}
        <ClientTable
          clients={clients}
          loading={loading}
          uf={uf}
          sellers={sellers}
          statusList={statusList}
          onStatusChange={onStatusChange}
          onSellerChange={onSellerChange}
          onDelete={onDelete}
          onSort={handleSort}
          sortKey={sortKey}
          sortDir={sortDir}
          onEdit={handleEdit}
        />
        {/* Paginação */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => refreshClients(page - 1)}
          >Anterior</button>
          <span className="px-2 py-2 text-zinc-400">Página {page} de {Math.max(1, Math.ceil(total / pageSize))}</span>
          <button
            className="px-4 py-2 rounded bg-zinc-800 text-zinc-300 disabled:opacity-50"
            disabled={page >= Math.ceil(total / pageSize)}
            onClick={() => refreshClients(page + 1)}
          >Próxima</button>
        </div>
      </div>
    </>
  );

  function handleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }
}

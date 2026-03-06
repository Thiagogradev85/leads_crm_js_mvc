
import React, { useEffect, useState, useMemo } from "react";
import { Search, Filter, ChevronDown, Users, MapPin, Store, Building2 } from "lucide-react";
import { listClients, updateClient, deleteClient } from "../lib/api";
import { STATUS } from "../lib/constants";
import ClientTable from "../components/ClientTable";


export default function AllLeadsPage({ onRefreshStates, uf: propUf }) {
  const [clients, setClients] = useState([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [filterUf, setFilterUf] = useState(propUf || "");
  const [filterLoja, setFilterLoja] = useState("");
  const [filterCidade, setFilterCidade] = useState("");
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("uf");      // "uf" | "loja" | "cidade"
  const [sortDir, setSortDir] = useState("asc");     // "asc" | "desc"
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);


  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1); // Reset to first page on sort change
  }


  // Unique values for filter dropdowns (mantido apenas uma vez)
  const uniqueUfs = useMemo(() => [...new Set(clients.map((c) => c.uf).filter(Boolean))].sort(), [clients]);
  const uniqueLojas = useMemo(() => [...new Set(clients.map((c) => c.loja).filter(Boolean))].sort(), [clients]);
  const uniqueCidades = useMemo(() => [...new Set(clients.map((c) => c.cidade).filter(Boolean))].sort(), [clients]);


  async function refreshClients() {
    setLoading(true);
    // Always send all filters to backend
    const { rows, total: totalCount, page: currentPage, pageSize: currentPageSize } = await listClients({
      uf: filterUf,
      status,
      q,
      page,
      pageSize,
      sortKey,
      sortDir,
      loja: filterLoja,
      cidade: filterCidade,
    });
    setClients(rows);
    setTotal(totalCount);
    setPage(currentPage || 1);
    setPageSize(currentPageSize || 20);
    setLoading(false);
  }


  useEffect(() => {
    refreshClients().catch(console.error);
    // eslint-disable-next-line
  }, [status, q, filterUf, filterLoja, filterCidade, page, pageSize, sortKey, sortDir]);


  // Atualiza filtro de UF quando propUf muda (ex: ao clicar na Sidebar)
  useEffect(() => {
    if (propUf !== undefined) setFilterUf(propUf);
  }, [propUf]);


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


  // Pagination controls
  const totalPages = Math.ceil(total / pageSize);
  function goToPage(p) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  }

  return (
    <>
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
                <Users size={18} className="text-emerald-400" />
              </div>
              <div>
                <div className="text-xl font-semibold flex items-center gap-2">
                  {filterUf
                    ? `Leads de ${filterUf}`
                    : "Todos os Leads"}
                  <span className="text-sm font-normal text-zinc-500">
                    · {total} {total === 1 ? "lead" : "leads"}
                  </span>
                </div>
                <div className="text-xs text-zinc-500">Clique nos cabeçalhos para ordenar</div>
              </div>
            </div>

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
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* UF filter */}
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={filterUf}
                onChange={(e) => setFilterUf(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer"
              >
                <option value="" className="bg-zinc-900 text-white">Todos os estados</option>
                {uniqueUfs.map((u) => (
                  <option key={u} value={u} className="bg-zinc-900 text-white">{u}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Loja filter */}
            <div className="relative">
              <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={filterLoja}
                onChange={(e) => setFilterLoja(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer max-w-[220px]"
              >
                <option value="" className="bg-zinc-900 text-white">Todas as lojas</option>
                {uniqueLojas.map((l) => (
                  <option key={l} value={l} className="bg-zinc-900 text-white">{l}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Cidade filter */}
            <div className="relative">
              <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={filterCidade}
                onChange={(e) => setFilterCidade(e.target.value)}
                className="pl-8 pr-8 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer max-w-[220px]"
              >
                <option value="" className="bg-zinc-900 text-white">Todas as cidades</option>
                {uniqueCidades.map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">{c}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
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
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            {/* Clear filters */}
            {(filterUf || filterLoja || filterCidade || status) && (
              <button
                onClick={() => { setFilterUf(""); setFilterLoja(""); setFilterCidade(""); setStatus(""); }}
                className="px-3 py-2 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
              >
                Limpar filtros
              </button>
            )}
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
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
          onStatusChange={onStatusChange}
          onDelete={onDelete}
        />

        {/* Pagination Controls */}
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            className="px-3 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 disabled:opacity-50"
            onClick={() => goToPage(page - 1)}
            disabled={page <= 1}
          >Anterior</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, page - 3), Math.min(totalPages, page + 2)).map((p) => (
            <button
              key={p}
              className={`px-3 py-1 rounded border ${p === page ? 'border-emerald-500 bg-emerald-900 text-emerald-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300'}`}
              onClick={() => goToPage(p)}
              disabled={p === page}
            >{p}</button>
          ))}
          <button
            className="px-3 py-1 rounded border border-zinc-700 bg-zinc-800 text-zinc-300 disabled:opacity-50"
            onClick={() => goToPage(page + 1)}
            disabled={page >= totalPages}
          >Próxima</button>
        </div>
      </div>
    </>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Store, MapPin, MessageCircle, Mail, Trash2, Star, ExternalLink, Hash, RefreshCw, Eye,
  ArrowUp, ArrowDown, ArrowUpDown,
} from "lucide-react";
import { tempIcon } from "../lib/constants";
import StatusBadge from "./StatusBadge";
import EmptyState from "./EmptyState";

function SortIcon({ column, sortKey, sortDir }) {
  if (sortKey !== column) return <ArrowUpDown size={12} className="text-zinc-600" />;
  return sortDir === "asc"
    ? <ArrowUp size={12} className="text-emerald-400" />
    : <ArrowDown size={12} className="text-emerald-400" />;
}

export default function ClientTable({ clients, loading, uf, showUf, sortKey, sortDir, onSort, onStatusChange, onDelete }) {
  const navigate = useNavigate();

  return (
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
            <tr className="border-b border-zinc-800/60 text-sm uppercase tracking-wider text-zinc-400">
              <th className="px-4 py-3 text-left font-semibold">
                {onSort ? (
                  <button onClick={() => onSort("loja")} className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
                    Loja <SortIcon column="loja" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                ) : "Loja"}
              </th>
              <th className="px-4 py-3 text-left font-semibold">
                {onSort ? (
                  <button onClick={() => onSort("cidade")} className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
                    Cidade <SortIcon column="cidade" sortKey={sortKey} sortDir={sortDir} />
                  </button>
                ) : "Cidade"}
              </th>
              {showUf && (
                <th className="px-4 py-3 text-left font-semibold">
                  {onSort ? (
                    <button onClick={() => onSort("uf")} className="flex items-center gap-1.5 hover:text-emerald-300 transition-colors">
                      UF <SortIcon column="uf" sortKey={sortKey} sortDir={sortDir} />
                    </button>
                  ) : "UF"}
                </th>
              )}
              <th className="px-4 py-3 text-left font-semibold">WhatsApp</th>
              <th className="px-4 py-3 text-left font-semibold">Email</th>
              <th className="px-4 py-3 text-left font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/40">
            {clients.map((c) => (
              <tr
                key={c.id}
                className="hover:bg-zinc-800/20 transition-colors group cursor-pointer"
                onClick={() => navigate(`/client/${c.id}`)}
              >
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
                            <Star
                              size={10}
                              className={
                                c.prioridade.toLowerCase().includes("capital")
                                  ? "text-amber-400"
                                  : "text-zinc-600"
                              }
                            />
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
                {showUf && (
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-medium">
                      {c.uf}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {c.whatsapp ? (
                    <a
                      className="flex items-center gap-1.5 text-emerald-300 hover:text-emerald-200 transition-colors"
                      href={`https://wa.me/55${String(c.whatsapp).replace(/\D/g, "")}`}
                      target="_blank"
                    >
                      <MessageCircle size={14} />
                      <span>{c.whatsapp}</span>
                      <ExternalLink
                        size={11}
                        className="text-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </a>
                  ) : (
                    <span className="text-zinc-600 flex items-center gap-1.5">
                      <MessageCircle size={14} className="text-zinc-700" /> —
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  {c.email ? (
                    <a
                      href={`mailto:${c.email}`}
                      className="flex items-center gap-1.5 text-zinc-300 hover:text-sky-300 transition-colors"
                    >
                      <Mail size={13} className="text-zinc-500" />
                      <span className="truncate max-w-[180px]">{c.email}</span>
                    </a>
                  ) : (
                    <span className="text-zinc-600 flex items-center gap-1.5">
                      <Mail size={13} className="text-zinc-700" /> —
                    </span>
                  )}
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={c.status} onChange={(val) => onStatusChange(c.id, val)} />
                </td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/client/${c.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all opacity-50 group-hover:opacity-100"
                    >
                      <Eye size={13} />
                      <span>Ver</span>
                    </button>
                    <button
                      onClick={() => onDelete(c.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all opacity-50 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                      <span>Deletar</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!clients.length && (
              <tr>
                <td className="px-4 py-12 text-center" colSpan={showUf ? 7 : 6}>
                  <EmptyState
                    title={`Nenhum lead encontrado para ${uf}`}
                    subtitle="Importe um Excel ou adicione manualmente"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

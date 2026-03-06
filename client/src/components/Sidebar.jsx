import React from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Users, Globe, UploadCloud, FileSpreadsheet, BookOpen } from "lucide-react";

export default function Sidebar({ states, uf, onSelectUf, onImport }) {
  const navigate = useNavigate();
  const totalClients = states.reduce((acc, s) => acc + s.count, 0);

  return (
    <aside className="w-72 border-r border-zinc-800/80 flex flex-col bg-zinc-950/80 backdrop-blur-sm">
      {/* Logo */}
      <div
        className="p-5 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-900/50 transition-colors"
        onClick={() => { onSelectUf(""); navigate("/all-leads"); }}
      >
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
      <div
        className="px-5 py-3 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-900/50 transition-colors group"
        onClick={() => { onSelectUf(""); navigate("/all-leads"); }}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500 group-hover:text-emerald-300 transition-colors">Total de leads</span>
          <span className="text-emerald-400 font-semibold">{totalClients}</span>
        </div>
      </div>

      {/* Catalog link */}
      <div
        className="px-5 py-3 border-b border-zinc-800/80 cursor-pointer hover:bg-zinc-900/50 transition-colors group"
        onClick={() => navigate("/catalog")}
      >
        <div className="flex items-center gap-2 text-xs">
          <BookOpen size={14} className="text-amber-500 group-hover:text-amber-400 transition-colors" />
          <span className="text-zinc-500 group-hover:text-amber-300 transition-colors font-medium">Catálogo de Produtos</span>
        </div>
      </div>

      {/* States list */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-medium">
            <Globe size={12} />
            <span>Estados ({states.filter((s) => s.count > 0).length}/{states.length})</span>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-3 pb-3 space-y-0.5">
          {states.map((s) => (
            <button
              key={s.uf}
              onClick={() => {
                onSelectUf(s.uf);
                // Se estiver no catálogo, redireciona para leads
                if (window.location.pathname.startsWith("/catalog")) {
                  navigate("/all-leads");
                }
              }}
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
                <MapPin
                  size={14}
                  className={
                    uf === s.uf
                      ? "text-emerald-400"
                      : s.count > 0
                        ? "text-zinc-500 group-hover:text-zinc-400"
                        : "text-zinc-700"
                  }
                />
                <span className="font-medium text-sm">{s.uf}</span>
              </div>
              <span
                className={
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

      {/* Import section - logo abaixo dos estados */}
      <div className="px-5 pb-4 pt-2">
        <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-zinc-500 font-medium mb-2">
          <UploadCloud size={14} />
          <span>Importar Excel</span>
        </label>
        <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group w-full">
          <FileSpreadsheet
            size={18}
            className="text-zinc-500 group-hover:text-emerald-400 transition-colors"
          />
          <span className="text-sm text-zinc-400 group-hover:text-emerald-300 transition-colors">
            Selecionar .xlsx
          </span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])}
            className="hidden"
          />
        </label>
        <div className="text-[10px] text-zinc-600 mt-1 text-center">
          Colunas: Loja, Cidade, UF, WhatsApp…
        </div>
      </div>
    </aside>
  );
}

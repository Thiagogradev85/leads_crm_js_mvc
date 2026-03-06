import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Plus, Trash2, Archive, CheckCircle, Upload, Package,
  ChevronDown, ChevronRight, Edit3, X, Save, Bike, Zap,
  Battery, Gauge, Timer, Droplets, Weight, CircleDot, Box,
  Calendar, Tag, ExternalLink,
} from "lucide-react";
import {
  listCatalogs, getCatalog, createCatalog, updateCatalog, closeCatalog,
  deleteCatalog, addProduct, updateProduct, deleteProduct, updateStock,
  importCatalogPdf,
} from "../lib/api";

// ─── Helpers ───

function badge(active) {
  return active
    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
    : "bg-zinc-700/30 text-zinc-400 border border-zinc-700";
}

// ─── Product Row ───

function ProductRow({ product, catalogId, onRefresh, readOnly }) {
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...product });
  const [stockVal, setStockVal] = useState(product.estoque);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSave() {
    await updateProduct(catalogId, product.id, form);
    setEditing(false);
    onRefresh();
  }

  async function onStockChange(val) {
    const n = Math.max(0, Number(val) || 0);
    setStockVal(n);
    await updateStock(catalogId, product.id, n);
    onRefresh();
  }

  async function onDelete() {
    if (!confirm(`Deletar ${product.modelo}?`)) return;
    await deleteProduct(catalogId, product.id);
    onRefresh();
  }

  const specs = [
    { icon: Battery, label: "Bateria", key: "bateria" },
    { icon: Zap, label: "Motor", key: "motor" },
    { icon: CircleDot, label: "Pneus", key: "pneus" },
    { icon: Gauge, label: "Velocidade", key: "velocidade" },
    { icon: Bike, label: "Autonomia", key: "autonomia" },
    { icon: Timer, label: "Tempo Carga", key: "tempo_carga" },
    { icon: Zap, label: "Carregador", key: "carregador" },
    { icon: Droplets, label: "Proteção", key: "impermeabilidade" },
    { icon: Weight, label: "Peso", key: "peso" },
  ];

  if (editing) {
    return (
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-900/60 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-emerald-300">Editando: {product.modelo}</span>
          <div className="flex gap-2">
            <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
              <Save size={13} /> Salvar
            </button>
            <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600 transition-colors">
              <X size={13} /> Cancelar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {specs.map(({ label, key }) => (
            <div key={key}>
              <label className="text-[11px] text-zinc-500 uppercase">{label}</label>
              <input
                value={form[key] || ""}
                onChange={(e) => set(key, e.target.value)}
                className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          ))}
          <div>
            <label className="text-[11px] text-zinc-500 uppercase">Estoque</label>
            <input
              type="number"
              min="0"
              value={form.estoque ?? 0}
              onChange={(e) => set("estoque", Number(e.target.value))}
              className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>
        <div>
          <label className="text-[11px] text-zinc-500 uppercase">Extras / Observações</label>
          <input
            value={form.extras || ""}
            onChange={(e) => set("extras", e.target.value)}
            className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors cursor-pointer group"
      onClick={() => navigate(`/catalog/${catalogId}/product/${product.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
            {product.tipo === "bike" ? <Bike size={18} className="text-white" /> : <Zap size={18} className="text-white" />}
          </div>
          <div>
            <div className="font-bold text-lg text-white flex items-center gap-2">
              {product.modelo}
              <ExternalLink size={13} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="text-xs text-zinc-500">{product.tipo === "bike" ? "Bicicleta Elétrica" : "Scooter Elétrico"}</div>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Estoque inline */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60">
            <Box size={13} className="text-zinc-400" />
            <span className="text-[10px] text-zinc-500 uppercase">Estoque:</span>
            {readOnly ? (
              <span className={`text-sm font-bold ${stockVal > 0 ? "text-emerald-400" : "text-rose-400"}`}>{stockVal}</span>
            ) : (
              <input
                type="number"
                min="0"
                value={stockVal}
                onChange={(e) => onStockChange(e.target.value)}
                className="w-14 text-center text-sm font-bold bg-transparent text-emerald-400 focus:outline-none"
              />
            )}
          </div>
          {!readOnly && (
            <>
              <button onClick={onDelete} className="p-2 rounded-lg text-zinc-500 hover:text-rose-300 hover:bg-rose-500/10 transition-all">
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {specs.map(({ icon: Icon, label, key }) => {
          const val = product[key];
          if (!val) return null;
          return (
            <div key={key} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-800">
              <Icon size={12} className="text-zinc-500 flex-shrink-0" />
              <div>
                <div className="text-[10px] text-zinc-600 uppercase leading-none">{label}</div>
                <div className="text-xs text-zinc-300 font-medium">{val}</div>
              </div>
            </div>
          );
        })}
      </div>
      {product.extras && (
        <div className="mt-2 text-xs text-zinc-500 italic">{product.extras}</div>
      )}
    </div>
  );
}

// ─── New Product Form ───

function NewProductForm({ catalogId, onRefresh }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ tipo: "scooter", modelo: "", bateria: "", motor: "", pneus: "", velocidade: "", autonomia: "", tempo_carga: "", carregador: "", impermeabilidade: "", peso: "", estoque: 0, extras: "" });
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSave() {
    if (!form.modelo.trim()) return alert("Modelo é obrigatório");
    await addProduct(catalogId, form);
    setForm({ tipo: "scooter", modelo: "", bateria: "", motor: "", pneus: "", velocidade: "", autonomia: "", tempo_carga: "", carregador: "", impermeabilidade: "", peso: "", estoque: 0, extras: "" });
    setOpen(false);
    onRefresh();
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-zinc-400 hover:text-emerald-300 transition-all w-full justify-center">
        <Plus size={16} /> Adicionar Produto Manualmente
      </button>
    );
  }

  const fields = [
    { label: "Modelo *", key: "modelo" }, { label: "Bateria", key: "bateria" },
    { label: "Motor", key: "motor" }, { label: "Pneus", key: "pneus" },
    { label: "Velocidade", key: "velocidade" }, { label: "Autonomia", key: "autonomia" },
    { label: "Tempo Carga", key: "tempo_carga" }, { label: "Carregador", key: "carregador" },
    { label: "Proteção (IP)", key: "impermeabilidade" }, { label: "Peso", key: "peso" },
  ];

  return (
    <div className="p-4 rounded-xl border border-emerald-500/30 bg-zinc-900/60 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-emerald-300">Novo Produto</span>
        <div className="flex gap-2">
          <select value={form.tipo} onChange={(e) => set("tipo", e.target.value)} className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white">
            <option value="scooter" className="bg-zinc-900 text-white">Scooter</option>
            <option value="bike" className="bg-zinc-900 text-white">Bike</option>
          </select>
          <button onClick={onSave} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-emerald-600 text-white hover:bg-emerald-500"><Save size={13} /> Salvar</button>
          <button onClick={() => setOpen(false)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-zinc-700 text-zinc-300 hover:bg-zinc-600"><X size={13} /> Cancelar</button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(({ label, key }) => (
          <div key={key}>
            <label className="text-[11px] text-zinc-500 uppercase">{label}</label>
            <input value={form[key] || ""} onChange={(e) => set(key, e.target.value)} className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
          </div>
        ))}
        <div>
          <label className="text-[11px] text-zinc-500 uppercase">Estoque</label>
          <input type="number" min="0" value={form.estoque} onChange={(e) => set("estoque", Number(e.target.value))} className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500/50" />
        </div>
      </div>
    </div>
  );
}

// ─── Catalog Card ───

function CatalogCard({ catalog, onRefresh }) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  async function loadDetails() {
    setLoading(true);
    const data = await getCatalog(catalog.id);
    setDetails(data);
    setLoading(false);
  }

  async function toggle() {
    if (!expanded && !details) await loadDetails();
    setExpanded(!expanded);
  }

  async function refresh() {
    await loadDetails();
    onRefresh();
  }

  async function onClose() {
    if (!confirm(`Encerrar catálogo "${catalog.nome}"? Ele será marcado como inativo.`)) return;
    await closeCatalog(catalog.id);
    refresh();
  }

  async function onDel() {
    if (!confirm(`Deletar catálogo "${catalog.nome}" e todos os seus produtos?`)) return;
    await deleteCatalog(catalog.id);
    onRefresh();
  }

  async function onImportPdf(file) {
    try {
      const result = await importCatalogPdf(catalog.id, file);
      alert(`PDF importado!\n\n✅ Novos: ${result.imported}\n🔄 Atualizados: ${result.updated}\nTotal extraído: ${result.total}`);
      refresh();
    } catch (e) {
      alert("Erro ao importar PDF: " + e.message);
    }
  }

  const isActive = catalog.ativo === 1;

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/20 transition-colors"
        onClick={toggle}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              {catalog.nome}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badge(isActive)}`}>
                {isActive ? "ATIVO" : "ENCERRADO"}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
              <span className="flex items-center gap-1"><Calendar size={11} /> Ref: {catalog.mes_referencia}</span>
              {catalog.data_termino && <span className="flex items-center gap-1"><Tag size={11} /> Fim: {catalog.data_termino}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {isActive && (
            <>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 border border-amber-500/20 cursor-pointer transition-all">
                <Upload size={13} /> Importar PDF
                <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && onImportPdf(e.target.files[0])} className="hidden" />
              </label>
              <button onClick={onClose} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-700/50 border border-zinc-700 transition-all">
                <Archive size={13} /> Encerrar
              </button>
            </>
          )}
          <button onClick={onDel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all">
            <Trash2 size={13} /> Deletar
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3 border-t border-zinc-800/60 pt-4">
          {loading && <div className="text-zinc-500 text-sm animate-pulse">Carregando...</div>}
          {details && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400 flex items-center gap-1.5">
                  <Package size={14} /> {details.products?.length || 0} produtos
                </span>
              </div>
              <div className="space-y-3">
                {details.products?.map((p) => (
                  <ProductRow key={p.id} product={p} catalogId={catalog.id} onRefresh={refresh} readOnly={!isActive} />
                ))}
              </div>
              {isActive && <NewProductForm catalogId={catalog.id} onRefresh={refresh} />}
              {!details.products?.length && (
                <div className="text-center py-8 text-zinc-600 text-sm">
                  Nenhum produto ainda. Importe um PDF ou adicione manualmente.
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───

export default function CatalogPage() {
  const [catalogs, setCatalogs] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [nome, setNome] = useState("");
  const [mesRef, setMesRef] = useState("");

  async function refresh() {
    const data = await listCatalogs();
    // Garante que catalogs seja sempre array
    setCatalogs(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    refresh().catch(console.error);
  }, []);

  async function onCreate() {
    if (!nome.trim() || !mesRef.trim()) return alert("Nome e mês de referência são obrigatórios");
    await createCatalog({ nome, mes_referencia: mesRef });
    setNome("");
    setMesRef("");
    setShowNew(false);
    refresh();
  }

  return (
    <>
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center">
              <BookOpen size={18} className="text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-semibold">Catálogos</div>
              <div className="text-xs text-zinc-500">Gerencie catálogos de produtos, estoque e especificações</div>
            </div>
          </div>
          <button
            onClick={() => setShowNew(!showNew)}
            className={
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all " +
              (showNew
                ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                : "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30")
            }
          >
            <Plus size={16} />
            {showNew ? "Fechar" : "Novo Catálogo"}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6 space-y-4">
        {showNew && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-zinc-900/60 space-y-3">
            <div className="text-sm font-semibold text-amber-300">Novo Catálogo</div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-zinc-500 uppercase">Nome do Catálogo</label>
                <input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: ATOMI Scooter - Fevereiro 2026"
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-500/50 placeholder:text-zinc-600"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 uppercase">Mês de Referência</label>
                <input
                  type="month"
                  value={mesRef}
                  onChange={(e) => setMesRef(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <div className="flex items-end">
                <button onClick={onCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-medium hover:bg-amber-500 transition-colors w-full justify-center">
                  <CheckCircle size={16} /> Criar Catálogo
                </button>
              </div>
            </div>
          </div>
        )}

        {catalogs.length === 0 && !showNew && (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <BookOpen size={48} className="mb-4 text-zinc-700" />
            <div className="text-lg font-medium mb-1">Nenhum catálogo criado</div>
            <div className="text-sm">Clique em "Novo Catálogo" para começar</div>
          </div>
        )}

        {catalogs.map((cat) => (
          <CatalogCard key={cat.id} catalog={cat} onRefresh={refresh} />
        ))}
      </div>
    </>
  );
}

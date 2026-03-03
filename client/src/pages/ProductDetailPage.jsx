import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, Bike, Zap, Battery, Gauge, Timer, Droplets,
  Weight, CircleDot, Box, Package, Tag,
} from "lucide-react";
import { getCatalog, updateProduct } from "../lib/api";

const SPEC_FIELDS = [
  { icon: Battery, label: "Bateria", key: "bateria" },
  { icon: Zap, label: "Motor", key: "motor" },
  { icon: CircleDot, label: "Pneus", key: "pneus" },
  { icon: Gauge, label: "Velocidade Máx.", key: "velocidade" },
  { icon: Bike, label: "Autonomia", key: "autonomia" },
  { icon: Timer, label: "Tempo de Carga", key: "tempo_carga" },
  { icon: Zap, label: "Carregador", key: "carregador" },
  { icon: Droplets, label: "Proteção (IP)", key: "impermeabilidade" },
  { icon: Weight, label: "Peso", key: "peso" },
];

export default function ProductDetailPage() {
  const { catalogId, prodId } = useParams();
  const navigate = useNavigate();

  const [catalog, setCatalog] = useState(null);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const data = await getCatalog(catalogId);
      setCatalog(data);
      const prod = data.products?.find((p) => String(p.id) === String(prodId));
      if (prod) {
        setProduct(prod);
        setForm({ ...prod });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [catalogId, prodId]);

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProduct(catalogId, prodId, form);
      setDirty(false);
      await loadData();
    } catch (e) {
      alert("Erro ao salvar: " + e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Carregando produto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-zinc-500">Produto não encontrado</div>
        <button onClick={() => navigate("/catalog")} className="text-emerald-400 hover:underline text-sm">
          Voltar ao catálogo
        </button>
      </div>
    );
  }

  const isActive = catalog?.ativo === 1;
  const inputClass =
    "w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors";
  const readOnlyClass =
    "w-full mt-1 px-3 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800 text-sm text-zinc-400 cursor-not-allowed";

  return (
    <>
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/catalog")}
              className="p-2 rounded-lg text-zinc-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              {product.tipo === "bike" ? (
                <Bike size={18} className="text-white" />
              ) : (
                <Zap size={18} className="text-white" />
              )}
            </div>
            <div>
              <div className="text-xl font-semibold">{product.modelo}</div>
              <div className="text-xs text-zinc-500">
                {catalog?.nome} • {product.tipo === "bike" ? "Bicicleta Elétrica" : "Scooter Elétrico"}
              </div>
            </div>
          </div>
          {isActive && (
            <button
              onClick={handleSave}
              disabled={!dirty || saving}
              className={
                "flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all " +
                (dirty
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
                  : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed")
              }
            >
              <Save size={16} />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Top info cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Tipo */}
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={11} /> Tipo
            </label>
            {isActive ? (
              <select
                value={form.tipo || "scooter"}
                onChange={(e) => set("tipo", e.target.value)}
                className={inputClass}
              >
                <option value="scooter" className="bg-zinc-900 text-white">Scooter</option>
                <option value="bike" className="bg-zinc-900 text-white">Bike</option>
              </select>
            ) : (
              <div className={readOnlyClass}>{form.tipo === "bike" ? "Bicicleta Elétrica" : "Scooter Elétrico"}</div>
            )}
          </div>

          {/* Modelo */}
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Package size={11} /> Modelo
            </label>
            {isActive ? (
              <input
                value={form.modelo || ""}
                onChange={(e) => set("modelo", e.target.value)}
                className={inputClass}
              />
            ) : (
              <div className={readOnlyClass}>{form.modelo}</div>
            )}
          </div>

          {/* Estoque */}
          <div className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
            <label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
              <Box size={11} /> Estoque
            </label>
            {isActive ? (
              <input
                type="number"
                min="0"
                value={form.estoque ?? 0}
                onChange={(e) => set("estoque", Math.max(0, Number(e.target.value) || 0))}
                className={inputClass}
              />
            ) : (
              <div className={readOnlyClass}>{form.estoque ?? 0}</div>
            )}
            <div className="mt-1">
              <span
                className={
                  "text-xs font-medium px-2 py-0.5 rounded-full " +
                  ((form.estoque ?? 0) > 0
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "bg-rose-500/15 text-rose-300")
                }
              >
                {(form.estoque ?? 0) > 0 ? "Em estoque" : "Sem estoque"}
              </span>
            </div>
          </div>
        </div>

        {/* Specs grid */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60">
            <span className="text-sm font-semibold text-zinc-300">Especificações Técnicas</span>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPEC_FIELDS.map(({ icon: Icon, label, key }) => (
              <div key={key} className="space-y-1">
                <label className="text-[11px] text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Icon size={12} className="text-zinc-600" />
                  {label}
                </label>
                {isActive ? (
                  <input
                    value={form[key] || ""}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={`Informe ${label.toLowerCase()}`}
                    className={inputClass + " placeholder:text-zinc-700"}
                  />
                ) : (
                  <div className={readOnlyClass}>{form[key] || "—"}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Extras */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60">
            <span className="text-sm font-semibold text-zinc-300">Extras / Observações</span>
          </div>
          <div className="p-5">
            {isActive ? (
              <textarea
                value={form.extras || ""}
                onChange={(e) => set("extras", e.target.value)}
                rows={3}
                placeholder="Informações adicionais sobre o produto..."
                className={inputClass + " resize-none placeholder:text-zinc-700"}
              />
            ) : (
              <div className={readOnlyClass + " min-h-[60px]"}>{form.extras || "—"}</div>
            )}
          </div>
        </div>

        {/* Specs preview (read-only summary) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-800/60">
            <span className="text-sm font-semibold text-zinc-300">Resumo Visual</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {SPEC_FIELDS.map(({ icon: Icon, label, key }) => {
                const val = form[key];
                if (!val) return null;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-zinc-800/50 border border-zinc-800"
                  >
                    <Icon size={13} className="text-zinc-500 flex-shrink-0" />
                    <div>
                      <div className="text-[10px] text-zinc-600 uppercase leading-none">{label}</div>
                      <div className="text-xs text-zinc-300 font-medium">{val}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            {!SPEC_FIELDS.some(({ key }) => form[key]) && (
              <div className="text-zinc-600 text-sm text-center py-4">
                Nenhuma especificação preenchida
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

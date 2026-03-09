import React, { useEffect, useState } from "react";
import { listSellers, updateSeller, deleteSeller, createSeller } from "../lib/api";
import { Edit, Trash2, Save, Plus, Check, X, RefreshCw, Search } from "lucide-react";

export default function SellersPage() {
  const [sellers, setSellers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAtivo, setEditAtivo] = useState(true);
  const [newNome, setNewNome] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [sortKey, setSortKey] = useState("nome");
  const [sortDir, setSortDir] = useState("asc");

  async function refresh() {
    setLoading(true);
    setSellers(await listSellers());
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function handleEdit(seller) {
    setEditingId(seller.id);
    setEditNome(seller.nome);
    setEditEmail(seller.email || "");
    setEditAtivo(seller.ativo);
  }

  async function handleSave(id) {
    await updateSeller(id, { nome: editNome, email: editEmail, ativo: editAtivo });
    setEditingId(null);
    setEditNome("");
    setEditEmail("");
    setEditAtivo(true);
    await refresh();
  }

  async function handleDelete(id) {
    if (!window.confirm("Deseja realmente excluir este vendedor?")) return;
    await deleteSeller(id);
    await refresh();
  }

  async function handleCreate() {
    if (!newNome.trim()) return;
    await createSeller({ nome: newNome, email: newEmail });
    setNewNome("");
    setNewEmail("");
    await refresh();
  }

  // Filtro, busca e ordenação
  let filtered = sellers.filter(s =>
    (!showOnlyActive || s.ativo) &&
    (!q || s.nome.toLowerCase().includes(q.toLowerCase()) || (s.email || "").toLowerCase().includes(q.toLowerCase()))
  );
  filtered = filtered.sort((a, b) => {
    let vA = a[sortKey] || "";
    let vB = b[sortKey] || "";
    if (typeof vA === "string") vA = vA.toLowerCase();
    if (typeof vB === "string") vB = vB.toLowerCase();
    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <section className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Vendedores</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm w-64 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600"
              placeholder="Buscar nome ou email..."
            />
          </div>
          <button
            onClick={() => setShowOnlyActive(a => !a)}
            className={"px-4 py-2 rounded-lg text-sm font-medium border " + (showOnlyActive ? "bg-emerald-600 text-white border-emerald-700" : "bg-zinc-900 text-zinc-300 border-zinc-700")}
          >
            {showOnlyActive ? "Apenas ativos" : "Todos"}
          </button>
        </div>
      </div>
      <div className="mb-4 flex gap-2">
        <input
          value={newNome}
          onChange={e => setNewNome(e.target.value)}
          placeholder="Novo vendedor"
          className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm flex-1"
        />
        <input
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
          placeholder="Email"
          className="px-3 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-white text-sm flex-1"
        />
        <button onClick={handleCreate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-1">
          <Plus size={16} /> Adicionar
        </button>
      </div>
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-400">{filtered.length} vendedores</span>
            {loading && <RefreshCw size={14} className="text-emerald-400 animate-spin ml-2" />}
          </div>
        </div>
        <div className="overflow-auto">
          <table className="min-w-[800px] w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800/60 text-sm uppercase tracking-wider text-zinc-400">
                <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => setSortKey("nome")}>Nome</th>
                <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => setSortKey("email")}>Email</th>
                <th className="px-4 py-3 text-left font-semibold cursor-pointer" onClick={() => setSortKey("ativo")}>Ativo</th>
                <th className="px-4 py-3 text-left font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {filtered.map(seller => (
                <tr key={seller.id} className="hover:bg-zinc-800/20 transition-colors group">
                  <td className="px-4 py-3">
                    {editingId === seller.id ? (
                      <input
                        value={editNome}
                        onChange={e => setEditNome(e.target.value)}
                        className="px-2 py-1 rounded border border-zinc-700 bg-zinc-900 text-white"
                      />
                    ) : (
                      <span className="font-medium text-zinc-200">{seller.nome}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === seller.id ? (
                      <input
                        value={editEmail}
                        onChange={e => setEditEmail(e.target.value)}
                        className="px-2 py-1 rounded border border-zinc-700 bg-zinc-900 text-white"
                      />
                    ) : (
                      seller.email || <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === seller.id ? (
                      <button onClick={() => setEditAtivo(!editAtivo)} className={"flex items-center gap-1 px-2 py-1 rounded " + (editAtivo ? "bg-emerald-700 text-white" : "bg-zinc-800 text-zinc-400")}>{editAtivo ? <Check size={14} /> : <X size={14} />} {editAtivo ? "Ativo" : "Inativo"}</button>
                    ) : (
                      seller.ativo ? <span className="text-emerald-500 font-semibold">Ativo</span> : <span className="text-zinc-500">Inativo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 flex gap-2">
                    {editingId === seller.id ? (
                      <button onClick={() => handleSave(seller.id)} className="text-emerald-500 hover:text-emerald-300 flex items-center gap-1"><Save size={14} />Salvar</button>
                    ) : (
                      <button onClick={() => handleEdit(seller)} className="text-blue-400 hover:text-blue-300 flex items-center gap-1"><Edit size={14} />Editar</button>
                    )}
                    <button onClick={() => handleDelete(seller.id)} className="text-rose-400 hover:text-rose-300 flex items-center gap-1"><Trash2 size={14} />Excluir</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td className="px-4 py-12 text-center text-zinc-500" colSpan={4}>
                    Nenhum vendedor encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

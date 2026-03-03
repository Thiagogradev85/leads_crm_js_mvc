import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Store, MapPin, MessageCircle, Phone, Mail, Globe,
  Star, ExternalLink, Clock, Edit3, Save, X,
} from "lucide-react";
import { getClient, updateClient, listObservations, createObservation, deleteObservation } from "../lib/api";
import { statusLabel, statusPill, tempIcon, formatDate } from "../lib/constants";
import StatusBadge from "../components/StatusBadge";
import ObservationTimeline from "../components/ObservationTimeline";

export default function ClientDetailPage({ onRefreshStates }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [client, setClient] = useState(null);
  const [observations, setObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  async function loadClient() {
    setLoading(true);
    try {
      const [c, obs] = await Promise.all([getClient(id), listObservations(id)]);
      setClient(c);
      setObservations(obs);
      setEditForm(c);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClient();
  }, [id]);

  async function handleStatusChange(value) {
    await updateClient(id, { status: value });
    onRefreshStates?.();
    await loadClient();
  }

  async function handleSaveEdit() {
    await updateClient(id, editForm);
    setEditing(false);
    onRefreshStates?.();
    await loadClient();
  }

  async function handleAddObservation(payload) {
    await createObservation(id, payload);
    const obs = await listObservations(id);
    setObservations(obs);
  }

  async function handleDeleteObservation(obsId) {
    if (!confirm("Deletar esta observação?")) return;
    await deleteObservation(id, obsId);
    const obs = await listObservations(id);
    setObservations(obs);
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <div className="text-zinc-500">Cliente não encontrado</div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Voltar
        </button>
      </div>
    );
  }

  const infoFields = [
    { label: "WhatsApp", icon: MessageCircle, key: "whatsapp", color: "text-emerald-400", link: client.whatsapp ? `https://wa.me/55${String(client.whatsapp).replace(/\D/g, "")}` : null },
    { label: "Telefone", icon: Phone, key: "telefone", color: "text-zinc-400" },
    { label: "Email", icon: Mail, key: "email", color: "text-sky-400", link: client.email ? `mailto:${client.email}` : null },
    { label: "Cidade", icon: MapPin, key: "cidade", color: "text-zinc-400" },
    { label: "UF", icon: Globe, key: "uf", color: "text-zinc-400" },
    { label: "Endereço", icon: MapPin, key: "endereco", color: "text-zinc-400" },
  ];

  const editableFields = [
    { key: "loja", label: "Loja" },
    { key: "cidade", label: "Cidade" },
    { key: "uf", label: "UF" },
    { key: "endereco", label: "Endereço" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "telefone", label: "Telefone" },
    { key: "email", label: "Email" },
    { key: "fonte", label: "Fonte" },
  ];

  return (
    <>
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all"
            >
              <ArrowLeft size={18} />
              <span>Voltar</span>
            </button>
            <div className="h-6 w-px bg-zinc-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                <Store size={20} className="text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{client.loja}</h1>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <MapPin size={11} />
                  <span>{client.cidade || "—"}, {client.uf}</span>
                  <span className="text-zinc-700">·</span>
                  <Clock size={11} />
                  <span>{formatDate(client.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={client.status} onChange={handleStatusChange} />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Client Info Card */}
          <section className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Store size={16} className="text-zinc-400" />
                </div>
                <span className="font-semibold text-sm">Informações do Cliente</span>
              </div>
              <button
                onClick={() => { setEditing(!editing); setEditForm(client); }}
                className={
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " +
                  (editing
                    ? "bg-zinc-800 border-zinc-600 text-white"
                    : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400")
                }
              >
                <Edit3 size={13} />
                {editing ? "Cancelar" : "Editar"}
              </button>
            </div>

            {editing ? (
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {editableFields.map(({ key, label }) => (
                    <div key={key}>
                      <label className="text-xs text-zinc-500 mb-1.5 block font-medium">{label}</label>
                      <input
                        value={editForm[key] || ""}
                        onChange={(e) => setEditForm({ ...editForm, [key]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800/60 border border-zinc-700/50 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSaveEdit}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    <Save size={14} />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm border border-zinc-700 transition-all hover:text-white"
                  >
                    <X size={14} />
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
                  {infoFields.map(({ label, icon: Icon, key, color, link }) => (
                    <div key={key} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800/60 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon size={14} className={color} />
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 mb-0.5">{label}</div>
                        {link && client[key] ? (
                          <a
                            href={link}
                            target="_blank"
                            className={`text-sm ${color} hover:underline flex items-center gap-1`}
                          >
                            {client[key]}
                            <ExternalLink size={11} className="opacity-50" />
                          </a>
                        ) : (
                          <div className="text-sm text-zinc-300">{client[key] || <span className="text-zinc-600">—</span>}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra info row */}
                <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-zinc-800/60">
                  {client.prioridade && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Star size={12} className={client.prioridade.toLowerCase().includes("capital") ? "text-amber-400" : "text-zinc-600"} />
                      <span className="text-zinc-500">Prioridade:</span>
                      <span className="text-zinc-300">{client.prioridade}</span>
                    </div>
                  )}
                  {client.temperatura && (
                    <div className="flex items-center gap-1.5 text-xs">
                      {tempIcon(client.temperatura)}
                      <span className="text-zinc-500">Temperatura:</span>
                      <span className="text-zinc-300">{client.temperatura}</span>
                    </div>
                  )}
                  {client.fonte && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Globe size={12} className="text-zinc-600" />
                      <span className="text-zinc-500">Fonte:</span>
                      <span className="text-zinc-300">{client.fonte}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs">
                    <Clock size={12} className="text-zinc-600" />
                    <span className="text-zinc-500">Atualizado:</span>
                    <span className="text-zinc-300">{formatDate(client.updated_at)}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Observations / Follow-ups */}
          <ObservationTimeline
            observations={observations}
            onAdd={handleAddObservation}
            onDelete={handleDeleteObservation}
          />
        </div>
      </div>
    </>
  );
}

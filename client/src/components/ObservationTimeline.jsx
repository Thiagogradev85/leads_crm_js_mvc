import React, { useState } from "react";
import {
  MessageSquarePlus, Clock, Trash2, StickyNote, PhoneCall, Mail as MailIcon,
  CalendarCheck, AlertCircle, Send,
} from "lucide-react";
import { formatDate } from "../lib/constants";

const OBS_TYPES = [
  { value: "observacao", label: "Observação", icon: StickyNote, color: "text-zinc-400" },
  { value: "followup", label: "Follow-up", icon: PhoneCall, color: "text-emerald-400" },
  { value: "email_enviado", label: "Email enviado", icon: MailIcon, color: "text-sky-400" },
  { value: "reuniao", label: "Reunião", icon: CalendarCheck, color: "text-violet-400" },
  { value: "alerta", label: "Alerta", icon: AlertCircle, color: "text-amber-400" },
];

function typeInfo(type) {
  return OBS_TYPES.find((t) => t.value === type) || OBS_TYPES[0];
}

export default function ObservationTimeline({ observations, onAdd, onDelete }) {
  const [content, setContent] = useState("");
  const [type, setType] = useState("observacao");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await onAdd({ type, content: content.trim() });
      setContent("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add new observation form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <MessageSquarePlus size={16} className="text-emerald-400" />
          </div>
          <div className="font-semibold text-sm">Nova Observação / Follow-up</div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3 flex-wrap">
            {OBS_TYPES.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setType(t.value)}
                  className={
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all " +
                    (type === t.value
                      ? "bg-zinc-800 border-zinc-600 text-white"
                      : "bg-transparent border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-400")
                  }
                >
                  <Icon size={13} className={type === t.value ? t.color : ""} />
                  {t.label}
                </button>
              );
            })}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Descreva o andamento do processo de vendas, observações ou próximos passos..."
            className="w-full px-4 py-3 rounded-xl bg-zinc-800/60 border border-zinc-700/50 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-600 resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={14} />
              {submitting ? "Salvando..." : "Adicionar"}
            </button>
          </div>
        </div>
      </form>

      {/* Timeline */}
      {observations.length > 0 ? (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-0 bottom-0 w-px bg-zinc-800" />

          <div className="space-y-4">
            {observations.map((obs) => {
              const info = typeInfo(obs.type);
              const Icon = info.icon;
              return (
                <div key={obs.id} className="relative flex gap-4 group">
                  {/* Timeline dot */}
                  <div className="relative z-10 w-[47px] flex-shrink-0 flex justify-center">
                    <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                      <Icon size={16} className={info.color} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 rounded-xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors overflow-hidden">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${info.color}`}>{info.label}</span>
                          <span className="text-zinc-700">·</span>
                          <span className="flex items-center gap-1 text-xs text-zinc-600">
                            <Clock size={11} />
                            {formatDate(obs.created_at)}
                          </span>
                        </div>
                        <button
                          onClick={() => onDelete(obs.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Deletar"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{obs.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center">
            <StickyNote size={24} className="text-zinc-600" />
          </div>
          <div className="text-zinc-500 text-sm">Nenhuma observação ainda</div>
          <div className="text-zinc-600 text-xs">Adicione follow-ups para acompanhar o processo de vendas</div>
        </div>
      )}
    </div>
  );
}

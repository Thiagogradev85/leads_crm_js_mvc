import React from "react";
// import { STATUS, statusPill } from "../lib/constants";

export default function StatusBadge({ status, statusId, statusList = [], onChange }) {
  // status: nome do status, statusId: id do status
  // Normalização robusta para id e label
  const getId = (s, idx) => s.id ?? s.ID ?? idx;
  const getLabel = (s) => s.name ?? s.nome ?? s.label ?? s.descricao ?? "Sem nome";
  const currentId = statusId || (statusList.find((s) => getLabel(s) === status)?.id ?? "");
  const currentName = status || (statusList.find((s) => getId(s) === statusId)?.name ?? "");

  if (onChange) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full border font-medium shadow-sm bg-zinc-800 border-zinc-700" style={{ fontSize: (typeof fontSize !== 'undefined' ? fontSize : '1rem') }}>
        <select
          value={currentId}
          onChange={e => onChange(Number(e.target.value))}
          className="bg-transparent outline-none cursor-pointer text-base text-inherit"
          style={{ fontSize: (typeof fontSize !== 'undefined' ? fontSize : '1rem'), padding: '0.5rem' }}
        >
          {statusList.map((s, idx) => {
            const id = getId(s, idx);
            const label = getLabel(s);
            return (
              <option key={id} value={id} className="bg-zinc-900 text-white" style={{ fontSize: (typeof fontSize !== 'undefined' ? fontSize : '1rem') }}>
                {label}
              </option>
            );
          })}
        </select>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium shadow-sm bg-zinc-800 border-zinc-700">
      {currentName}
    </span>
  );
}

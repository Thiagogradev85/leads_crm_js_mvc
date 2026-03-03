import React from "react";
import { STATUS, statusPill } from "../lib/constants";

export default function StatusBadge({ status, onChange }) {
  if (onChange) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium shadow-sm ${statusPill(status)}`}
      >
        <select
          value={status}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent outline-none cursor-pointer text-xs text-inherit"
        >
          {STATUS.filter((s) => s.value).map((s) => (
            <option key={s.value} value={s.value} className="bg-zinc-900 text-white">
              {s.label}
            </option>
          ))}
        </select>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-medium shadow-sm ${statusPill(status)}`}
    >
      {STATUS.find((s) => s.value === status)?.label || status}
    </span>
  );
}

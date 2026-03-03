import React from "react";
import { Users } from "lucide-react";

export default function EmptyState({ icon: Icon = Users, title, subtitle }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center">
        <Icon size={24} className="text-zinc-600" />
      </div>
      <div className="text-zinc-500 text-sm">{title}</div>
      {subtitle && <div className="text-zinc-600 text-xs">{subtitle}</div>}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getStates, importExcel } from "./lib/api.js";
import Sidebar from "./components/Sidebar";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import AllLeadsPage from "./pages/AllLeadsPage";

export default function App() {
  const [states, setStates] = useState([]);
  const [uf, setUf] = useState("");
  const [loading, setLoading] = useState(false);

  async function refreshStates() {
    const st = await getStates();
    setStates(st);
    if (!uf && st.length) setUf(st[0].uf);
  }

  useEffect(() => {
    refreshStates().catch(console.error);
  }, []);

  async function onImport(file) {
    setLoading(true);
    const result = await importExcel(file);
    await refreshStates();
    setLoading(false);
    alert(
      `Importação concluída!\n\n✅ Novos: ${result.imported}\n🔄 Atualizados: ${result.updated}\n\nDuplicatas são detectadas por Loja+Cidade+UF.`
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950">
      <Sidebar states={states} uf={uf} onSelectUf={setUf} onImport={onImport} />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route
            path="/"
            element={<ClientsPage uf={uf} onRefreshStates={refreshStates} />}
          />
          <Route
            path="/all-leads"
            element={<AllLeadsPage onRefreshStates={refreshStates} />}
          />
          <Route
            path="/client/:id"
            element={<ClientDetailPage onRefreshStates={refreshStates} />}
          />
        </Routes>
      </main>
    </div>
  );
}

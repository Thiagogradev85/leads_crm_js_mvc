import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { getStates, importExcel } from "./lib/api.js";
import Sidebar from "./components/Sidebar";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import AllLeadsPage from "./pages/AllLeadsPage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SellersPage from "./pages/SellersPage";

export default function App() {
  const [states, setStates] = useState([]);
  const [uf, setUf] = useState(""); // Começa vazio para mostrar todos os leads
  const [loading, setLoading] = useState(false);

  async function refreshStates() {
    const st = await getStates();
    setStates(st);
    // Não seleciona UF automaticamente, deixa vazio para mostrar todos os leads
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
                    {/* Redireciona /all-leads/sellers para /sellers */}
                    <Route path="/all-leads/sellers" element={<Navigate to="/sellers" replace />} />
          <Route
            path="/"
            element={<AllLeadsPage onRefreshStates={refreshStates} uf={uf} />}
          />
          <Route
            path="/all-leads"
            element={<AllLeadsPage onRefreshStates={refreshStates} uf={uf} />}
          />
          <Route
            path="/client/:id"
            element={<ClientDetailPage onRefreshStates={refreshStates} />}
          />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route
            path="/catalog/:catalogId/product/:prodId"
            element={<ProductDetailPage />}
          />
          <Route path="/sellers" element={<SellersPage />} />
        </Routes>
      </main>
    </div>
  );
}

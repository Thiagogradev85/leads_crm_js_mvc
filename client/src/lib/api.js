// ─── Product Follow-ups ───
export async function listProductFollowups(catalogId, prodId) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products/${prodId}/followups`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function addProductFollowup(catalogId, prodId, message) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products/${prodId}/followups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteProductFollowup(catalogId, prodId, fuId) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products/${prodId}/followups/${fuId}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
// Em produção, frontend e backend são servidos pelo mesmo servidor
// Em dev, aponta para localhost:8000
const API = import.meta.env.VITE_API_URL || "";

export async function getStates() {
  const r = await fetch(`${API}/states`);
  if (!r.ok) throw new Error(await r.text());
  return r.json(); // retorna [{ uf, count }]
}

export async function listClients({ uf, status, q }) {
  const params = new URLSearchParams();
  if (uf) params.set("uf", uf);
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const r = await fetch(`${API}/clients?${params.toString()}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function upsertClient(payload) {
  const r = await fetch(`${API}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateClient(id, payload) {
  const r = await fetch(`${API}/clients/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteClient(id) {
  const r = await fetch(`${API}/clients/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function importExcel(file) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API}/import`, { method: "POST", body: form });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ─── Client detail & Observations ───

export async function getClient(id) {
  const r = await fetch(`${API}/clients/${id}/detail`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function listObservations(clientId) {
  const r = await fetch(`${API}/clients/${clientId}/observations`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createObservation(clientId, payload) {
  const r = await fetch(`${API}/clients/${clientId}/observations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteObservation(clientId, obsId) {
  const r = await fetch(`${API}/clients/${clientId}/observations/${obsId}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

// ─── Catalog ───

export async function listCatalogs() {
  const r = await fetch(`${API}/catalogs`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getCatalog(id) {
  const r = await fetch(`${API}/catalogs/${id}`);
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function createCatalog(payload) {
  const r = await fetch(`${API}/catalogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateCatalog(id, payload) {
  const r = await fetch(`${API}/catalogs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function closeCatalog(id) {
  const r = await fetch(`${API}/catalogs/${id}/close`, { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteCatalog(id) {
  const r = await fetch(`${API}/catalogs/${id}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function addProduct(catalogId, payload) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateProduct(catalogId, prodId, payload) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products/${prodId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function deleteProduct(catalogId, prodId) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products/${prodId}`, { method: "DELETE" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function updateStock(catalogId, prodId, estoque) {
  const r = await fetch(`${API}/catalogs/${catalogId}/products/${prodId}/stock`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estoque }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function importCatalogPdf(catalogId, file) {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${API}/catalogs/${catalogId}/import-pdf`, { method: "POST", body: form });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

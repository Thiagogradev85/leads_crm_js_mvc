const API = "http://localhost:8000";

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

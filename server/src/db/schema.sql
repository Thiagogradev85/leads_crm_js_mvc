-- SQLite schema
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prioridade TEXT DEFAULT '',
  loja TEXT NOT NULL,
  cidade TEXT DEFAULT '',
  uf TEXT NOT NULL,
  endereco TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  fonte TEXT DEFAULT '',
  temperatura TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'enviado',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Unique key to avoid duplicates (loja + cidade + uf)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_unique ON clients (lower(loja), lower(cidade), uf);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  type TEXT NOT NULL,
  message TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

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
  status TEXT NOT NULL DEFAULT 'prospeccao',
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

CREATE TABLE IF NOT EXISTS observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'observacao',
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS catalogs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  mes_referencia TEXT NOT NULL,
  data_termino TEXT DEFAULT '',
  ativo INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS catalog_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  catalog_id INTEGER NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'scooter',
  modelo TEXT NOT NULL,
  nome TEXT DEFAULT '',
  bateria TEXT DEFAULT '',
  motor TEXT DEFAULT '',
  pneus TEXT DEFAULT '',
  velocidade TEXT DEFAULT '',
  autonomia TEXT DEFAULT '',
  tempo_carga TEXT DEFAULT '',
  carregador TEXT DEFAULT '',
  impermeabilidade TEXT DEFAULT '',
  peso TEXT DEFAULT '',
  estoque INTEGER NOT NULL DEFAULT 0,
  extras TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (catalog_id) REFERENCES catalogs(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_catalog_produto ON catalog_products (catalog_id, lower(modelo));

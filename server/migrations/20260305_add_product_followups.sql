-- Migration: Adiciona tabela de follow-ups para produtos do catálogo
CREATE TABLE IF NOT EXISTS catalog_product_followups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES catalog_products(id) ON DELETE CASCADE
);

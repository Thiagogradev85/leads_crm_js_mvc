-- Migration para Neon.tech/PostgreSQL: cria tabela de follow-ups de produto do catálogo
CREATE TABLE IF NOT EXISTS catalog_product_followups (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES catalog_products(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Migration: Cria tabela sellers para vendedores
CREATE TABLE IF NOT EXISTS sellers (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  ativo BOOLEAN NOT NULL DEFAULT TRUE
);

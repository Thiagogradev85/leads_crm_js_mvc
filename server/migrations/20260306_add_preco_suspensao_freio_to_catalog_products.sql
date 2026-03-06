-- Migração para adicionar preco, suspensao e freio na tabela catalog_products
ALTER TABLE catalog_products ADD COLUMN preco FLOAT DEFAULT 0;
ALTER TABLE catalog_products ADD COLUMN suspensao TEXT DEFAULT '';
ALTER TABLE catalog_products ADD COLUMN freio TEXT DEFAULT '';
-- Estoque já existe, não precisa adicionar

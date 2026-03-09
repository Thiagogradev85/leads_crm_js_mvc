-- Migration: Adiciona campo vendedor_id à tabela clients e cria FK para sellers
ALTER TABLE clients ADD COLUMN vendedor_id INTEGER REFERENCES sellers(id);

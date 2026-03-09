-- Migration: status relacional
-- Cria tabela status
CREATE TABLE status (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE
);

-- Popula status
INSERT INTO status (nome) VALUES
  ('Prospecção'),
  ('Contatado'),
  ('Ativo'),
  ('Inativo'),
  ('Cliente perdido');

-- Adiciona coluna status_id em clients
ALTER TABLE clients ADD COLUMN status_id INTEGER;

-- Atualiza status_id dos clientes existentes
UPDATE clients SET status_id = s.id
FROM status s
WHERE LOWER(clients.status) = LOWER(s.nome);

-- Torna status_id obrigatório
ALTER TABLE clients ALTER COLUMN status_id SET NOT NULL;

-- Remove coluna antiga status
ALTER TABLE clients DROP COLUMN status;

-- Foreign key
ALTER TABLE clients ADD CONSTRAINT fk_clients_status FOREIGN KEY (status_id) REFERENCES status(id);

# Leads CRM (Bun + React + Tailwind + Express + Neon/PostgreSQL)

Projeto monorepo:
- **server/** (backend Express MVC, Neon/PostgreSQL)
- **client/** (frontend React + Tailwind)
- Importa planilha **.xlsx**, lista por **estado (UF)**, CRUD, status, catálogo de produtos

> Banco: **Neon.tech/PostgreSQL** (cloud, grátis para dev). Não usa mais SQLite.

## Requisitos
- **Bun** instalado (Windows/PowerShell):
  ```powershell
  irm https://bun.sh/install.ps1 | iex
  ```
- VS Code
- Conta Neon.tech (https://neon.tech/) para criar um banco PostgreSQL

## Configuração do Banco Neon
1. Crie uma conta em https://neon.tech/
2. Crie um banco PostgreSQL e copie a string de conexão (ex: `postgres://user:pass@host/db`)
3. Crie um arquivo `.env` na pasta `server/` com:
   ```env
   DATABASE_URL=postgres://user:pass@host/db
   ```

## Rodar o Projeto
1. Abra a pasta `leads_crm_js_mvc` no VS Code
2. No Terminal (PowerShell), rode:
   ```powershell
   bun install
   bun run dev
   ```
- Frontend: http://localhost:5173
- Backend: http://localhost:8000

## Importar Excel
No app (Frontend), clique em **Importar .xlsx**.
Colunas esperadas (qualquer ordem):
- Loja, Cidade, UF, WhatsApp, Telefone, Email, Endereço, Fonte, Prioridade (Capital/Interior), Temperatura (A+B)
- Se houver `Status`, ele usa; senão, define `enviado`.

## Estrutura MVC (Backend)
- `server/src/models` (acesso ao banco Neon/PostgreSQL)
- `server/src/controllers` (regras HTTP)
- `server/src/routes` (rotas)
- `server/src/services` (importação, validação, PDF, Excel)
- `server/src/db` (conexão e migrações)

## Tabelas principais
- `clients` (leads/clientes)
- `catalogs` (catálogos de produtos)
- `catalog_products` (produtos do catálogo)
- `observations` (observações de clientes)

## Comandos úteis
```powershell
# só backend
bun run dev:server

# só frontend
bun run dev:client
```

## Tecnologias
- Bun
- React
- Tailwind CSS
- Express
- Neon.tech/PostgreSQL

# Leads CRM Desktop-ish (Bun + React + Tailwind + Node/Express + SQLite) — MVC

Projeto único (monorepo) com:
- **server/** (backend Express em MVC) + **SQLite** (banco grátis, arquivo local)
- **client/** (frontend React + Tailwind)
- Importa planilha **.xlsx** (sua base), lista por **estado (UF)**, CRUD e **status**:
  - enviado / respondeu / nao_interessa / pediu_catalogo

> Banco: **SQLite** (gratuito, simples: um arquivo `server/data/app.db`).

## Requisitos
- **Bun** instalado (Windows/PowerShell):
  ```powershell
  irm https://bun.sh/install.ps1 | iex
  ```
- VS Code

## Rodar no VS Code (PowerShell)
1) Abra a pasta `leads_crm_js_mvc` no VS Code.
2) No Terminal (PowerShell), rode:

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
- `server/src/models` (acesso ao banco)
- `server/src/controllers` (regras HTTP)
- `server/src/routes` (rotas)
- `server/src/services` (regras de negócio: importação, upsert, validação)
- `server/src/db` (conexão e migrações)

## Tabelas
- `clients` (leads/clientes)
- `events` (histórico simples: opcional, já incluso)

## Comandos úteis
```powershell
# só backend
bun run dev:server

# só frontend
bun run dev:client
```

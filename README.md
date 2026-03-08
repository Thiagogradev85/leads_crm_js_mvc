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
   DATABASE_URL=postgresql://neondb_owner:npg_i0o6kjgFABrT@ep-twilight-cell-a8wbr2ka-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require
   ```
   Ou copie o arquivo `.env.example` e renomeie para `.env`.


## Instalação e Rodando o Projeto
1. Clone o repositório:
   ```powershell
   git clone <url-do-repo>
   cd leads_crm_js_mvc
   ```
2. Instale as dependências do backend e frontend:
   ```powershell
   cd server
   bun install
   cd ../client
   bun install
   cd ..
   ```
3. Inicie o backend:
   ```powershell
   cd server
   bun run dev
   ```
4. Em outro terminal, inicie o frontend:
   ```powershell
   cd client
   bun run dev
   ```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
---

## Checklist para rodar em qualquer máquina
- [ ] Instalar Bun
- [ ] Clonar o repositório
- [ ] Criar `.env` na pasta `server` com sua string do Neon (ou copiar `.env.example`)
- [ ] Instalar dependências em `server` e `client`
- [ ] Rodar backend e frontend em terminais separados

---

## Dica de segurança
Nunca suba seu `.env` para o GitHub. Use sempre `.env.example` para compartilhar o formato.

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

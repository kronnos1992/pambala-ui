# Pambala UI

Frontend do marketplace Pambala — a maior plataforma de compra e venda de Angola.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilos:** TailwindCSS 4
- **State:** Zustand (com persist)
- **HTTP:** Axios (com interceptors para JWT)
- **Ícones:** Lucide React

## Estrutura

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── (auth)/
│   │   ├── login/page.tsx        # Login
│   │   └── register/page.tsx     # Registo
│   ├── produtos/
│   │   ├── page.tsx              # Listagem com filtros
│   │   └── [slug]/page.tsx       # Detalhe do produto
│   ├── lojas/
│   │   ├── page.tsx              # Lojas
│   │   └── [slug]/page.tsx       # Detalhe da loja
│   ├── carrinho/page.tsx         # Carrinho
│   ├── checkout/page.tsx         # Checkout
│   ├── minha-conta/
│   │   ├── page.tsx              # Perfil
│   │   └── pedidos/
│   │       ├── page.tsx          # Pedidos
│   │       └── [id]/page.tsx     # Detalhe do pedido
│   ├── vendedor/
│   │   ├── page.tsx              # Dashboard vendedor
│   │   └── produtos/
│   │       ├── page.tsx          # Gerir produtos
│   │       └── novo/page.tsx     # Criar produto
│   ├── admin/
│   │   ├── layout.tsx            # Layout com sidebar admin
│   │   ├── page.tsx              # Dashboard admin (stats)
│   │   ├── pedidos/page.tsx      # Gerir pedidos
│   │   ├── users/page.tsx        # Gerir utilizadores
│   │   ├── lojas/page.tsx        # Gerir lojas
│   │   ├── produtos/page.tsx     # Gerir produtos
│   │   ├── categorias/page.tsx   # Gerir categorias
│   │   └── avaliacoes/page.tsx   # Gerir avaliações
│   ├── como-funciona/page.tsx    # Como funciona
│   └── contacto/page.tsx         # Contacto
├── components/
│   ├── ui/                       # Button, Input, Card, Dialog, Toast, etc.
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── product/                  # ProductCard, Grid, Filters, Gallery
│   ├── store/                    # StoreCard
│   ├── cart/                     # CartDrawer
│   └── search/                   # SearchBar
├── lib/
│   ├── utils.ts                  # Utilitários (cn, formatPrice)
│   ├── api.ts                    # Cliente Axios com interceptors JWT
│   └── api-helpers.ts            # Funções de API + mapeamento tipos API↔UI
└── store/
    ├── auth-store.ts             # Autenticação (login, registro, sync carrinho)
    └── cart-store.ts             # Carrinho (local + API sync)
```

## Setup

```bash
# Instalar dependências
npm install

# Iniciar servidor (API deve estar a correr em :3001)
npm run dev
```

O frontend fica disponível em `http://localhost:3000`.

## Variáveis de ambiente

A API base URL está configurada em `src/lib/api.ts` como `http://localhost:3001/api`.

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Iniciar em produção |
| `npm run lint` | Verificar código |

## Rotas

| Rota | Descrição |
|------|-----------|
| `/` | Landing page com categorias e produtos em destaque |
| `/login` | Iniciar sessão |
| `/register` | Criar conta |
| `/produtos` | Listagem de produtos (busca, filtros por categoria/preco/condicao) |
| `/produtos/[slug]` | Detalhe do produto (galeria, reviews, loja) |
| `/lojas` | Lojas parceiras |
| `/lojas/[slug]` | Detalhe da loja (produtos, reviews) |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Finalizar compra (envio + pagamento) |
| `/minha-conta` | Perfil do utilizador |
| `/minha-conta/pedidos` | Histórico de pedidos |
| `/minha-conta/pedidos/[id]` | Detalhe do pedido (timeline) |
| `/vendedor` | Dashboard do vendedor (stats + pedidos recentes) |
| `/vendedor/produtos` | Gerir produtos do vendedor |
| `/vendedor/produtos/novo` | Criar novo produto |
| `/admin` | Dashboard admin (stats: receita, pedidos, users, lojas) |
| `/admin/pedidos` | Gerir todos os pedidos (filtro + mudanca de estado) |
| `/admin/users` | Gerir utilizadores (role, eliminacao) |
| `/admin/lojas` | Gerir lojas (verificacao, eliminacao) |
| `/admin/produtos` | Gerir todos os produtos (ativo/inativo, eliminacao) |
| `/admin/categorias` | CRUD de categorias |
| `/admin/avaliacoes` | Gerir/eliminar avaliacoes |
| `/como-funciona` | Como funciona |
| `/contacto` | Contacto |

## Credenciais de teste

| Perfil | Email | Password |
|--------|-------|----------|
| Admin | admin@pambala.ao | admin123 |
| Vendedor | vendedor@pambala.ao | seller123 |
| Comprador | comprador1@pambala.ao | buyer123 |

## Licença

MIT

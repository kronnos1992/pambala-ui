# Pambala UI

Frontend do marketplace Pambala — a maior plataforma de compra e venda de Angola.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilos:** TailwindCSS 4
- **State:** Zustand
- **HTTP:** Axios
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
│   ├── como-funciona/page.tsx    # Como funciona
│   └── contacto/page.tsx         # Contacto
├── components/
│   ├── ui/                       # Componentes base
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── product/                  # ProductCard, Grid, Filters
│   ├── store/                    # StoreCard
│   ├── cart/                     # CartDrawer
│   └── search/                   # SearchBar
├── lib/
│   ├── utils.ts                  # Utilitários (cn, formatPrice)
│   └── api.ts                    # Cliente Axios
└── store/
    ├── auth-store.ts             # Estado de autenticação
    └── cart-store.ts             # Estado do carrinho
```

## Setup

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend fica disponível em `http://localhost:3000`.

## Variáveis de ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

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
| `/` | Landing page |
| `/login` | Iniciar sessão |
| `/register` | Criar conta |
| `/produtos` | Listagem de produtos |
| `/produtos/[slug]` | Detalhe do produto |
| `/lojas` | Lojas parceiras |
| `/lojas/[slug]` | Detalhe da loja |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Finalizar compra |
| `/minha-conta` | Dashboard do comprador |
| `/minha-conta/pedidos` | Histórico de pedidos |
| `/vendedor` | Dashboard do vendedor |
| `/vendedor/produtos` | Gerir produtos |
| `/vendedor/produtos/novo` | Criar produto |
| `/como-funciona` | Como funciona |
| `/contacto` | Contacto |

## Licença

MIT

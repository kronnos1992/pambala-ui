# Pambala UI

Frontend do marketplace Pambala — a maior plataforma de compra e venda de Angola.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Estilos:** TailwindCSS 4 (mobile-first)
- **i18n:** next-intl (pt, en, es, fr, zh, ar — com suporte RTL)
- **E2E encryption:** tweetnacl (handshake + payloads cifrados)
- **State:** Zustand (com persist)
- **HTTP:** Axios (com interceptors para JWT)
- **Ícones:** Lucide React
- **Animações:** Framer Motion · **Gráficos:** Recharts

## Estrutura

```
src/
├── app/
│   ├── page.tsx                  # Redireciona para o locale (ex: /pt)
│   └── [locale]/
│       ├── layout.tsx            # Layout raiz com <html lang> + viewport/themeColor
│       ├── page.tsx              # Landing page (categorias + produtos em destaque, carrossel)
│       ├── (auth)/
│       │   ├── login/page.tsx    # Login
│       │   ├── register/page.tsx # Registo
│       │   └── callback/page.tsx # Callback de social auth
│       ├── produtos/
│       │   ├── page.tsx          # Listagem com filtros
│       │   └── [slug]/page.tsx   # Detalhe do produto
│       ├── lojas/
│       │   ├── page.tsx          # Lojas
│       │   └── [slug]/page.tsx   # Detalhe da loja
│       ├── carrinho/page.tsx     # Carrinho
│       ├── checkout/page.tsx     # Checkout
│       ├── minha-conta/
│       │   ├── page.tsx          # Perfil
│       │   └── pedidos/
│       │       ├── page.tsx      # Pedidos
│       │       └── [id]/page.tsx # Detalhe do pedido
│       ├── vendedor/
│       │   ├── page.tsx          # Dashboard vendedor
│       │   ├── produtos/
│       │   │   ├── page.tsx      # Gerir produtos
│       │   │   └── novo/page.tsx # Criar produto
│       │   ├── pedidos/
│       │   │   ├── page.tsx      # Pedidos da loja
│       │   │   └── [id]/page.tsx # Detalhe do pedido (comprovação de pagamento)
│       │   └── pagamento/page.tsx# Métodos de pagamento da loja
│       ├── admin/
│       │   ├── layout.tsx        # Layout com sidebar admin (off-canvas em mobile)
│       │   ├── page.tsx          # Dashboard admin (stats)
│       │   ├── pedidos/page.tsx  # Gerir pedidos
│       │   ├── disputas/page.tsx # Central de disputas (fila de mediação/suporte)
│       │   ├── users/page.tsx    # Gerir utilizadores
│       │   ├── lojas/page.tsx    # Gerir lojas
│       │   ├── produtos/page.tsx # Gerir produtos
│       │   ├── categorias/page.tsx # Gerir categorias
│       │   └── avaliacoes/page.tsx # Gerir avaliações
│       ├── como-funciona/page.tsx  # Como funciona
│       └── contacto/page.tsx       # Contacto
├── components/
│   ├── ui/                       # Button, Input, Card, Dialog, Toast, Avatar, etc.
│   ├── layout/                   # Header, Footer, Sidebar
│   ├── product/                  # ProductCard, Grid, Filters, Gallery
│   ├── store/                    # StoreCard
│   ├── cart/                     # CartDrawer
│   ├── orders/                   # OrderDisputeChat (chat tripartido de mediação em tempo real via SSE), moderação manual do admin, OrderTimeline (rastreamento do ciclo de vida do pedido)
│   └── search/                   # SearchBar
├── i18n/
│   ├── routing.ts                # Config de locales e retorno
│   ├── navigation.ts             # Link/useRouter tipados por locale
│   └── request.ts                # Carrega mensagens por request
├── messages/                     # pt.json, en.json, es.json, fr.json, zh.json, ar.json
├── lib/
│   ├── api.ts                    # Cliente Axios + interceptors JWT + E2E
│   ├── api-helpers.ts            # Funções de API + mapeamento tipos API↔UI
│   ├── e2e-client.ts             # Cifra/decifra payloads (tweetnacl)
│   ├── utils.ts                  # Utilitários (cn, formatPrice)
│   ├── category-icons.tsx
│   └── social.ts
└── store/
    ├── auth-store.ts             # Autenticação (login, registo, sync carrinho)
    └── cart-store.ts             # Carrinho (local + API sync)
```

## Setup

```bash
# Instalar dependências
npm install

# Iniciar servidor (API deve estar a correr em :3001)
npm run dev
```

O frontend fica disponível em `http://localhost:3000`. Ex.: `http://localhost:3000/pt`.

## Internationalização (i18n)

- O routing usa **next-intl** com prefixo de locale (`/pt`, `/en`, `/es`, `/fr`, `/zh`, `/ar`).
- As mensagens vivem em `src/messages/<locale>.json`; o `src/i18n/routing.ts` define os locales e a *default*.
- O layout raiz aplica `lang`/`dir` conforme o locale (RTL para `ar`).
- Para navegação interna use sempre `Link`/`useRouter` de `@/i18n/navigation` (preserva o locale).

## E2E encryption

Payloads sensíveis (login, perfil, pagamento) são cifrados com `tweetnacl` entre o cliente e a API:

1. `POST /api/security/handshake` troca as public keys e cria uma `sessionId`.
2. O cliente cifra os campos sensíveis e a API decifra na sessão correspondente.
3. Detalhes em `E2E_ENCRYPTION.md`.

## RBAC na UI

- `/admin/roles` gere roles e responsabilidades dinâmicas (CRUD + atribuição via checkboxes). Requer `admin.roles.manage` (só ADMIN).
- `/admin/users` lista e atribui as roles **dinamicamente** (chips de filtro e dropdown por utilizador vêm de `GET /api/roles`, incluindo `MANAGER`/Gestor e roles personalizadas).
- `/vendedor/loja` permite criar/editar a loja própria. Ao criar a loja, a conta passa automaticamente a `SELLER` (a API faz o `refreshUser` e o state do auth store é atualizado com a loja).
- O dashboard do vendedor mostra um banner de onboarding quando o utilizador é vendedor e ainda não tem loja.
- O `auth-store` armazena agora `roles` (todas as keys) e `store` (loja do `me`); `resolveUiRole` mapeia `ADMIN`→admin, `MANAGER`/`SELLER`→seller (o toggler do register continua a criar apenas `CLIENT` no backend).

## Responsividade (mobile-first)

O layout é construído **mobile-first**: tamanhos base para ecrãs pequenos e breakpoints `sm`/`md`/`lg`/`xl` para ampliar.

- **Grids:** 1 coluna em mobile → 2/3/4 colunas com `sm:`/`lg:` (ex. dashboard admin, lista de lojas).
- **Tabelas largas** (pedidos, admin): envolvidas em `overflow-x-auto` para rolar em 360–414px (ex. `vendedor/pedidos`).
- **Sidebar/off-canvas:** admin usa um layout com sidebar fora do ecrã em mobile e drawer sobreposto.
- **Carrossel da home:** conta de slides visíveis via `matchMedia` num estado (nunca ler `window` durante o render — evita hydration mismatch e não responde a rotação). As larguras dos slides são CSS (`w-full sm:w-1/2 lg:w-1/3`).
- **Segurança de área (notch):** `viewport` exportado com `viewportFit: cover` + `themeColor` claro/escuro (em `src/app/[locale]/layout.tsx`).
- **Toast/drawers:** ancorados com margens seguras (`inset-x-4`) para nunca saírem da viewport em ecrãs pequenos.

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
| `/` | Redireciona para o locale |
| `/login` | Iniciar sessão |
| `/register` | Criar conta |
| `/produtos` | Listagem de produtos (busca, filtros por categoria/preço/condição) |
| `/produtos/[slug]` | Detalhe do produto (galeria, reviews, loja) |
| `/lojas` | Lojas parceiras |
| `/lojas/[slug]` | Detalhe da loja (banner/capa, logótipo, produtos, reviews) |
| `/carrinho` | Carrinho de compras |
| `/checkout` | Finalizar compra (envio + pagamento) |
| `/minha-conta` | Perfil do utilizador (upload de foto de perfil) |
| `/minha-conta/pedidos` | Histórico de pedidos |
| `/minha-conta/pedidos/[id]` | Detalhe do pedido (timeline de rastreamento do ciclo de vida, código de validação único, upload/visualização de comprovativo, modal de justificativas de recusa, chat tripartido em tempo real via SSE e confirmação de recepção que fecha o ciclo) |
| `/vendedor` | Dashboard do vendedor (stats + pedidos recentes) |
| `/vendedor/produtos` | Gerir produtos do vendedor |
| `/vendedor/produtos/novo` | Criar novo produto |
| `/vendedor/pedidos` | Pedidos da loja do vendedor |
| `/vendedor/pedidos/[id]` | Detalhe do pedido (blocking de confirmação se comprovativo rejeitado por antifraude, visualização segura, auditoria, chat tripartido de mediação em tempo real via SSE e rastreamento do ciclo de vida: marcar enviado com transportadora/rastreio e marcar entregue) |
| `/vendedor/pagamento` | Métodos de pagamento da loja |
| `/vendedor/loja` | Loja do vendedor (criar/editar; logótipo + foto de capa com upload e preview; após guardar redireciona para o dashboard) |
| `/admin` | Dashboard admin (stats: receita, pedidos, users, lojas) |
| `/admin/pedidos` | Gerir todos os pedidos (filtro, validação de pagamentos, mediação via chat tripartido em tempo real via SSE e ações de moderação manual: aprovar comprovativo / rejeição definitiva no modal de auditoria) |
| `/admin/disputas` | Central de disputas: fila dedicada com todos os casos abertos (estado, risco do comprovativo, não lidas, último contacto) e acesso ao chat tripartido de mediação + badge de não lidas no menu/header |
| `/admin/users` | Gerir utilizadores (role, eliminação) |
| `/admin/lojas` | Gerir lojas (verificação, eliminação) |
| `/admin/produtos` | Gerir todos os produtos (ativo/inativo, eliminação) |
| `/admin/categorias` | CRUD de categorias |
| `/admin/avaliacoes` | Gerir/eliminar avaliações |
| `/admin/roles` | RBAC: CRUD de roles, responsabilidades e atribuição de permissões |
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
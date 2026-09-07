# Tradução Automática Dinâmica - Guia de Implementação

## 📋 Resumo

Foi implementado um sistema completo de **tradução automática dinâmica** que traduz todo o conteúdo do site automaticamente quando o usuário seleciona um novo idioma.

## 🏗️ Arquitetura

### Backend (pambala-api)

1. **Novo módulo de tradução**: `src/modules/translations/`
   - Rota: `/api/translations`
   - Endpoints:
     - `POST /api/translations/translate` - Traduz array de textos
     - `POST /api/translations/translate-batch` - Traduz batch com IDs

2. **Handlers**: `src/handlers/translations.handlers.ts`
   - `translateHandler()` - Processa requisições simples de tradução
   - `translateBatchHandler()` - Processa requisições em batch

3. **Python Integration**: `translation_agent/translate_api.py`
   - Wrapper que chama o existing `translation_agent`
   - Suporta os 5 idiomas: en, es, fr, zh, ar
   - Usa glossário + LLM (OpenRouter compatible)

### Frontend (pambala-ui)

1. **Hook**: `src/hooks/use-translate.ts`
   - `useTranslate()` - Hook para chamar API de tradução
   - Métodos: `translate()` e `translateBatch()`
   - Gerencia loading e errors

2. **Provider**: `src/components/locale-provider.tsx`
   - `LocaleProvider` - Gerencia tradução automática
   - Detecta mudança de locale
   - Extrai texto do DOM
   - Chama API de tradução
   - Aplica tradução no DOM dinamicamente

3. **Layout**: `src/app/[locale]/layout.tsx`
   - Integração do `LocaleProvider` no layout raiz

## 🚀 Como Funciona

### Fluxo de Tradução Automática

1. Usuário clica no language-switcher
2. Locale muda via `next-intl`
3. `LocaleProvider` detecta mudança
4. Extrai todo o texto do DOM
5. Chama `/api/translations/translate-batch`
6. Backend chama Python `translation_agent`
7. Tradução retorna via API
8. DOM é atualizado com conteúdo traduzido

### Arquitetura de Tradução

```
Frontend (Next.js)
    ↓
useTranslate Hook → /api/translations
    ↓
Backend (Hono)
    ↓
Python subprocess (translate_api.py)
    ↓
translation_agent (glossário + LLM)
    ↓
OpenRouter API (LLM call)
    ↓
Tradução + Glossário Cache
    ↓
Retorna JSON de tradução
```

## 📝 Requisições API

### Traduzir Array de Textos

```bash
POST /api/translations/translate
Content-Type: application/json

{
  "texts": ["Bem-vindo", "Produtos", "Carrinho"],
  "locale": "en",
  "source": "pt"  // opcional, default: "pt"
}
```

**Resposta:**
```json
{
  "success": true,
  "translations": {
    "Bem-vindo": "Welcome",
    "Produtos": "Products",
    "Carrinho": "Shopping Cart"
  }
}
```

### Traduzir Batch com IDs

```bash
POST /api/translations/translate-batch
Content-Type: application/json

{
  "items": [
    { "id": "prod-1", "text": "iPhone 15" },
    { "id": "prod-2", "text": "Samsung Galaxy" }
  ],
  "locale": "es",
  "source": "pt"
}
```

**Resposta:**
```json
{
  "success": true,
  "translations": {
    "prod-1": "iPhone 15",
    "prod-2": "Samsung Galaxy"
  }
}
```

## 🔧 Configuração

### Pré-requisitos

1. **Python 3.8+** instalado
2. **OpenRouter API Key** no `.env` do backend:
   ```
   OPENAI_API_KEY=sk-or-v1-xxxxx...
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   ```

3. **Dependencies** instaladas:
   - Backend: `npm install` (já tem hono)
   - Frontend: `npm install` (já tem axios, next-intl)

### Variáveis de Ambiente

Backend (`.env`):
```
OPENAI_API_KEY=sk-or-v1-xxxxx
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=anthropic/claude-3-haiku
```

Frontend (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📊 Limitações & Considerações

1. **Performance**:
   - Tradução é assíncrona, pode levar 2-5 segundos
   - Batch limit: ~40 textos por requisição
   - Cache no glossário para textos já traduzidos

2. **Qualidade**:
   - Usa glossário inteligente para termos técnicos
   - Preserva placeholders, URLs, números
   - Contexto markdown é respeitado

3. **Custo**:
   - Cada tradução chama o LLM (OpenRouter)
   - Recomendado usar glossário cache para reduzir custos
   - Texto em português é skipado (não chama API)

4. **Idiomas Suportados**:
   - en (English)
   - es (Español)
   - fr (Français)
   - zh (简体中文)
   - ar (العربية)

## ✅ Testes Manuais

### Testar Backend

```bash
cd pambala-api

# Teste simples de tradução
curl -X POST http://localhost:3001/api/translations/translate \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Bem-vindo", "Produtos"],
    "locale": "en",
    "source": "pt"
  }'
```

### Testar Frontend

1. Iniciar backend: `cd pambala-api && npm run dev`
2. Iniciar frontend: `cd pambala-ui && npm run dev`
3. Abrir http://localhost:3000
4. Clicar no language-switcher
5. Selecionar novo idioma (ex: English)
6. Verificar se o conteúdo foi traduzido

## 🐛 Troubleshooting

### Erro: "Translation service unavailable"

- Verificar se backend está rodando
- Verificar se API key do OpenRouter está configurada
- Verificar logs do backend para mais detalhes

### Erro: "Invalid locale"

- Usar apenas: en, es, fr, zh, ar
- Português (pt) é o idioma source, não é traduzido

### DOM não é atualizado

- Verificar console do navegador para errors
- Aumentar delay no useEffect do LocaleProvider (default: 100ms)
- Verificar se textos tem entre 2-500 caracteres

## 📚 Arquivos Criados/Modificados

### Criados
- ✅ `pambala-api/src/modules/translations/routes.ts`
- ✅ `pambala-api/src/handlers/translations.handlers.ts`
- ✅ `pambala-api/translation_agent/translate_api.py`
- ✅ `pambala-ui/src/hooks/use-translate.ts`
- ✅ `pambala-ui/src/components/locale-provider.tsx`

### Modificados
- ✅ `pambala-api/src/index.ts` (adicionado rota de tradução)
- ✅ `pambala-ui/src/app/[locale]/layout.tsx` (adicionado LocaleProvider)

## 🚀 Próximas Melhorias

1. **Melhorar extração de textos**: Usar semantic HTML parsing
2. **Cache no cliente**: LocalStorage para textos já traduzidos
3. **Streaming**: Atualizar DOM em tempo real conforme tradução chega
4. **Analytics**: Rastrear quais idiomas são mais usados
5. **Fallback graceful**: Usar cached translations se API falhar
6. **Suporte a componentes dinâmicos**: Re-traduzir quando novo conteúdo é adicionado

## 📞 Contato

Para dúvidas ou issues, abrir issue no repositório.

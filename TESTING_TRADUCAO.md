# Guia de Teste - Tradução Automática Dinâmica

## 🧪 Testes Manuais

### 1. Inicializar Backend e Frontend

```bash
# Terminal 1: Backend
cd C:\Users\Jaime\Documents\Repos\pambala-api
npm run dev

# Terminal 2: Frontend
cd C:\Users\Jaime\Documents\Repos\pambala-ui
npm run dev
```

### 2. Testar API de Tradução via cURL

```bash
# Traduzir para Inglês
curl -X POST http://localhost:3001/api/translations/translate \
  -H "Content-Type: application/json" \
  -d '{
    "texts": ["Bem-vindo ao Pambala", "Produtos", "Carrinho de Compras"],
    "locale": "en",
    "source": "pt"
  }'

# Esperado:
{
  "success": true,
  "translations": {
    "Bem-vindo ao Pambala": "Welcome to Pambala",
    "Produtos": "Products",
    "Carrinho de Compras": "Shopping Cart"
  }
}
```

### 3. Testar Batch Endpoint

```bash
curl -X POST http://localhost:3001/api/translations/translate-batch \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "id": "1", "text": "iPhone 15" },
      { "id": "2", "text": "Samsung Galaxy S24" }
    ],
    "locale": "es",
    "source": "pt"
  }'

# Esperado:
{
  "success": true,
  "translations": {
    "1": "iPhone 15",
    "2": "Samsung Galaxy S24"
  }
}
```

### 4. Testar No Navegador

1. Abrir http://localhost:3000
2. Observar o site em português
3. Clicar no language-switcher (globo no header)
4. Selecionar "English"
5. Verificar se:
   - A URL muda para `/en` 
   - O conteúdo do site é traduzido
   - Não há erros no console

### 5. Casos de Teste Específicos

#### Test 5.1: Múltiplos Idiomas
```
1. Carregar em PT ✓
2. Trocar para EN ✓
3. Verificar tradução
4. Trocar para ES
5. Verificar tradução diferente
6. Voltar para PT
7. Deve voltar ao original
```

#### Test 5.2: Tradução Rápida
```
1. Abrir devtools (F12)
2. Ir para "Network" tab
3. Trocar idioma
4. Verificar tempo de requisição em /api/translations
5. Deve estar abaixo de 5 segundos
```

#### Test 5.3: Cache de Glossário
```
1. Traduzir "iPhone" para ES
2. Anotar tempo: T1
3. Traduzir "iPhone" novamente
4. Anotar tempo: T2
5. T2 deve ser MUITO menor que T1 (cache)
```

#### Test 5.4: Caracteres Especiais
```
Testar tradução com:
- Acentos: "Café, açúcar, pão"
- Preços: "Kz 50.000,00"
- URLs: "https://pambala.ao"
- Placeholders: "Olá {{nome}}"
```

#### Test 5.5: Árabe (RTL)
```
1. Trocar para العربية (ar)
2. Verificar se:
   - Texto fica alinhado à direita
   - Números continuam de esquerda para direita
   - Preços estão corretos
```

## 📊 Pontos de Verificação

### Frontend
- [ ] LocaleProvider carrega sem erros
- [ ] useTranslate hook funciona
- [ ] Tradução aparece no DOM
- [ ] Múltiplas mudanças de idioma funcionam
- [ ] Sem memory leaks (abrir/fechar devtools)
- [ ] Responsive em mobile/tablet/desktop

### Backend
- [ ] /api/translations/translate retorna 200
- [ ] /api/translations/translate-batch retorna 200
- [ ] Error handling funciona (400/503/500)
- [ ] Suporta todos os 5 idiomas
- [ ] Rejeita locales inválidas

### Python
- [ ] translate_api.py lê stdin corretamente
- [ ] Retorna JSON válido
- [ ] Suporta caracteres UTF-8
- [ ] Glossário é usado para cache
- [ ] Erro gracefully se LLM não disponível

## 🐛 Troubleshooting

### Erro: "Translation service unavailable (503)"
```
1. Verificar se backend está rodando
2. Verificar se Python está instalado: python --version
3. Verificar se OpenRouter API key está em .env
4. Verificar permissões: ls -la translation_agent/translate_api.py
```

### Erro: "Invalid locale"
```
- Verificar se locale está em: en, es, fr, zh, ar
- Não usar pt como target (é source)
```

### DOM não é atualizado
```
1. Abrir Console (F12)
2. Procurar por errors
3. Verificar se useTranslate está retornando dados
4. Verificar Network tab para requisição da API
5. Aumentar delay em LocaleProvider (line 47, default 100ms)
```

### Python subprocess não finaliza
```
1. Verificar se há process Python rodando: ps aux | grep python
2. Kill: kill -9 <PID>
3. Reiniciar backend: npm run dev
```

## ✅ Checklist de Completo

- [ ] Backend compila sem erros
- [ ] Frontend compila sem erros
- [ ] API /api/translations/translate funciona
- [ ] API /api/translations/translate-batch funciona
- [ ] LocaleProvider integrado no layout
- [ ] Tradução automática funciona no navegador
- [ ] Todos os 5 idiomas testados
- [ ] RTL (árabe) funciona
- [ ] Cache de glossário funciona
- [ ] Documentação completa

## 📝 Logs Esperados

### Terminal Backend (npm run dev)
```
[...] GET /api/translations/translate
[...] POST /api/translations/translate 200
[...] Translation completed in 2.3s
```

### Console Frontend (F12)
```
Translation hook initialized
Translating 45 texts to: en
Translation successful: 45 items
```

### Python stderr (se houver warnings)
```
Warning: LLM initialization failed: ... (expected se offline)
Glossary loaded: 234 terms
```

---

**Após completar todos os testes, a implementação está pronta para produção!** 🎉

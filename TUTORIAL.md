# 📚 Tutorial — Discoverability completa

Como ativar Google Search Console, Bing Webmaster Tools, Google Business Profile e outros sinais de descoberta pra que o site da Maple Bear Bento Gonçalves apareça melhor no Google, Bing, ChatGPT, Claude, Gemini e Perplexity.

**Ordem de prioridade** (faça nessa ordem):

1. ⭐ Google Search Console (15min) — essencial
2. ⭐ Google Business Profile / Maps (30min, depende de endereço) — alto impacto local
3. Bing Webmaster Tools (10min) — fácil, vale a pena
4. IndexNow (auto, já configurado depois) — acelera reindexação
5. External signals (Wikidata, diretórios) — ver `EXTERNAL-SIGNALS.md`

---

## 1. ⭐ Google Search Console (GSC)

**Pra que serve:** monitora a saúde do seu site no Google Search, mostra que palavras-chave trazem tráfego, alertas de erros, e permite submeter sitemap pra indexação rápida.

### Passo a passo

1. Abre **https://search.google.com/search-console** (login com a conta Google)
2. Clica **"Add property"** (ou "Adicionar propriedade")
3. Escolhe **"URL prefix"** (não "Domain", senão precisa DNS)
4. Digita: `https://maplebearbg.com.br/`
5. Clica **Continue**

### Verificação

GSC vai pedir verificação. Várias opções aparecem — **escolha "HTML tag"** (a mais fácil):

1. GSC mostra uma meta tag tipo:
   ```html
   <meta name="google-site-verification" content="ABC123...XYZ">
   ```
2. **Copia o valor do `content="..."`** (só o token, exemplo: `ABC123...XYZ`)
3. Me passa esse token aqui no chat
4. Eu adiciono no `<head>` do site, comito e pusho
5. Aguarda 1-2 minutos pro deploy
6. Volta no GSC, clica **Verify**

### Depois de verificado

No GSC:
1. **Sitemaps** → **Add a new sitemap** → digita `sitemap.xml` → Submit
2. **URL Inspection** → cola `https://maplebearbg.com.br/` → **Request indexing**
3. Repita para `/sobre/`, `/faq/`, `/diario/`

**Resultado:** Google começa a indexar o site em 24-48h. Após 1 semana você já consegue ver dados de aparições nas buscas.

---

## 2. ⭐⭐ Google Business Profile (GBP) — antigo Google Meu Negócio

**Pra que serve:** quando alguém pesquisa "escola bilíngue Bento Gonçalves" no Google, aparece o **card lateral à direita** com fotos, telefone, horário, mapa e avaliações da escola. **Esse é o maior fator pra Google Maps e busca local.**

### Pré-requisito

- **Endereço físico definitivo da escola** — obrigatório
- Pessoa autorizada a receber correspondência no endereço (vai chegar cartão de verificação)

### Passo a passo

1. Abre **https://business.google.com/create**
2. Login com conta Google
3. Digita: `Maple Bear Bento Gonçalves` → Continue
4. Categoria: **"Escola"** ou **"Escola particular"** ou **"Escola bilíngue"**
5. Você quer adicionar localização? **Sim** → preenche endereço completo
6. Você atende clientes fora desse endereço? **Não**
7. Telefone: `+55 54 99931-5480`
8. Website: `https://maplebearbg.com.br/`
9. **Concluir**

### Verificação (pode levar até 2 semanas)

Google vai mandar **cartão postal físico** com código pro endereço. Quando chegar:
1. Volta em business.google.com
2. **Verify** → digita o código
3. Pronto, listing ativo

### O que preencher depois de verificar (faz uma grande diferença)

- **Fotos:** 10+ fotos da escola (fachada, salas, crianças com autorização, equipe)
- **Horários:** Seg-Sex, 7:30-18:30 (ou o que for real)
- **Descrição:** copia da nossa `llms.txt`
- **Atributos:** Wi-Fi grátis, estacionamento, atendimento em inglês
- **Posts:** publicar 1 post/semana (eventos, fotos, novidades) — isso aumenta visibilidade
- **Pedir reviews:** mandar link de review pros pais matriculados

**Link de pedir review** (formato): `https://search.google.com/local/writereview?placeid=SEU_PLACE_ID`
(o Place ID aparece no painel do GBP depois de verificado)

---

## 3. Bing Webmaster Tools

**Pra que serve:** Bing alimenta DuckDuckGo, Yahoo, e (importante) o **Bing também treina o ChatGPT** (parceria Microsoft × OpenAI). Indexar bem no Bing melhora aparição no ChatGPT.

### Passo a passo

1. Abre **https://www.bing.com/webmasters**
2. Login com Microsoft/Google
3. **Add site** → cola `https://maplebearbg.com.br/`
4. Pede verificação

### Atalho (super útil)

Bing Webmaster tem **"Import from Google Search Console"** — se você já fez o GSC primeiro, importa tudo automaticamente, sem nova verificação.

Se não importar:
- Pega meta tag `msvalidate.01` igual ao GSC
- Me passa o token
- Eu adiciono no site

### Depois de verificado

1. **Sitemaps** → submit `https://maplebearbg.com.br/sitemap.xml`
2. **URL Submission** → submit URLs principais
3. **IndexNow API key** — gera uma chave (32 chars). Me passa pra eu plugar no sistema (acelera indexação a cada push).

---

## 4. IndexNow (acelera indexação)

**Pra que serve:** quando você atualiza o site, IndexNow notifica Bing/Yandex em segundos (em vez de esperar eles descobrirem). Reduz tempo de indexação de dias pra horas.

### Setup

1. Você gera uma chave no Bing Webmaster (passo 3 acima): 32 caracteres hex
2. Me passa a chave
3. Eu crio:
   - Arquivo `/<chave>.txt` no site (contendo a chave)
   - GitHub Action que pinga IndexNow a cada push
4. Pronto — toda nova atualização vai pro Bing/Yandex em segundos

---

## 5. Resumo das ações por sua conta

Pra te ajudar a executar, aqui o checklist mínimo:

- [ ] **Hoje (15 min):** Criar property no GSC → me passar o `google-site-verification` token
- [ ] **Hoje (10 min):** Criar property no Bing Webmaster → me passar `msvalidate.01` + IndexNow key
- [ ] **Após confirmar endereço (30 min):** Criar Google Business Profile, aguardar verificação postal (2 semanas)
- [ ] **Depois da chegada do cartão postal:** Verificar GBP, preencher tudo, pedir reviews dos primeiros pais

Quando me passar os tokens, eu plugo no `<head>` de todas as páginas (index, sobre, faq, diário, artigos) e pusho na hora.

---

## 6. Verificação se funcionou

Após 1-2 semanas de tudo ativo:

**Pesquisar no Google:**
- `site:maplebearbg.com.br` — deve listar 10+ páginas indexadas
- `Maple Bear Bento Gonçalves` — você deve aparecer em #1 com knowledge card lateral

**Pesquisar no ChatGPT/Claude/Perplexity:**
- "Maple Bear em Bento Gonçalves" — deve citar o site
- "Escola bilíngue em Bento Gonçalves Rio Grande do Sul" — deve citar como opção

Se algum não funcionar, me chama que diagnostico.

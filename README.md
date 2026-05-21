# maplebearbg.com.br

Site institucional da **Maple Bear Bento Gonçalves** — escola bilíngue canadense, em Bento desde 2025; Year 1 (Ensino Fundamental) chegando em 2027.

Site estático puro (HTML + CSS + JS vanilla). Hospedado em **GitHub Pages**, DNS gerenciado pelo **Cloudflare**.

---

## Estrutura

```
.
├── index.html       # Página única (todas as seções)
├── styles.css       # Estilos (paleta, tipografia, layout)
├── script.js        # IntersectionObserver, embed YouTube on-click
├── llms.txt         # Discoverability pra IAs/assistentes
├── robots.txt       # SEO básico
├── sitemap.xml
├── CNAME            # GitHub Pages custom domain
├── .nojekyll        # Não processar como Jekyll
├── assets/
│   ├── favicon.svg
│   ├── logo.svg
│   └── og-image.svg # Substituir por PNG 1200×630 quando tiver foto real
└── README.md
```

---

## Editar conteúdo

Tudo em `index.html`. Sem build, sem compilação. Salva → recarrega.

**Trocar fotos:**
Cada capítulo da jornada tem um `.photo-frame` com gradiente CSS. Pra usar foto real:

```html
<!-- antes -->
<div class="photo-frame photo-1">
  <span class="photo-caption">18 meses — 3 anos</span>
</div>

<!-- depois -->
<div class="photo-frame">
  <img src="assets/photo-toddler.jpg" alt="Criança de 2 anos pintando em sala bilíngue Maple Bear" />
  <span class="photo-caption">18 meses — 3 anos</span>
</div>
```

E adiciona no CSS:
```css
.chapter-photo img { width: 100%; height: 100%; object-fit: cover; }
```

**Trocar vídeos:**
No HTML, o `data-video="dQw4w9WgXcQ"` é placeholder. Substitua pelo ID do YouTube real (a parte depois de `v=` na URL).

**Endereço:**
Procura `endereço a confirmar` em `index.html` e `llms.txt` e substitui quando tiver.

**E-mail:**
Hoje é `contato@maplebearbg.com.br` (placeholder). Quando tiver e-mail real, busca-e-substitui no projeto inteiro.

---

## Desenvolver localmente

Não precisa de servidor pra editar, mas pra testar JS de embed de vídeo:

```powershell
cd $HOME\maplebearbg-site
python -m http.server 8000
# abre http://localhost:8000
```

Ou com Node:
```powershell
npx serve .
```

---

## Deploy (GitHub Pages + Cloudflare)

### 1. Repositório GitHub
```powershell
cd $HOME\maplebearbg-site
git init
git add .
git commit -m "Initial site"
gh repo create ivyson-wq/maplebearbg.com.br --public --source=. --push
```

### 2. Ativar GitHub Pages
```powershell
gh api -X POST repos/ivyson-wq/maplebearbg.com.br/pages -f source[branch]=main -f source[path]=/
```

Ou via UI: Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.

### 3. Cloudflare DNS
Adicionar zone `maplebearbg.com.br` no Cloudflare, depois criar records:

```
A     @       185.199.108.153   proxy=off
A     @       185.199.109.153   proxy=off
A     @       185.199.110.153   proxy=off
A     @       185.199.111.153   proxy=off
CNAME www     ivyson-wq.github.io  proxy=off
```

**Importante:** `proxy=off` (DNS-only) na primeira vez. Senão GitHub Pages não consegue emitir certificado HTTPS.

Depois que o GitHub emitir o certificado (24h pode levar), pode ligar o proxy se quiser.

### 4. Migrar nameservers do GoDaddy → Cloudflare
No painel GoDaddy:
1. DNS → Nameservers → Change
2. Trocar pra "Custom" e usar os 2 nameservers que o Cloudflare te dá ao adicionar o domínio (algo como `lara.ns.cloudflare.com` e `theo.ns.cloudflare.com`)
3. Propagação: 1h a 48h.

### 5. Verificar
```powershell
nslookup maplebearbg.com.br
# Deve retornar os IPs do GitHub (185.199.*)
```

---

## AI discoverability

Três camadas implementadas:

1. **JSON-LD `EducationalOrganization`** no `<head>` do `index.html` — Google, Bing e LLMs leem
2. **Schema.org microdata** (itemprop) no card de contato visível
3. **`/llms.txt`** — padrão emergente pra LLMs (Claude, ChatGPT, Perplexity)

Quando algum usuário perguntar a uma IA "escola bilíngue em Bento Gonçalves", a chance dela citar a Maple Bear BG sobe bastante.

---

## Paleta & tipografia

| | Hex |
|---|---|
| Paper (fundo) | `#FBF7F0` |
| Maple red | `#C8102E` |
| Ink (texto) | `#2A2522` |
| Honey | `#C9923D` |

Fontes (Google Fonts): **Fraunces** (display serif), **Spectral** (corpo), **Caveat** (manuscrito acento).

---

## Licença

Conteúdo institucional Maple Bear Bento Gonçalves. Direitos reservados.

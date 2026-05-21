// Porta artigos do blog Maple Bear Caxias do Sul para a Maple Bear Bento Gonçalves.
// - Extrai corpo do artigo + meta + cover.
// - Baixa cover do Supabase Storage pra assets/diario/<slug>/cover.jpg.
// - Aplica estética storybook (Fraunces + Spectral + paleta cream/maple) do site BG.
// - Troca refs Caxias→BG, WhatsApp, lead endpoint.
// - Adiciona <link rel="canonical"> apontando pra versão Caxias (proteção SEO duplicate).

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CAXIAS_BLOG_ROOT = 'C:/Users/ivyson.longoni/maple-bear-rs/maple-bear-blog';
const BG_ROOT = __dirname;
const OUT_ROOT = path.join(BG_ROOT, 'diario');
const ASSETS_ROOT = path.join(BG_ROOT, 'assets', 'diario');

// ── seleção: 5 artigos atemporais alta-conversão pro funil BG ──────────────
const ARTICLES = [
  { slug: 'idade-certa-escola-bilingue', tag: '01 · Decisão' },
  { slug: 'educacao-bilingue-beneficios-criancas', tag: '02 · Por quê' },
  { slug: 'metodologia-canadense-maple-bear', tag: '03 · Como' },
  { slug: 'imersao-ingles-vs-aulas-ingles', tag: '04 · Diferença real' },
  { slug: 'desenvolvimento-socioemocional-bilingue', tag: '05 · Além do idioma' },
  { slug: 'escola-bilingue-confunde-crianca', tag: '06 · Dúvida comum' },
  { slug: 'primeiro-dia-escola-bilingue-pais', tag: '07 · Adaptação' },
];

const WA_BG = '5554999315480';
const CANONICAL_BG = 'https://maplebearbg.com.br';
const CANONICAL_CAXIAS = 'https://maplebearcaxiasdosul.com.br';

// ── HTTP get with redirects ─────────────────────────────────────────────────
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const get = (u) => {
      https.get(u, (res) => {
        if ([301, 302, 307, 308].includes(res.statusCode)) {
          return get(res.headers.location);
        }
        if (res.statusCode !== 200) {
          file.close(); fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${res.statusCode} ${u}`));
        }
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
      }).on('error', (e) => { file.close(); fs.unlink(dest, () => {}); reject(e); });
    };
    get(url);
  });
}

// ── extract content from caxias source ──────────────────────────────────────
// Robusto para 3 formatos vistos:
//   A) <article> wrapper -> H1 + meta + cover-img + <article> CORPO </article> </article> ... <!-- Lead Capture
//   B) <article> wrapper -> H1 + meta + cover-img + CORPO + <!-- Lead Capture --> ... </article>
//   C) <article> wrapper -> H1 + meta (sem cover) + CORPO + <!-- Lead Capture --> ... </article>
function extract(html, slug) {
  const meta = {};

  // <title>
  meta.title = (html.match(/<title>([^|]+?)\s*\|/) || [, ''])[1].trim();

  // description
  meta.description = (html.match(/<meta name="description" content="([^"]+)"/) || [, ''])[1];

  // published date
  meta.publishedISO = (html.match(/<meta property="article:published_time" content="([^"]+)"/) || [, ''])[1];

  // word count
  meta.wordCount = parseInt((html.match(/"wordCount":\s*(\d+)/) || [, '0'])[1], 10);
  meta.readingMin = Math.max(2, Math.round(meta.wordCount / 200));

  // cover url (1ª img.cover-img) — attrs em qualquer ordem; fallback og:image
  const coverImgMatch = html.match(/<img\b[^>]*class="cover-img"[^>]*>/);
  const coverImgTag = coverImgMatch ? coverImgMatch[0] : '';
  const coverInImg = coverImgTag ? (coverImgTag.match(/src="([^"]+)"/) || [, ''])[1] : '';
  const coverInOg = (html.match(/<meta property="og:image" content="([^"]+)"/) || [, ''])[1];
  // og:image fallback é usado SÓ se aponta pro CDN do Lumied/Supabase (cover real), não o logo genérico
  const isRealOgCover = coverInOg && /(supabase|cloudfront).*\/blog\//i.test(coverInOg);
  meta.coverUrl = coverInImg || (isRealOgCover ? coverInOg : '');

  // body — pega do primeiro <article ...> até o primeiro de:
  //   <!-- Lead Capture, <!-- Bottom CTA, <div class="lead-form, <div class="cta-box, <div class="related, <div class="share-bar
  const startIdx = html.search(/<article\b[^>]*>/);
  if (startIdx < 0) throw new Error(`não achei <article> em ${slug}`);
  const tail = html.slice(startIdx + html.slice(startIdx).match(/<article\b[^>]*>/)[0].length);

  const endMarkers = [
    /<!--\s*Lead Capture/,
    /<!--\s*Bottom CTA/,
    /<!--\s*Related/,
    /<div class="lead-form/,
    /<div class="cta-box/,
    /<div class="related"/,
    /<div class="share-bar/,
  ];
  let endIdx = tail.length;
  for (const m of endMarkers) {
    const i = tail.search(m);
    if (i >= 0 && i < endIdx) endIdx = i;
  }
  let body = tail.slice(0, endIdx).trim();

  // Remove header (H1 + meta-row + cover img + possível <article> aninhado)
  // Estratégia: remove tudo antes do primeiro <p>, <h2>, <hr> ou <ul> (= primeiro elemento real do corpo).
  // Se a estrutura tiver <article> aninhado, abre ele primeiro.
  body = body
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>\s*/, '')
    .replace(/<div class="article-meta"[\s\S]*?<\/div>\s*/, '')
    .replace(/<img\b[^>]*class="cover-img"[^>]*>\s*/, '')
    .replace(/^\s*<article\b[^>]*>\s*/, '') // <article> aninhado de abertura
    .replace(/\s*<\/article>\s*$/, '')       // </article> de fechamento da última
    .trim();

  // Sanity check — body precisa ter pelo menos 500 chars
  if (body.length < 500) throw new Error(`corpo muito curto em ${slug} (${body.length} chars)`);

  meta.bodyHTML = body;
  return meta;
}

// ── rewrite text ────────────────────────────────────────────────────────────
function rewriteCaxiasToBG(text, slug) {
  return text
    // names
    .replace(/Maple Bear Caxias do Sul/g, 'Maple Bear Bento Gonçalves')
    .replace(/Maple Bear de Caxias do Sul/g, 'Maple Bear Bento Gonçalves')
    .replace(/Caxias do Sul/g, 'Bento Gonçalves')
    .replace(/Caxias/g, 'Bento Gonçalves')
    .replace(/Serra Gaúcha/g, 'Serra Gaúcha') // mantém — região é a mesma
    // urls
    .replace(/https:\/\/(www\.)?maplebearcaxiasdosul\.com\.br\b/g, CANONICAL_BG)
    // whatsapp numbers
    .replace(/5554999396742/g, WA_BG)
    .replace(/54\s*99939[-\s]?6742/g, '54 99931-5480')
    // lead endpoint — desativa por enquanto (BG não tem backend de captura)
    .replace(/https:\/\/insta-publisher\.vercel\.app\/api\/blog\/lead/g, '#lead-disabled')
    // strings duras
    .replace(/Família de Caxias/g, 'Família de Bento Gonçalves')
    .replace(/em Caxias do Sul/gi, 'em Bento Gonçalves');
}

// ── template BG-styled article wrapper ──────────────────────────────────────
function template({ slug, meta, tag, hasCover }) {
  const url = `${CANONICAL_BG}/diario/${slug}/`;
  const dateBR = meta.publishedISO ? new Date(meta.publishedISO).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#C8102E">

<title>${meta.title} | Maple Bear Bento Gonçalves</title>
<meta name="description" content="${meta.description}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">

<meta property="og:type" content="article">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Maple Bear Bento Gonçalves">
<meta property="og:title" content="${meta.title}">
<meta property="og:description" content="${meta.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${url}cover.jpg">
${meta.publishedISO ? `<meta property="article:published_time" content="${meta.publishedISO}">` : ''}

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Spectral:ital,wght@0,200..800;1,200..800&family=Caveat:wght@500;600&display=swap" rel="stylesheet">
<link rel="icon" type="image/svg+xml" href="/assets/favicon.svg">

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "${meta.title.replace(/"/g, '\\"')}",
  "description": "${meta.description.replace(/"/g, '\\"')}",
  ${meta.publishedISO ? `"datePublished": "${meta.publishedISO}",` : ''}
  "author": { "@type": "EducationalOrganization", "name": "Maple Bear Bento Gonçalves", "url": "${CANONICAL_BG}/" },
  "publisher": { "@type": "EducationalOrganization", "name": "Maple Bear Bento Gonçalves", "url": "${CANONICAL_BG}/" },
  "mainEntityOfPage": { "@type": "WebPage", "@id": "${url}" },
  "image": "${url}cover.jpg"
}
</script>

<style>
  :root {
    --paper:       #FBF7F0;
    --paper-deep:  #F4ECDF;
    --paper-shade: #EBE0CC;
    --ink:         #2A2522;
    --ink-soft:    #5C544D;
    --ink-faint:   #8A7F75;
    --maple:       #C8102E;
    --maple-deep:  #8B0A1F;
    --maple-soft:  #E84A5F;
    --honey:       #C9923D;
    --blush:       #F4DBCB;
    --canada:      #FFFFFF;
    --shadow-soft: 0 14px 30px -18px rgba(42, 37, 34, 0.18);
    --font-display: 'Fraunces', Georgia, serif;
    --font-body:    'Spectral', Georgia, serif;
    --font-script:  'Caveat', cursive;
  }
  *,*::before,*::after { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    margin: 0; background: var(--paper); color: var(--ink);
    font-family: var(--font-body); font-size: 1.1rem; line-height: 1.7;
    font-feature-settings: "kern","liga","calt";
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  a { color: var(--maple); text-decoration: none; transition: color .2s; }
  a:hover { color: var(--maple-deep); }
  ::selection { background: var(--maple); color: var(--paper); }

  /* Nav */
  .site-nav {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    gap: 2rem; padding: 1.1rem clamp(1.25rem, 4vw, 2.5rem);
    background: rgba(251,247,240,0.92);
    backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--paper-shade);
  }
  .brand { display: flex; align-items: center; gap: 0.7rem; color: var(--ink); }
  .brand-mark { width: auto; height: 38px; display: block; image-rendering: -webkit-optimize-contrast; filter: drop-shadow(0 4px 8px rgba(200,16,46,0.18)); }
  .brand-divider { display: inline-block; width: 1px; height: 28px; background: var(--paper-shade); margin: 0 .2rem; }
  .brand-text { display: flex; flex-direction: column; line-height: 1.05; font-family: var(--font-display); }
  .brand-tagline { font-weight: 500; font-size: 1.05rem; font-style: italic; color: var(--ink); letter-spacing: -.01em; }
  @media (max-width: 480px) { .brand-divider { display: none; } .brand-tagline { font-size: .95rem; } }
  .nav-links { display: flex; align-items: center; gap: 1.4rem; }
  .nav-links a { color: var(--ink-soft); font-family: var(--font-body); font-size: .95rem; font-weight: 500; }
  .nav-links a:hover { color: var(--maple); }
  .nav-cta { background: var(--maple); color: var(--paper) !important; padding: .6rem 1.1rem; border-radius: 999px; transition: background .2s, transform .2s; }
  .nav-cta:hover { background: var(--maple-deep); transform: translateY(-1px); }
  @media (max-width: 640px) { .nav-links a:not(.nav-cta) { display: none; } }

  /* Breadcrumbs */
  .breadcrumbs {
    max-width: 820px; margin: 1.5rem auto 0;
    padding: 0 clamp(1.25rem, 4vw, 2rem);
    font-size: .85rem; color: var(--ink-faint);
    font-family: var(--font-body);
  }
  .breadcrumbs a { color: var(--ink-faint); }
  .breadcrumbs a:hover { color: var(--maple); }
  .breadcrumbs span { margin: 0 .4rem; color: var(--ink-faint); }

  /* Article */
  article.main {
    max-width: 760px;
    margin: 0 auto;
    padding: clamp(2rem, 5vw, 3.5rem) clamp(1.25rem, 4vw, 2rem) 4rem;
  }
  .chapter-tag {
    font-family: var(--font-body);
    font-size: .8rem; font-weight: 500; letter-spacing: .15em;
    text-transform: uppercase; color: var(--maple);
    margin: 0 0 1rem;
  }
  h1.title {
    font-family: var(--font-display);
    font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 50;
    font-size: clamp(2rem, 5vw, 3.6rem);
    line-height: 1.05; letter-spacing: -.02em;
    color: var(--ink);
    margin: 0 0 1.25rem;
    font-weight: 400;
  }
  .meta-row {
    display: flex; gap: 1rem; flex-wrap: wrap;
    color: var(--ink-faint); font-size: .9rem;
    margin: 0 0 2rem;
    font-family: var(--font-body);
  }
  .meta-row .pill {
    background: var(--paper-deep);
    color: var(--ink-soft);
    padding: .2rem .65rem;
    border-radius: 999px;
    font-size: .78rem;
    font-weight: 500;
  }
  .cover-frame {
    margin: 0 0 2.5rem;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: var(--shadow-soft);
    aspect-ratio: 16 / 10;
    background: linear-gradient(135deg, var(--blush) 0%, var(--maple-soft) 100%);
    position: relative;
  }
  .cover-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .cover-placeholder {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    color: rgba(251,247,240,.95);
    font-family: var(--font-script);
    font-size: clamp(2rem, 4vw, 3.5rem);
    text-shadow: 0 4px 24px rgba(0,0,0,.25);
    padding: 1.5rem;
    text-align: center;
    line-height: 1.1;
  }

  /* Article body styles */
  article.main h2 {
    font-family: var(--font-display);
    font-variation-settings: "opsz" 144, "wght" 500, "SOFT" 40;
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    line-height: 1.15;
    margin: 3rem 0 1rem;
    color: var(--ink);
    letter-spacing: -.015em;
  }
  article.main h3 {
    font-family: var(--font-display);
    font-style: italic;
    font-size: clamp(1.2rem, 2vw, 1.45rem);
    margin: 2rem 0 .75rem;
    color: var(--ink);
  }
  article.main p { margin: 0 0 1.15rem; }
  article.main p strong { color: var(--ink); font-weight: 500; }
  article.main p em { color: var(--maple); font-style: italic; font-weight: 400; }
  article.main a {
    color: var(--ink); border-bottom: 1px solid var(--maple);
    transition: color .2s;
  }
  article.main a:hover { color: var(--maple); }

  article.main ul, article.main ol { margin: 1rem 0 1.5rem 1.5rem; padding: 0; }
  article.main li { margin-bottom: .55rem; }
  article.main ul li::marker { color: var(--maple); }

  article.main hr {
    border: none; height: 1px;
    background: linear-gradient(90deg, transparent, var(--paper-shade), transparent);
    margin: 3rem 0;
  }

  article.main table {
    width: 100%; border-collapse: collapse;
    margin: 2rem 0; font-size: .95rem;
    background: var(--paper);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-soft);
  }
  article.main th, article.main td {
    padding: .85rem 1rem; text-align: left;
    border-bottom: 1px solid var(--paper-shade);
  }
  article.main th {
    background: var(--paper-deep);
    color: var(--ink);
    font-family: var(--font-display);
    font-weight: 500;
    font-size: .85rem;
    letter-spacing: .03em;
  }
  article.main td { color: var(--ink-soft); }
  article.main tr:last-child td { border-bottom: none; }

  article.main blockquote {
    border-left: 3px solid var(--maple);
    padding: 1rem 1.5rem;
    margin: 2rem 0;
    background: var(--paper-deep);
    border-radius: 0 12px 12px 0;
    font-style: italic;
    color: var(--ink);
    font-size: 1.1rem;
  }

  article.main .highlight-box, article.main .scenario-box {
    background: var(--blush);
    border-left: 4px solid var(--maple);
    padding: 1.25rem 1.5rem;
    margin: 2rem 0;
    border-radius: 0 14px 14px 0;
    font-size: 1rem;
    color: var(--ink);
  }
  article.main .scenario-box {
    background: #FCEED7;
    border-left-color: var(--honey);
  }
  article.main .highlight-box strong { color: var(--maple-deep); }

  article.main details {
    margin: .8rem 0;
    border: 1px solid var(--paper-shade);
    border-radius: 14px;
    background: var(--paper);
    overflow: hidden;
  }
  article.main summary {
    cursor: pointer;
    font-family: var(--font-display);
    font-weight: 500;
    padding: 1rem 1.25rem;
    color: var(--ink);
    list-style: none;
    transition: background .2s;
  }
  article.main summary::after {
    content: "+";
    float: right;
    color: var(--maple);
    font-weight: 400;
    transition: transform .2s;
    font-size: 1.4rem;
    line-height: 1;
  }
  article.main details[open] summary { background: var(--paper-deep); }
  article.main details[open] summary::after { content: "−"; }
  article.main details > div, article.main details > p { padding: 1rem 1.25rem; color: var(--ink-soft); }

  /* Inline CTA (mid-article) */
  article.main .inline-cta {
    background: var(--ink);
    color: var(--paper);
    border-radius: 18px;
    padding: 2rem 1.5rem;
    margin: 3rem 0;
    text-align: center;
    box-shadow: var(--shadow-soft);
    position: relative;
    overflow: hidden;
  }
  article.main .inline-cta::before {
    content: ""; position: absolute;
    top: -80px; right: -80px;
    width: 240px; height: 240px;
    background: radial-gradient(circle, rgba(200,16,46,.25), transparent 70%);
    pointer-events: none;
  }
  article.main .inline-cta h3 {
    font-family: var(--font-display);
    color: var(--paper);
    font-size: 1.4rem;
    font-style: normal;
    margin: 0 0 .5rem;
  }
  article.main .inline-cta p {
    color: rgba(251,247,240,.75);
    font-size: 1rem;
    margin: 0 0 1.25rem;
  }
  article.main .inline-cta a, article.main .inline-cta .cta-btn {
    display: inline-flex; align-items: center; gap: .5rem;
    background: var(--maple);
    color: var(--paper); border: none;
    padding: .9rem 1.6rem;
    border-radius: 999px;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1rem;
    box-shadow: 0 10px 24px -10px rgba(200,16,46,.55);
    transition: transform .2s, background .2s;
    cursor: pointer;
    border-bottom: none;
  }
  article.main .inline-cta a:hover, article.main .inline-cta .cta-btn:hover {
    transform: translateY(-2px);
    background: var(--maple-deep);
    color: var(--paper);
  }

  /* Lead form — abre WhatsApp BG (sem backend) */
  .lead-form {
    background: var(--ink);
    color: var(--paper);
    border-radius: 22px;
    padding: clamp(2rem, 5vw, 3rem);
    margin: 3.5rem 0 1rem;
    text-align: center;
    box-shadow: var(--shadow);
    position: relative;
    overflow: hidden;
  }
  .lead-form::before {
    content: ""; position: absolute;
    top: -120px; right: -120px;
    width: 380px; height: 380px;
    background: radial-gradient(circle, rgba(200,16,46,.25), transparent 70%);
    pointer-events: none;
  }
  .lead-form h3 {
    font-family: var(--font-display);
    font-style: italic;
    font-variation-settings: "opsz" 144, "wght" 400, "SOFT" 60;
    font-size: clamp(1.5rem, 2.5vw, 2rem);
    color: var(--paper);
    margin: 0 0 .5rem;
    font-weight: 400;
    position: relative;
  }
  .lead-form > p {
    color: rgba(251,247,240,.7);
    font-size: 1rem;
    margin: 0 0 1.5rem;
    position: relative;
  }
  .lead-form form {
    display: flex; gap: .6rem;
    max-width: 460px;
    margin: 0 auto;
    flex-wrap: wrap;
    justify-content: center;
    position: relative;
  }
  .lead-form input {
    flex: 1; min-width: 180px;
    padding: .9rem 1.1rem;
    border: 1.5px solid rgba(251,247,240,.18);
    border-radius: 999px;
    background: rgba(251,247,240,.08);
    color: var(--paper);
    font-family: var(--font-body);
    font-size: .98rem;
    outline: none;
    transition: border-color .2s, background .2s;
  }
  .lead-form input::placeholder { color: rgba(251,247,240,.45); }
  .lead-form input:focus {
    border-color: var(--maple-soft);
    background: rgba(251,247,240,.12);
  }
  .lead-form button {
    background: var(--maple);
    color: var(--paper);
    border: none;
    padding: .9rem 1.6rem;
    border-radius: 999px;
    font-family: var(--font-body);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background .2s, transform .2s;
    box-shadow: 0 10px 24px -10px rgba(200,16,46,.55);
  }
  .lead-form button:hover { background: var(--maple-deep); transform: translateY(-2px); }
  .lead-form .trust {
    color: rgba(251,247,240,.4);
    font-size: .78rem;
    margin: 1rem 0 0;
    position: relative;
  }

  /* Bottom CTA */
  .cta-box {
    background: linear-gradient(135deg, var(--blush), var(--paper-deep));
    border-radius: 22px;
    padding: clamp(2rem, 5vw, 3rem);
    text-align: center;
    margin: 4rem 0 2rem;
    box-shadow: var(--shadow-soft);
  }
  .cta-box h3 {
    font-family: var(--font-display);
    font-size: clamp(1.4rem, 2.5vw, 2rem);
    color: var(--ink);
    margin: 0 0 .75rem;
    font-weight: 400;
  }
  .cta-box h3 em { color: var(--maple); font-style: italic; }
  .cta-box p { color: var(--ink-soft); font-size: 1.05rem; margin: 0 0 1.5rem; }
  .cta-box a {
    display: inline-flex; align-items: center; gap: .5rem;
    background: var(--maple);
    color: var(--paper) !important;
    padding: 1rem 1.8rem;
    border-radius: 999px;
    font-weight: 600;
    box-shadow: 0 12px 26px -10px rgba(200,16,46,.55);
    transition: transform .2s, background .2s;
    border-bottom: none;
  }
  .cta-box a:hover { background: var(--maple-deep); color: var(--paper); transform: translateY(-2px); }
  .cta-box .urgency { color: var(--maple); font-size: .85rem; margin-top: 1rem; font-weight: 500; }

  /* Share bar */
  .share-bar {
    display: flex; gap: .75rem; justify-content: center;
    margin: 2.5rem 0; flex-wrap: wrap;
  }
  .share-bar a {
    padding: .65rem 1.2rem;
    border-radius: 999px;
    font-size: .85rem;
    font-weight: 500;
    color: var(--paper) !important;
    transition: transform .2s;
    border-bottom: none;
  }
  .share-bar a:hover { transform: translateY(-2px); }
  .share-wa { background: #25D366; }
  .share-li { background: #0077B5; }
  .share-tw { background: #1DA1F2; }

  /* Related */
  .related { margin: 3rem 0 1rem; padding-top: 2rem; border-top: 1px solid var(--paper-shade); }
  .related h3 {
    font-family: var(--font-display);
    font-size: 1.3rem; color: var(--ink); margin: 0 0 1rem;
    font-style: italic;
  }
  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  .related-card {
    background: var(--paper);
    border: 1px solid var(--paper-shade);
    border-radius: 14px;
    overflow: hidden;
    transition: box-shadow .2s, transform .2s;
    color: inherit !important;
    border-bottom: none !important;
  }
  .related-card:hover { box-shadow: var(--shadow-soft); transform: translateY(-2px); }
  .related-card img { width: 100%; height: 130px; object-fit: cover; display: block; }
  .related-card-body { padding: .9rem 1rem; }
  .related-card-body h4 {
    font-family: var(--font-display);
    font-size: .95rem;
    line-height: 1.25;
    margin: 0 0 .25rem;
    color: var(--ink);
    font-weight: 500;
  }
  .related-card-body p { font-size: .82rem; color: var(--ink-soft); line-height: 1.4; margin: 0; }

  /* WhatsApp float */
  .wa-float {
    position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 60;
    width: 58px; height: 58px;
    border-radius: 50%; background: #25D366; color: #fff;
    display: grid; place-items: center;
    box-shadow: 0 10px 30px -8px rgba(37,211,102,.55), 0 4px 12px -2px rgba(0,0,0,.18);
    transition: transform .2s;
    border-bottom: none;
  }
  .wa-float:hover { color: #fff; transform: scale(1.08); }
  .wa-float::before {
    content: ""; position: absolute; inset: -6px;
    border-radius: 50%; border: 2px solid #25D366;
    opacity: .5; animation: wa-pulse 2.4s ease-out infinite;
  }
  @keyframes wa-pulse {
    0% { transform: scale(.95); opacity: .5; }
    100% { transform: scale(1.5); opacity: 0; }
  }
  @media (max-width: 640px) { .wa-float { width: 52px; height: 52px; bottom: 1rem; right: 1rem; } }

  /* Hide pieces we don't want from Caxias template */
  .progress-bar, .header, .exit-modal, .sticky-cta, .social-proof, .float-wa, footer.footer { display: none !important; }

  /* Footer */
  .site-footer {
    background: var(--ink); color: var(--paper);
    padding: clamp(2.5rem, 5vw, 4rem) clamp(1.25rem, 4vw, 2.5rem) 1.5rem;
    margin-top: 4rem;
  }
  .footer-inner { max-width: 1100px; margin: 0 auto; }
  .footer-inner p { margin: 0 0 .5rem; font-size: .92rem; color: rgba(251,247,240,.75); }
  .footer-inner a { color: var(--maple-soft); }
  .footer-baseline {
    border-top: 1px solid rgba(251,247,240,.1);
    margin-top: 2rem; padding-top: 1.5rem;
    font-size: .8rem; color: rgba(251,247,240,.5);
    text-align: center;
  }
</style>
</head>
<body>

<header class="site-nav">
  <a href="/" class="brand" aria-label="Maple Bear Bento Gonçalves">
    <img class="brand-mark" src="/assets/logo-maple-bear.png" alt="Maple Bear Canadian School" width="58" height="41">
    <span class="brand-divider" aria-hidden="true"></span>
    <span class="brand-text">
      <span class="brand-tagline">Bento Gonçalves</span>
    </span>
  </a>
  <nav class="nav-links">
    <a href="/#jornada">A Jornada</a>
    <a href="/diario/">Diário</a>
    <a href="/#abertura">Year 1 em 2027</a>
    <a href="https://wa.me/${WA_BG}?text=Ol%C3%A1!%20Vim%20do%20artigo%20%22${encodeURIComponent(meta.title)}%22%20e%20gostaria%20de%20agendar%20uma%20visita." class="nav-cta" target="_blank" rel="noopener">Agendar visita</a>
  </nav>
</header>

<nav class="breadcrumbs" aria-label="Breadcrumb">
  <a href="/">Início</a><span>›</span>
  <a href="/diario/">Diário</a><span>›</span>
  <span>${meta.title}</span>
</nav>

<article class="main">
  <p class="chapter-tag">${tag}</p>
  <h1 class="title">${meta.title}</h1>
  <div class="meta-row">
    ${dateBR ? `<time datetime="${meta.publishedISO}">${dateBR}</time>` : ''}
    <span class="pill">⏱ ${meta.readingMin} min de leitura</span>
    <span class="pill">${meta.wordCount.toLocaleString('pt-BR')} palavras</span>
  </div>
  <div class="cover-frame">
    ${hasCover ? `<img src="cover.jpg" alt="${meta.title.replace(/"/g, '&quot;')}" loading="lazy">` : `<span class="cover-placeholder">${tag}</span>`}
  </div>

  ${meta.bodyHTML}

  <div class="lead-form" id="leadForm">
    <h3>Quer receber conteúdo como esse?</h3>
    <p>Deixe seu nome e WhatsApp — abrimos uma conversa direta com você sobre a Maple Bear Bento Gonçalves.</p>
    <form id="leadFormEl" novalidate>
      <input type="text" name="nome" placeholder="Seu nome" required minlength="2">
      <input type="tel" name="telefone" placeholder="WhatsApp com DDD (ex: 54 9 9999-9999)" required>
      <button type="submit">Falar pelo WhatsApp →</button>
    </form>
    <p class="trust">🔒 Não armazenamos nada. Abre direto no WhatsApp da escola.</p>
  </div>

  <div class="cta-box">
    <h3>Conheça a Maple Bear <em>Bento Gonçalves</em>.</h3>
    <p>Em Bento desde 2025 (Toddler ao Kindergarten); em 2027 abrimos o Year 1. Venha conhecer a escola e o projeto pedagógico pessoalmente.</p>
    <a href="https://wa.me/${WA_BG}?text=Ol%C3%A1!%20Li%20o%20artigo%20%22${encodeURIComponent(meta.title)}%22%20e%20gostaria%20de%20agendar%20uma%20visita." target="_blank" rel="noopener">📅 Agendar minha visita pelo WhatsApp</a>
    <p class="urgency">Vagas limitadas · pré-matrícula 2027 (Year 1) aberta</p>
  </div>

  <div class="share-bar">
    <a class="share-wa" href="https://wa.me/?text=${encodeURIComponent(meta.title + ' ' + url)}" target="_blank" rel="noopener">Compartilhar no WhatsApp</a>
    <a class="share-li" href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}" target="_blank" rel="noopener">LinkedIn</a>
  </div>

  <div class="related">
    <h3>Leia também</h3>
    <div class="related-grid">
      ${ARTICLES.filter(a => a.slug !== slug).slice(0, 3).map(a => {
        const hasCoverOther = fs.existsSync(path.join(ASSETS_ROOT, a.slug, 'cover.jpg'));
        const imgHTML = hasCoverOther
          ? `<img src="/assets/diario/${a.slug}/cover.jpg" alt="" loading="lazy">`
          : `<div style="aspect-ratio:16/10;background:linear-gradient(135deg,var(--blush),var(--maple-soft));display:flex;align-items:center;justify-content:center;font-family:var(--font-script);font-size:1.3rem;color:#fff;">${a.tag}</div>`;
        return `
      <a href="/diario/${a.slug}/" class="related-card">
        ${imgHTML}
        <div class="related-card-body">
          <h4>${a.tag}</h4>
        </div>
      </a>`;
      }).join('')}
    </div>
  </div>
</article>

<a class="wa-float" href="https://wa.me/${WA_BG}?text=Ol%C3%A1!%20Tenho%20interesse%20na%20Maple%20Bear%20Bento%20Gon%C3%A7alves." target="_blank" rel="noopener" aria-label="Abrir WhatsApp">
  <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.7 2 6.7L4 29l7.5-2c1.9 1 4.1 1.6 6.5 1.6 6.6 0 12-5.4 12-12S22.6 3 16 3zm5.6 15.5c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.7.1-.1.3-.4.5-.6.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.4c-.2 0-.5.1-.7.4-.2.3-.9.9-.9 2.1 0 1.2.9 2.4 1 2.6.1.2 1.8 2.7 4.3 3.8.6.3 1.1.4 1.5.5.6.2 1.2.2 1.6.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3z"/></svg>
</a>

<footer class="site-footer">
  <div class="footer-inner">
    <p><strong>Maple Bear Bento Gonçalves</strong> — Escola Bilíngue Canadense · Em Bento desde 2025 · Year 1 em 2027</p>
    <p>WhatsApp <a href="https://wa.me/${WA_BG}" target="_blank" rel="noopener">+55 54 9 9931-5480</a> · <a href="mailto:contato@maplebearbg.com.br">contato@maplebearbg.com.br</a></p>
    <p class="footer-baseline">© ${new Date().getFullYear()} Maple Bear Bento Gonçalves · Bento Gonçalves, RS, Brasil</p>
  </div>
</footer>

<script>
  // Lead form → abre WhatsApp BG com mensagem pré-preenchida (sem backend)
  (function () {
    var form = document.getElementById('leadFormEl');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = (form.nome.value || '').trim();
      var tel  = (form.telefone.value || '').trim();
      if (nome.length < 2) { form.nome.focus(); return; }
      var msg = 'Olá! Sou ' + nome + ' (' + tel + '). ' +
                'Li o artigo "${meta.title.replace(/"/g, '\\"').replace(/'/g, "\\'")}" no Diário e gostaria de saber mais sobre a Maple Bear Bento Gonçalves.';
      window.open('https://wa.me/${WA_BG}?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  })();
</script>

</body>
</html>
`;
}

// ── main ────────────────────────────────────────────────────────────────────
async function main() {
  fs.mkdirSync(OUT_ROOT, { recursive: true });
  fs.mkdirSync(ASSETS_ROOT, { recursive: true });

  for (const art of ARTICLES) {
    const srcPath = path.join(CAXIAS_BLOG_ROOT, art.slug, 'index.html');
    if (!fs.existsSync(srcPath)) { console.log('✗ não achei:', srcPath); continue; }

    const raw = fs.readFileSync(srcPath, 'utf8');
    let meta;
    try { meta = extract(raw, art.slug); }
    catch (e) { console.log('✗ extract falhou:', art.slug, e.message); continue; }

    // Rewrite Caxias → BG no corpo
    meta.bodyHTML = rewriteCaxiasToBG(meta.bodyHTML, art.slug);
    meta.title = rewriteCaxiasToBG(meta.title, art.slug);
    meta.description = rewriteCaxiasToBG(meta.description, art.slug);

    // Download cover
    const coverDir = path.join(ASSETS_ROOT, art.slug);
    fs.mkdirSync(coverDir, { recursive: true });
    const coverDest = path.join(coverDir, 'cover.jpg');
    if (meta.coverUrl && !fs.existsSync(coverDest)) {
      try {
        await download(meta.coverUrl, coverDest);
        console.log('✓ cover baixada:', art.slug);
      } catch (e) {
        console.log('✗ cover falhou:', art.slug, e.message);
      }
    }

    // Copy cover to article directory too (relative ./cover.jpg)
    const outDir = path.join(OUT_ROOT, art.slug);
    fs.mkdirSync(outDir, { recursive: true });
    if (fs.existsSync(coverDest)) {
      fs.copyFileSync(coverDest, path.join(outDir, 'cover.jpg'));
    }

    const hasCover = fs.existsSync(path.join(outDir, 'cover.jpg'));

    // Render HTML
    const html = template({ slug: art.slug, meta, tag: art.tag, hasCover });
    fs.writeFileSync(path.join(outDir, 'index.html'), html, 'utf8');
    console.log('✓ artigo gerado:', art.slug, hasCover ? '' : '(sem cover — placeholder)');
  }

  console.log('\n✅ porte concluído. Arquivos em /diario/<slug>/index.html + /assets/diario/<slug>/cover.jpg');
}

main().catch(e => { console.error(e); process.exit(1); });

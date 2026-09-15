#!/usr/bin/env python3
"""Gera um artigo do diário a partir de um JSON de conteúdo, usando um artigo existente como template.

Uso:  python3 editorial/gerar-artigo.py editorial/rascunhos/<slug>.json

O JSON tem: slug, titulo, title_tag (<=60), descricao (<=155), h1, data (AAAA-MM-DD), minutos, capitulo (etiqueta curta),
capa (caminho em assets/photos/), capa_alt, intro (HTML), corpo (HTML com <h2 id=...>), faq ([[pergunta, resposta], ...]),
conclusao_h2, conclusao (HTML), cta_p, cta_wa_texto.
Nunca inclua valores de mensalidade. Só fatos de editorial/fatos.md.
"""
import re, json, os, sys, shutil
from urllib.parse import quote

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEMPLATE = "diario/escola-infantil-segura-bento-goncalves/index.html"
BASE = "https://maplebearbg.com.br"
WA = "5554999315480"
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


def data_extenso(iso):
    a, m, d = iso.split("-")
    return f"{int(d)} de {MESES[int(m) - 1]} de {a}"


def gerar(c):
    for k in ("slug", "titulo", "title_tag", "descricao", "h1", "data", "intro", "corpo", "faq"):
        if not c.get(k):
            raise SystemExit(f"falta o campo {k}")
    if len(c["title_tag"]) > 60:
        raise SystemExit("title_tag passa de 60 caracteres")
    if len(c["descricao"]) > 160:
        raise SystemExit("descricao passa de 160 caracteres")
    if re.search(r"R\$\s?\d", c["intro"] + c["corpo"] + " ".join(a for _, a in c["faq"])):
        raise SystemExit("o artigo menciona valores — não publicamos mensalidade")
    t = open(os.path.join(REPO, TEMPLATE), encoding="utf-8").read()
    old_url = re.search(r'<link rel="canonical" href="([^"]+)"', t).group(1)
    url = f"{BASE}/diario/{c['slug']}/"
    t = t.replace(old_url, url)
    t = re.sub(r"<title>.*?</title>", f"<title>{c['title_tag']}</title>", t, count=1, flags=re.S)
    t = re.sub(r'<meta name="description" content="[^"]*"', f'<meta name="description" content="{c["descricao"]}"', t, count=1)
    for prop in ("og:title", "twitter:title"):
        t = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*"', rf'\g<1>{c["titulo"]}"', t, count=1)
    for prop in ("og:description", "twitter:description"):
        t = re.sub(rf'(<meta (?:property|name)="{prop}" content=")[^"]*"', rf'\g<1>{c["descricao"]}"', t, count=1)
    t = re.sub(r'("headline":\s*")[^"]*"', rf'\g<1>{c["titulo"]}"', t, count=1)
    t = re.sub(r'("description":\s*")[^"]*"', rf'\g<1>{c["descricao"]}"', t, count=1)
    t = re.sub(r'("datePublished":\s*")[^"]*"', rf'\g<1>{c["data"]}T09:00:00.000-03:00"', t)
    t = re.sub(r'("dateModified":\s*")[^"]*"', rf'\g<1>{c["data"]}T09:00:00.000-03:00"', t)
    faqld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": re.sub(r"<[^>]+>", "", a)}} for q, a in c["faq"]]}
    t = re.sub(r'<script type="application/ld\+json">\s*\{[^<]*?"FAQPage".*?</script>',
               '<script type="application/ld+json">\n' + json.dumps(faqld, ensure_ascii=False, indent=2) + '\n</script>', t, count=1, flags=re.S)
    t = re.sub(r'(<nav class="breadcrumbs".*?<span>›</span>\s*<span>)[^<]*(</span>)', rf'\g<1>{c["h1"][:60]}\g<2>', t, count=1, flags=re.S)
    bc = re.search(r'"@type":\s*"BreadcrumbList".*?</script>', t, re.S)
    if bc:
        bloco = bc.group(0)
        nomes = list(re.finditer(r'"name":\s*"[^"]*"', bloco))
        last = nomes[-1]
        bloco = bloco[:last.start()] + f'"name": "{c["h1"][:60]}"' + bloco[last.end():]
        t = t[:bc.start()] + bloco + t[bc.end():]
    ini = t.find('\n<article class="main">') + 1
    fim = t.find('<div class="lead-form"', ini)
    if ini <= 0 or fim < 0:
        raise SystemExit("template sem <article class=main>/lead-form")
    palavras = len(re.sub(r"<[^>]+>", " ", c["intro"] + c["corpo"]).split())
    faq_html = "".join(f"  <h3>{q}</h3>\n  <p>{a}</p>\n" for q, a in c["faq"])
    capa_src = os.path.join(REPO, c.get("capa", "assets/photos/nursery-drawing.jpg"))
    try:
        from PIL import Image
        w, h = Image.open(capa_src).size
    except Exception:
        w, h = 1600, 1067
    art = f"""<article class="main">
  <p class="chapter-tag">{c.get('capitulo', 'Diário')}</p>
  <h1 class="title">{c['titulo']}</h1>
  <div class="meta-row">
    <time datetime="{c['data']}T09:00:00.000-03:00">{data_extenso(c['data'])}</time>
    <span class="pill">⏱ {c.get('minutos', 6)} min de leitura</span>
    <span class="pill">{palavras} palavras</span>
  </div>
  <div class="cover-frame">
    <img src="cover.jpg" alt="{c.get('capa_alt', 'Maple Bear Bento Gonçalves')}" loading="lazy" width="{w}" height="{h}">
  </div>

{c['intro']}

  <hr>

{c['corpo']}

  <h2 id="faq">Perguntas Frequentes</h2>
{faq_html}
  <h2>{c.get('conclusao_h2', 'Conclusão')}</h2>

{c.get('conclusao', '')}

  """
    t = t[:ini] + art + t[fim:]
    wa_txt = c.get("cta_wa_texto", f"Olá! Li o artigo {c['h1']} e gostaria de agendar uma visita.")
    t = re.sub(r'(<div class="cta-box">\s*<h3>[^<]*</h3>\s*<p>)[^<]*(</p>\s*<a href=")https://wa\.me/[^"]*(")',
               lambda m: m.group(1) + c.get("cta_p", "Alameda Fenavinho, 168 · Bear Care ao Senior Kindergarten · Year 1 em 2027. Agende uma visita num dia comum de aula.") + m.group(2)
               + f"https://wa.me/{WA}?text=" + quote(wa_txt) + m.group(3), t, count=1, flags=re.S)
    t = re.sub(r'<a class="share-wa" href="[^"]*"', '<a class="share-wa" href="https://wa.me/?text=' + quote(c["titulo"] + " " + url) + '"', t, count=1)
    t = re.sub(r'<a class="share-li" href="[^"]*"', '<a class="share-li" href="https://www.linkedin.com/sharing/share-offsite/?url=' + quote(url, safe="") + '"', t, count=1)
    t = re.sub(r'<div class="highlight-box" data-xref="1">.*?</div>\s*', "", t, count=1, flags=re.S)
    out = os.path.join(REPO, "diario", c["slug"])
    os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "index.html"), "w", encoding="utf-8", newline="\n").write(t)
    shutil.copy(capa_src, os.path.join(out, "cover.jpg"))
    sm_path = os.path.join(REPO, "sitemap.xml")
    sm = open(sm_path, encoding="utf-8").read()
    if url not in sm:
        entry = f"  <url>\n    <loc>{url}</loc>\n    <lastmod>{c['data']}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n"
        open(sm_path, "w", encoding="utf-8", newline="\n").write(sm.replace("</urlset>", entry + "</urlset>"))
    print("ok", url, palavras, "palavras")


if __name__ == "__main__":
    gerar(json.load(open(sys.argv[1], encoding="utf-8")))

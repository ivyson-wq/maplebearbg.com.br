// ════════════════════════════════════════════════════════════════════
// Maple Bear Bento Gonçalves — núcleo de captura de leads (window.mbLead)
// Todo formulário do site (artigos do Diário, guia, material, landings,
// /visite/, newsletter, pop-up de saída) passa por aqui e vai para
// POST https://maplebearcaxiasdosul.com.br/api/visit-lead com escola
// 'maplebearbg', origem detalhada, página, sessão do Lumied e UTM/gclid.
// Sucesso só depois da resposta ok da API; erro com mensagem humana e botão
// de WhatsApp. Sem alert() e sem abrir o WhatsApp à força.
// ════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  if (window.mbLead) return;

  var API_ENDPOINT = 'https://maplebearcaxiasdosul.com.br/api/visit-lead';
  var NUMERO = '5554999315480';
  var NUMERO_BONITO = '(54) 99931-5480';
  var TIMEOUT_MS = 15000;

  // ── UTM/gclid: persiste atribuição de campanha entre páginas ───────
  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'wbraid', 'gbraid'];
  try {
    var _p = new URLSearchParams(location.search);
    var _found = {};
    UTM_KEYS.forEach(function (k) { var v = _p.get(k); if (v) _found[k] = String(v).slice(0, 120); });
    if (Object.keys(_found).length) sessionStorage.setItem('mb_utm', JSON.stringify(_found));
  } catch (err) { /* sessionStorage indisponível */ }

  function getUtm() {
    var out = {};
    try { out = JSON.parse(sessionStorage.getItem('mb_utm') || '{}') || {}; } catch (err) { out = {}; }
    try {
      var p = new URLSearchParams(location.search);
      UTM_KEYS.forEach(function (k) { var v = p.get(k); if (v) out[k] = String(v).slice(0, 120); });
    } catch (err) { /* noop */ }
    return out;
  }

  function celular() {
    try {
      return window.innerWidth < 900 || (window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
    } catch (e) { return false; }
  }

  // ── Validação alinhada ao CRM ──────────────────────────────────────
  var DDDS = {};
  ('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 ' +
   '61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99')
    .split(' ').forEach(function (d) { DDDS[d] = 1; });

  function soDigitos(t) {
    var d = String(t || '').replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2);
    return d.replace(/^0+/, '');
  }

  function telefoneValido(t) {
    var d = soDigitos(t);
    if (d.length !== 10 && d.length !== 11) return false;
    if (!DDDS[d.slice(0, 2)]) return false;
    if (d.length === 11 && d.charAt(2) !== '9') return false;
    if (/^(\d)\1+$/.test(d.slice(2))) return false;
    return true;
  }

  function nomeValido(n) {
    var letras = String(n || '').match(/[A-Za-zÀ-ÖØ-öø-ÿ]/g);
    return !!letras && letras.length >= 3;
  }

  // Devolve { campo: 'nome'|'telefone', msg } ou null.
  function validar(nome, telefone) {
    if (!nomeValido(nome)) return { campo: 'nome', msg: 'Confira o seu nome: precisamos de pelo menos 3 letras.' };
    if (!telefoneValido(telefone)) return { campo: 'telefone', msg: 'Confira o WhatsApp: informe o DDD e o número, por exemplo (54) 99999-9999.' };
    return null;
  }

  // ── WhatsApp ───────────────────────────────────────────────────────
  function waUrl(texto) { return 'https://wa.me/' + NUMERO + '?text=' + encodeURIComponent(texto); }

  function tituloCurto() {
    var h1 = document.querySelector('h1');
    var t = (document.title || (h1 && h1.textContent) || '').replace(/\s+/g, ' ').trim();
    t = t.split(/\s[|—–]\s|:\s/)[0].trim();
    if (t.length > 60) t = t.slice(0, 57).replace(/\s+\S*$/, '') + '...';
    return t || 'site';
  }

  function waAdiantar(nome, origem) {
    var quem = String(nome || '').trim().split(/\s+/)[0];
    var texto = 'Olá! Sou ' + (quem || 'uma família') + '. Acabei de enviar meu pedido pelo site da Maple Bear Bento Gonçalves'
      + (origem ? ' (origem: ' + origem + ')' : '') + ' e quero adiantar o atendimento.';
    return window.mbCarimbar ? window.mbCarimbar(waUrl(texto)) : waUrl(texto);
  }

  function waPagina() {
    var texto = 'Olá! Vim da página ' + tituloCurto() + ' do site da Maple Bear Bento Gonçalves e quero saber mais.';
    return window.mbCarimbar ? window.mbCarimbar(waUrl(texto)) : waUrl(texto);
  }

  function botaoWa(href, rotulo) {
    var a = document.createElement('a');
    a.href = href; a.target = '_blank'; a.rel = 'noopener';
    a.className = 'mb-lead-wa';
    a.setAttribute('data-origem', 'lead-wa');
    a.textContent = rotulo;
    a.style.cssText = 'display:inline-block;margin-top:.75rem;padding:.7rem 1.3rem;border-radius:999px;background:#25D366;color:#fff;font-weight:700;font-size:.95rem;text-decoration:none;';
    return a;
  }

  // ── Corpo e envio ──────────────────────────────────────────────────
  function coletar(form, extra) {
    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    if (extra) Object.keys(extra).forEach(function (k) { data[k] = extra[k]; });
    var utm = getUtm();
    Object.keys(utm).forEach(function (k) { if (!data[k]) data[k] = utm[k]; });
    data.escola = 'maplebearbg';
    if (!data.pagina) data.pagina = location.pathname;
    try { data.sessao = sessionStorage.getItem('lumied_sessao') || undefined; } catch (e) { /* modo privado */ }
    return data;
  }

  // Resolve só com resposta ok; rejeita com Error de mensagem humana.
  async function enviar(data) {
    var r, json = null, timer, ctl;
    try {
      ctl = window.AbortController ? new AbortController() : null;
      if (ctl) timer = setTimeout(function () { ctl.abort(); }, TIMEOUT_MS);
      r = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: ctl ? ctl.signal : undefined
      });
      try { json = await r.json(); } catch (e) { json = null; }
    } catch (e) {
      throw new Error('Parece que a conexão falhou. Confira a internet e tente de novo.');
    } finally {
      if (timer) clearTimeout(timer);
    }
    if (r.ok && json && json.ok) return json;
    if (r.status === 400 && json && json.message) {
      var err = new Error(json.message);
      err.humano = true;
      throw err;
    }
    throw new Error('Não conseguimos enviar agora.');
  }

  // ── Feedback visual ────────────────────────────────────────────────
  function limpar(el) { while (el.firstChild) el.removeChild(el.firstChild); }

  function caixa(el, ok) {
    el.hidden = false;
    el.style.cssText = 'display:block;margin:1rem auto 0;max-width:460px;padding:.9rem 1.1rem;border-left:3px solid '
      + (ok ? '#166534' : '#b8112e') + ';background:' + (ok ? '#f0fdf4' : '#fff1f2')
      + ';color:#1a1814;border-radius:4px;line-height:1.5;font-size:.95rem;text-align:left;';
  }

  function areaAviso(form) {
    var el = form.querySelector('.exit-popup-fb, .newsletter-fb, .mb-lead-fb')
      || (form.parentNode && form.parentNode.querySelector('.exit-popup-fb, .newsletter-fb, .mb-lead-fb'));
    if (!el) {
      el = document.createElement('div');
      el.className = 'mb-lead-fb';
      el.setAttribute('role', 'status');
      el.setAttribute('aria-live', 'polite');
      form.parentNode.insertBefore(el, form.nextSibling);
    }
    return el;
  }

  // `extras(el)` permite acrescentar algo (ex.: link do guia) antes do botão.
  function sucesso(el, nome, origem, extras) {
    if (!el) return;
    limpar(el);
    caixa(el, true);
    var t = document.createElement('strong');
    t.style.cssText = 'display:block;margin-bottom:.35rem;';
    t.textContent = 'Recebemos seu pedido.';
    el.appendChild(t);
    el.appendChild(document.createTextNode('A equipe da Maple Bear Bento Gonçalves responde no horário comercial.'));
    if (extras) extras(el);
    el.appendChild(document.createElement('br'));
    el.appendChild(botaoWa(waAdiantar(nome, origem), 'Adiantar pelo WhatsApp'));
    var n = document.createElement('div');
    n.style.cssText = 'margin-top:.6rem;font-size:.88rem;opacity:.85;';
    n.textContent = 'Salve nosso número: ' + NUMERO_BONITO;
    el.appendChild(n);
  }

  function erro(el, msg) {
    if (!el) return;
    limpar(el);
    caixa(el, false);
    var t = document.createElement('strong');
    t.style.cssText = 'display:block;margin-bottom:.35rem;';
    t.textContent = msg || 'Não conseguimos enviar agora.';
    el.appendChild(t);
    el.appendChild(document.createTextNode('Você pode tentar de novo ou falar direto com a gente.'));
    el.appendChild(document.createElement('br'));
    el.appendChild(botaoWa(waPagina(), 'Chamar no WhatsApp'));
  }

  // Aviso curto de validação (sem botão de WhatsApp).
  function avisoCampo(el, msg) {
    limpar(el);
    caixa(el, false);
    el.appendChild(document.createTextNode(msg));
  }

  // ── Medição ────────────────────────────────────────────────────────
  // Formulário de contato/visita: conversão do Ads (mbFormLead, definido no
  // <head> da página) + generate_lead + Lead do Meta. Material/newsletter/
  // pop-up de saída: interesse, não pedido de visita; evento próprio e SEM a
  // conversão de formulário do Google Ads. Clique de WhatsApp é outro evento
  // (whatsapp_click) e nunca passa por aqui.
  function medir(form, origem, material) {
    try {
      if (material) {
        if (window.gtag) window.gtag('event', 'lead_material', { origem: origem });
        if (window.fbq) window.fbq('trackCustom', 'LeadMaterial', { content_name: origem });
        return;
      }
      if (window.mbFormLead) window.mbFormLead(form, origem); // Ads + generate_lead (GA4)
      else if (window.gtag) window.gtag('event', 'generate_lead', { method: 'form', origem: origem });
      if (window.fbq) window.fbq('track', 'Lead', { content_name: origem });
    } catch (e) { /* medição nunca quebra o fluxo */ }
  }

  // ── Handler único ──────────────────────────────────────────────────
  // opts: { origem, material, aoSucesso(form, box), extras(el) }
  async function tratar(form, opts) {
    var btn = form.querySelector('button[type="submit"]');
    var fb = areaAviso(form);
    var nomeCampo = form.elements['nome'] || form.elements['name'];
    var telCampo = form.elements['telefone'] || form.elements['phone'];
    var nome = nomeCampo ? String(nomeCampo.value || '').trim() : '';
    var telefone = telCampo ? String(telCampo.value || '').trim() : '';

    var hp = form.elements['company'];
    if (hp && hp.value) { if (btn) btn.disabled = true; return; } // honeypot

    var v = validar(nome, telefone);
    if (v) {
      avisoCampo(fb, v.msg);
      var alvo = v.campo === 'nome' ? nomeCampo : telCampo;
      if (alvo && alvo.focus) alvo.focus();
      return;
    }

    var data = coletar(form, { nome: nome, telefone: telefone, origem: opts.origem, canal: 'whatsapp' });
    var rotulo = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }
    try {
      await enviar(data);
      form.style.display = 'none';
      sucesso(fb, nome, opts.origem, opts.extras);
      medir(form, opts.origem, !!opts.material);
      if (opts.aoSucesso) opts.aoSucesso(form, fb);
    } catch (err) {
      if (btn) { btn.disabled = false; btn.textContent = rotulo; }
      erro(fb, err && err.message);
    }
  }

  window.mbLead = {
    NUMERO: NUMERO, NUMERO_BONITO: NUMERO_BONITO, API_ENDPOINT: API_ENDPOINT,
    celular: celular, validar: validar, telefoneValido: telefoneValido, nomeValido: nomeValido,
    waUrl: waUrl, waPagina: waPagina, waAdiantar: waAdiantar,
    coletar: coletar, enviar: enviar, sucesso: sucesso, erro: erro, medir: medir, tratar: tratar,
    getUtm: getUtm
  };

  // ── Formulários de conteúdo: artigos do Diário, guia e material ────
  // (Landings, /visite/, home e pop-up de saída são ligados pelo lead-capture.js.)
  function ligarConteudo() {
    var partes = location.pathname.split('/').filter(Boolean);
    var origem, material = false, aoSucesso = null, extras = null;

    if (partes[0] === 'diario' && partes[1]) {
      origem = 'blog-' + partes[1].replace(/[^a-z0-9-]/gi, '').toLowerCase();
    } else if (partes[0] === 'guia') {
      origem = 'lp-guia';
    } else if (partes[0] === 'materiais' && partes[1]) {
      origem = 'lp-material-' + partes[1].replace(/[^a-z0-9-]/gi, '').toLowerCase();
      material = true;
      aoSucesso = function () {
        var wrap = document.getElementById('checklistWrap');
        if (!wrap) return;
        wrap.classList.remove('locked');
        wrap.classList.add('unlocked');
        setTimeout(function () { wrap.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 200);
      };
    } else {
      return;
    }

    Array.prototype.forEach.call(document.querySelectorAll('form#leadFormEl, form#guideForm'), function (form) {
      form.setAttribute('novalidate', '');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        tratar(form, { origem: origem, material: material, aoSucesso: aoSucesso, extras: extras });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ligarConteudo);
  else ligarConteudo();
})();

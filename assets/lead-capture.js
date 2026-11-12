// ════════════════════════════════════════════════════════════════════
// Maple Bear Bento Gonçalves — Lead capture widgets
// Sticky banner + Newsletter form + Exit-intent popup
// Envio, validação e feedback ficam no assets/mb-lead.js (window.mbLead):
// POST cross-origin pra /api/visit-lead do Caxias (CORS configurado)
// ════════════════════════════════════════════════════════════════════

(function () {
  'use strict';
  var WA_URL = 'https://wa.me/5554999315480';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'text') node.textContent = attrs[k];
      else if (k === 'html') {
        // SAFE: only used for hard-coded static markup, never user data
        node.insertAdjacentHTML('beforeend', attrs[k]);
      } else node.setAttribute(k, attrs[k]);
    });
    if (children) children.forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  // Landing pages do Google Ads marcam <body data-sem-popups>: sem banner
  // injetado no topo (empurrava a página depois do carregamento = CLS) e sem
  // pop-up de saída (intersticial no celular pesa na experiência da página).
  var semPopups = document.body && document.body.hasAttribute('data-sem-popups');

  function bannerFechado() { try { return !!sessionStorage.getItem('mb_banner_closed'); } catch (e) { return false; } }

  // ── 1. Sticky banner topo (Matrículas 2027) ───────────────────────
  if (!semPopups && !bannerFechado()) {
    var banner = el('div', { class: 'sticky-banner' });
    var inner = el('div', { class: 'sticky-banner-inner' });
    inner.appendChild(el('span', { class: 'sticky-banner-dot', 'aria-hidden': 'true' }));
    var strong = el('strong', { text: 'Matrículas 2027 abertas:' });
    inner.appendChild(strong);
    inner.appendChild(el('span', { class: 'sticky-banner-text', text: ' Year 1 (Ensino Fundamental) — vagas limitadas' }));
    var cta = el('a', {
      href: WA_URL + '?text=' + encodeURIComponent('Olá! Quero saber sobre matrículas 2027 da Maple Bear Bento Gonçalves.'),
      'data-origem': 'banner-matriculas',
      target: '_blank', rel: 'noopener',
      class: 'sticky-banner-cta', text: 'Reservar vaga →'
    });
    inner.appendChild(cta);
    var closeBtn = el('button', { class: 'sticky-banner-close', 'aria-label': 'Fechar banner', text: '×' });
    closeBtn.addEventListener('click', function () {
      banner.remove();
      try { sessionStorage.setItem('mb_banner_closed', '1'); } catch (e) { /* bloqueado */ }
    });
    inner.appendChild(closeBtn);
    banner.appendChild(inner);
    document.body.prepend(banner);
  }

  // ── 2. Exit-intent popup ───────────────────────────────────────────
  function buildExitPopup() {
    var overlay = el('div', { class: 'exit-popup-overlay', role: 'dialog', 'aria-labelledby': 'exit-popup-title' });
    var box = el('div', { class: 'exit-popup' });

    var closeBtn = el('button', { class: 'exit-popup-close', 'aria-label': 'Fechar', text: '×' });
    closeBtn.addEventListener('click', function () { overlay.remove(); });
    box.appendChild(closeBtn);

    box.appendChild(el('img', {
      src: '/assets/brand/chinook-face-kiss.png',
      alt: '', width: '120', height: '118', class: 'exit-popup-mascot'
    }));
    box.appendChild(el('h3', { id: 'exit-popup-title', text: 'Antes de você ir...' }));

    box.appendChild(el('p', { text: 'Deixe seu nome e WhatsApp e a equipe da Maple Bear Bento Gonçalves entra em contato.' }));

    var form = el('form', { class: 'exit-popup-form', 'data-origem': 'exit-intent-bg' });
    form.appendChild(el('input', { type: 'text', name: 'nome', placeholder: 'Seu nome', required: '', autocomplete: 'name' }));
    form.appendChild(el('input', { type: 'tel', name: 'telefone', placeholder: 'WhatsApp com DDD', required: '', autocomplete: 'tel', inputmode: 'numeric' }));
    // Honeypot
    var honeypot = el('input', { type: 'text', name: 'company', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true' });
    honeypot.style.cssText = 'position:absolute;left:-9999px';
    form.appendChild(honeypot);
    form.appendChild(el('button', { type: 'submit', class: 'btn btn-primary', text: 'Quero falar com a equipe' }));
    form.appendChild(el('p', { class: 'exit-popup-fb', role: 'status', 'aria-live': 'polite' }));
    form.addEventListener('submit', handleSubmit);
    box.appendChild(form);

    overlay.appendChild(box);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) overlay.remove(); });
    document.body.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
  }

  // Só em computador: no celular não existe "saída do mouse" e o gatilho de
  // rolar para cima atrapalhava a leitura (intersticial no celular).
  function jaViuSaida() { try { return !!localStorage.getItem('mb_exit_seen'); } catch (e) { return false; } }
  var podeSaida = !semPopups && !jaViuSaida() && !(window.mbLead && window.mbLead.celular());
  if (podeSaida) {
    var triggered = false;
    var showExitPopup = function () {
      if (triggered) return;
      triggered = true;
      try { localStorage.setItem('mb_exit_seen', String(Date.now())); } catch (e) { /* bloqueado */ }
      buildExitPopup();
    };
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY < 10 && !(window.mbLead && window.mbLead.celular())) showExitPopup();
    });
  }

  // ── 3. Newsletter inline form (id=newsletter-form se presente) ────
  // Liga QUALQUER formulário declarado com data-origem: a newsletter da home
  // e o formulário de visita das LPs. Antes só o #newsletter-form era ligado,
  // então uma LP com formulário próprio ficaria sem handler — o submit
  // recarregaria a página e o lead se perderia.
  // (O pop-up de saída é criado depois e liga o seu próprio handler.)
  Array.prototype.forEach.call(
    document.querySelectorAll('form[data-origem]'),
    function (f) { f.addEventListener('submit', handleSubmit); }
  );

  // ── Handler compartilhado (mbLead.tratar) ──────────────────────────
  // data-origem é o que vai para a API. Landings trazem data-origem-lp
  // (lp-<pagina>), que passa a ser a origem detalhada. Home (newsletter) e
  // pop-up de saída são "interesse" e não contam como conversão de formulário.
  var MATERIAL = /^(newsletter|exit-intent)/;
  var GUIA = '/materiais/22-perguntas/';

  function handleSubmit(e) {
    e.preventDefault();
    var L = window.mbLead;
    var form = e.target;
    if (!L) return;
    var bruta = form.getAttribute('data-origem') || 'newsletter-bg';
    var lp = form.getAttribute('data-origem-lp');
    var origem = lp || bruta;
    if (!lp && bruta === 'site-visite-bg') {
      var pag = location.pathname.split('/').filter(Boolean)[0];
      if (pag) origem = 'lp-' + pag.replace(/[^a-z0-9-]/gi, '').toLowerCase();
    }
    var material = MATERIAL.test(bruta);
    L.tratar(form, {
      origem: origem,
      material: material,
      extras: material ? function (box) {
        box.appendChild(document.createTextNode(' Enquanto isso, veja o checklist '));
        var a = el('a', { href: GUIA, text: '22 perguntas para visitar uma escola bilíngue' });
        a.style.cssText = 'text-decoration:underline;color:inherit;';
        box.appendChild(a);
        box.appendChild(document.createTextNode('.'));
      } : null
    });
  }

})();

// Cookie consent + GA4 loader (LGPD compliant)
// — Mostra banner no primeiro acesso
// — Bloqueia GA4 até usuário aceitar
// — Persiste escolha em localStorage
// — Permite revogar via /privacidade/

(function () {
  var GA_ID = 'G-TKKMQEQ29C';
  var STORAGE_KEY = 'mbbg_consent_v1';

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    attachEvents();
  }

  // ─────────── Custom GA4 events (medição de funil) ───────────
  function track(name, params) {
    if (window.gtag) window.gtag('event', name, params || {});
  }

  function attachEvents() {
    if (window.__eventsAttached) return;
    window.__eventsAttached = true;

    var ready = function (fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
      else fn();
    };

    ready(function () {
      // WhatsApp click — qualquer link wa.me
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
        if (a) {
          track('whatsapp_click', {
            link_text: (a.textContent || '').trim().slice(0, 60),
            link_url: a.href,
            page_path: location.pathname,
            page_section: a.closest('[id]') ? a.closest('[id]').id : 'unknown'
          });
        }
      }, true);

      // CTA principal click — .btn-primary, .nav-cta, .btn-large
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('.btn-primary, .nav-cta, .btn-large, .btn');
        if (a) {
          track('cta_click', {
            cta_text: (a.textContent || '').trim().slice(0, 60),
            cta_class: a.className,
            page_path: location.pathname
          });
        }
      }, true);

      // Lead form submit (form.lead-form ou form#leadFormEl)
      var leadForm = document.querySelector('form#leadFormEl, form.lead-form-el');
      if (leadForm) {
        leadForm.addEventListener('submit', function () {
          track('lead_submit', { page_path: location.pathname });
        });
      }

      // Scroll depth — 25 / 50 / 75 / 100
      var milestones = [25, 50, 75, 100];
      var fired = {};
      var onScroll = function () {
        var h = document.documentElement;
        var pct = Math.round((h.scrollTop + h.clientHeight) / h.scrollHeight * 100);
        milestones.forEach(function (m) {
          if (pct >= m && !fired[m]) {
            fired[m] = true;
            track('scroll_depth', { percent: m, page_path: location.pathname });
          }
        });
      };
      var t;
      window.addEventListener('scroll', function () {
        clearTimeout(t); t = setTimeout(onScroll, 100);
      }, { passive: true });

      // Article read — em /diario/<slug>/ se ficar 30s+
      if (/\/diario\/[^\/]+\//.test(location.pathname)) {
        setTimeout(function () {
          if (!document.hidden) {
            track('article_read', {
              page_path: location.pathname,
              slug: location.pathname.split('/').filter(Boolean).pop()
            });
          }
        }, 30000);
      }

      // External link clicks (links saindo do site)
      document.addEventListener('click', function (e) {
        var a = e.target.closest && e.target.closest('a[href^="http"]');
        if (a && a.hostname !== location.hostname) {
          track('external_link_click', {
            link_url: a.href,
            link_domain: a.hostname,
            page_path: location.pathname
          });
        }
      }, true);

      // Inicial — page_view já roda automático no config; mas marca consent state
      track('consent_state', { state: 'granted' });
    });
  }

  function setConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
    var banner = document.getElementById('mbbg-consent');
    if (banner) banner.remove();
    if (value === 'granted') loadGA();
  }
  window.mbbgConsent = setConsent;

  // Para a página /privacidade/ permitir revogar:
  window.mbbgRevoke = function () {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    location.reload();
  };

  function showBanner() {
    if (document.getElementById('mbbg-consent')) return;
    var css = document.createElement('style');
    css.textContent = '#mbbg-consent{position:fixed;bottom:1.5rem;left:1.5rem;right:1.5rem;max-width:440px;margin-right:auto;background:#2A2522;color:#FBF7F0;padding:1.25rem 1.5rem;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.25);font-family:Spectral,Georgia,serif;font-size:.92rem;line-height:1.5;z-index:9999;animation:mbbgSlide .4s cubic-bezier(.2,.8,.2,1)}@keyframes mbbgSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}#mbbg-consent p{margin:0 0 .85rem;color:rgba(251,247,240,.85)}#mbbg-consent a{color:#E84A5F;text-decoration:underline}#mbbg-consent .row{display:flex;gap:.5rem;flex-wrap:wrap}#mbbg-consent button{border:0;border-radius:999px;padding:.6rem 1.1rem;font:inherit;font-weight:600;font-size:.85rem;cursor:pointer;transition:transform .2s}#mbbg-consent button:hover{transform:translateY(-1px)}#mbbg-consent .accept{background:#C8102E;color:#FBF7F0}#mbbg-consent .reject{background:transparent;color:rgba(251,247,240,.85);border:1px solid rgba(251,247,240,.3)}@media(max-width:480px){#mbbg-consent{left:.75rem;right:.75rem;bottom:.75rem;padding:1rem}}';
    document.head.appendChild(css);

    var banner = document.createElement('div');
    banner.id = 'mbbg-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML = '<p>Usamos cookies analíticos (Google Analytics) pra entender como o site é usado e melhorar a experiência. Você pode aceitar ou usar só os essenciais. Veja a <a href="/privacidade/">Política de Privacidade</a>.</p><div class="row"><button class="accept" onclick="window.mbbgConsent(\'granted\')">Aceitar todos</button><button class="reject" onclick="window.mbbgConsent(\'denied\')">Apenas essenciais</button></div>';
    document.body.appendChild(banner);
  }

  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'granted') {
      loadGA();
    } else if (saved === null) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBanner);
      } else {
        showBanner();
      }
    }
    // 'denied' = não faz nada
  } catch (e) {
    // localStorage indisponível (modo privado em alguns navegadores)
  }
})();

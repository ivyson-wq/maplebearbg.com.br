// ════════════════════════════════════════════════════════════════════
// Maple Bear Bento Gonçalves — Tracking unificado
// GA4 + Meta Pixel + dataLayer helpers
// ────────────────────────────────────────────────────────────────────
// TROCAR antes de produzir leads em escala:
//   GA_ID       → ID do GA4 Bento Gonçalves (criar property)
//   PIXEL_ID    → Meta Pixel ID (Business Manager → Pixels)
// ════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Configuração ──────────────────────────────────────────────────
  // GA4 property dedicada Maple Bear Bento Gonçalves
  // Stream ID: 14928841427 — https://www.maplebearbg.com.br
  var GA_ID = 'G-TKKMQEQ29C';
  var PIXEL_ID = ''; // PREENCHER quando criar Pixel BG no Meta Business

  // ── Google Analytics 4 ────────────────────────────────────────────
  if (GA_ID) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true,
      send_page_view: true,
      transport_type: 'beacon'
    });
  }

  // ── Meta Pixel ────────────────────────────────────────────────────
  if (PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }

  // ── Helper público pra trackear conversões ────────────────────────
  window.trackLead = function (params) {
    var data = params || {};
    if (window.gtag) {
      gtag('event', 'generate_lead', {
        method: data.canal || 'whatsapp',
        origem: data.origem || 'unknown'
      });
    }
    if (window.fbq) {
      fbq('track', 'Lead', { content_name: data.origem || 'site' });
    }
  };

  // ── Track de cliques em WhatsApp automaticamente ──────────────────
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="wa.me"]');
    if (!link) return;
    window.trackLead({ canal: 'whatsapp', origem: link.getAttribute('data-origem') || 'wa-click' });
  }, { passive: true });

})();

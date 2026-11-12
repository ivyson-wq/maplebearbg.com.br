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
  var PIXEL_ID = '1540259814325653'; // Meta Pixel Maple Bear Bento Gonçalves

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

  // ── Helper público de medição ─────────────────────────────────────
  // Eventos distintos, de propósito (nunca misturar):
  //   • clique no WhatsApp  -> `whatsapp_click` (GA4) + `Contact` (Meta).
  //     A conversão do Ads de WhatsApp sai do script inline da página.
  //   • formulário confirmado pela API -> `generate_lead` + `Lead`, disparados
  //     por mbLead.medir / mbFormLead (não por este helper).
  //   • material/newsletter -> `lead_material`, fora do generate_lead.
  window.trackLead = function (params) {
    var data = params || {};
    var origem = data.origem || 'unknown';
    if (data.canal === 'whatsapp') {
      if (window.gtag) gtag('event', 'whatsapp_click', { origem: origem });
      if (window.fbq) fbq('track', 'Contact', { content_name: origem });
      return;
    }
    if (data.material) {
      if (window.gtag) gtag('event', 'lead_material', { origem: origem });
      if (window.fbq) fbq('trackCustom', 'LeadMaterial', { content_name: origem });
      return;
    }
    if (window.gtag) gtag('event', 'generate_lead', { method: data.canal || 'form', origem: origem });
    if (window.fbq) fbq('track', 'Lead', { content_name: origem });
  };

  // ── Track de cliques em WhatsApp automaticamente ──────────────────
  // Só o número da escola (os botões "compartilhar" usam wa.me/?text=).
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="wa.me/5554999315480"]');
    if (!link) return;
    window.trackLead({ canal: 'whatsapp', origem: link.getAttribute('data-origem') || 'wa-click' });
  }, { passive: true });

})();

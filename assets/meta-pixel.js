// ════════════════════════════════════════════════════════════════════
// Maple Bear Bento Gonçalves — Meta Pixel (somente Meta, SEM GA4)
// Para páginas que já têm gtag inline próprio e precisam só do Pixel.
// Dispara PageView + Contact (no clique de WhatsApp). Lead é só de formulário (mbLead.medir).
// ════════════════════════════════════════════════════════════════════
(function () {
  'use strict';
  var PIXEL_ID = '1540259814325653'; // Meta Pixel Maple Bear Bento Gonçalves
  if (window.fbq) return; // guard anti-duplicação
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', PIXEL_ID);
  fbq('track', 'PageView');
  // Clique de WhatsApp é Contact, não Lead (Lead = formulário confirmado pela API)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/5554999315480"]') : null;
    if (a && window.fbq) fbq('track', 'Contact', { content_name: a.getAttribute('data-origem') || location.pathname });
  }, { passive: true });
})();

// ════════════════════════════════════════════════════════════════════
// Maple Bear Bento Gonçalves — interactions
// Pure vanilla JS. No frameworks. Mobile-friendly.
// ════════════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Service Worker registration (PWA) ──────────────────────────────
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // ── Reveal on scroll (IntersectionObserver) ────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => entry.target.classList.add('is-visible'), delay);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    // Fallback — show all
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  // ── Nav: add .scrolled when page moves ──────────────────────────────
  const nav = document.querySelector('.site-nav');
  if (nav) {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          nav.classList.toggle('scrolled', window.scrollY > 24);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Video thumbnails: load YouTube embed on click ───────────────────
  document.querySelectorAll('.video-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      const id = thumb.dataset.video;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.setAttribute('allowfullscreen', '');
      iframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;border-radius:inherit;';
      thumb.innerHTML = '';
      thumb.appendChild(iframe);
    });
  });

  // ── Footer year ─────────────────────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ── Smooth scroll for hash links (Safari fallback to native) ───────
  // Native scroll-behavior:smooth covers most browsers — nothing to do here.

})();

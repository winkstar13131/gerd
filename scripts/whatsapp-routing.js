/* Same visitor, same sales contact. No backend or external request required. */
(() => {
  'use strict';
  const numbers = ['5511960369206', '551151230230'];
  const storageKey = 'gerdau.whatsapp.v1';

  function readSavedNumber(storageName) {
    try {
      const value = window[storageName].getItem(storageKey);
      return numbers.includes(value) ? value : null;
    } catch {
      return null;
    }
  }

  function pickNumber() {
    try {
      const value = new Uint32Array(1);
      window.crypto.getRandomValues(value);
      return numbers[value[0] < 0x80000000 ? 0 : 1];
    } catch {
      return numbers[Math.random() < 0.5 ? 0 : 1];
    }
  }

  const number = readSavedNumber('localStorage') || readSavedNumber('sessionStorage') || pickNumber();
  // Storage can be disabled. In that case, direct links still work normally.
  for (const storageName of ['localStorage', 'sessionStorage']) {
    try { window[storageName].setItem(storageKey, number); } catch {}
  }
  window.gerdauWhatsApp = Object.freeze({ number });

  function updateLink(link) {
    const raw = link.getAttribute('href');
    if (!raw || !raw.startsWith('https://wa.me/')) return;
    try {
      const url = new URL(raw);
      if (!numbers.includes(url.pathname.slice(1))) return;
      url.pathname = '/' + number;
      link.href = url.href; // Preserve the product and the complete message.
    } catch {}
  }

  function updatePage() {
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(updateLink);
    const formatted = number === numbers[0] ? '+55 11 96036-9206' : '+55 11 5123-0230';
    document.querySelectorAll('[data-whatsapp-contact]').forEach(el => {
      el.textContent = 'WhatsApp: ' + formatted;
    });
  }

  // Native navigation is retained: no popup, form, async wait or preventDefault.
  document.addEventListener('click', event => {
    const link = event.target.closest?.('a[href]');
    if (link) updateLink(link);
  }, true);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updatePage, { once: true });
  } else {
    updatePage();
  }
})();

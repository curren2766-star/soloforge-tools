// Production only: local previews and ?analytics=off never load GA4.
const production = location.hostname === 'curren2766-star.github.io' && location.pathname.startsWith('/soloforge-tools/');
const enabled = production && new URLSearchParams(location.search).get('analytics') !== 'off' && !navigator.webdriver;
window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
if (enabled) {
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-BMGC440MQL';
  document.head.append(script);
  window.gtag('js', new Date());
  window.gtag('config', 'G-BMGC440MQL');
}
export function track(name, tool, extra = {}) {
  if (enabled) window.gtag('event', name, { tool, ...extra });
}
export function session(tool) {
  let started = false;
  let completed = false;
  return {
    start() { if (!started) { track('tool_start', tool); started = true; } },
    complete() {
      if (!started || completed) return;
      track('tool_complete', tool);
      completed = true;
    }
  };
}
export async function copyText(text) {
  try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; } } catch {}
  const active = document.activeElement;
  const area = document.createElement('textarea');
  area.value = text; area.style.cssText = 'position:fixed;left:-9999px';
  document.body.append(area); area.select();
  let copied = false;
  try { copied = document.execCommand('copy'); } catch {}
  area.remove(); active?.focus(); return copied;
}
document.addEventListener('click', event => {
  const link = event.target.closest('a[data-affiliate]');
  if (!link || event.defaultPrevented || link.hasAttribute('download')) return;
  const url = new URL(link.href, location.href);
  if (!['https:', 'http:'].includes(url.protocol) || url.origin === location.origin) return;
  track('outbound_affiliate_click', document.body.dataset.tool || 'site', { slot: link.dataset.affiliate });
});

// Unregister any existing Service Workers and clear their caches.
// Runs very early because it's injected directly into index.html.

(async () => {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        try { await reg.unregister(); } catch {}
      }
    }
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch {
    // no-op: best effort only
  }
})();

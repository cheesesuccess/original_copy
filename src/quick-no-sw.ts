(async () => {
  try {
    if ('serviceWorker' in navigator) {
      // Unregister any existing SWs
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const r of regs) { try { await r.unregister(); } catch {} }

      // Neutralize any future registrations
      try { (navigator.serviceWorker as any).register = async () => ({}) } catch {}
    }
    if (typeof caches !== 'undefined') {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
  } catch {}
})();

// Ads service worker disabled by user request.
// Unregister self so old installs stop opening external ad pages.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try { await self.registration.unregister(); } catch (e) {}
    try {
      const clients = await self.clients.matchAll();
      clients.forEach((c) => c.navigate(c.url));
    } catch (e) {}
  })());
});

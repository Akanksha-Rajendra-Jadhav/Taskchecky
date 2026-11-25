// Service worker: receives Web Push even when the tab is closed, and handles action buttons.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : {};
  e.waitUntil(self.registration.showNotification(d.title || 'TaskChecky', {
    body: d.body, tag: d.id, data: d, requireInteraction: true, icon: '/icon.svg',
    actions: d.kind === 'reminder' ? [{ action: 'completed', title: '✔ Completed' }, { action: 'snooze', title: `⏰ Snooze ${d.snooze || 5}m` }] : []
  }));
});
// Swiping away / closing does nothing: a dismissed notification never completes the task.
self.addEventListener('notificationclick', (e) => {
  const d = e.notification.data || {}; e.notification.close();
  if (d.api && (e.action === 'completed' || e.action === 'snooze')) {
    e.waitUntil(fetch(`${d.api}/notifications/public/${d.token}/${e.action}?minutes=${d.snooze || 5}`, { method: 'POST' }).catch(() => {}));
    return;
  }
  e.waitUntil(clients.matchAll({ type: 'window' }).then(l => (l.length ? l[0].focus() : clients.openWindow('/'))));
});

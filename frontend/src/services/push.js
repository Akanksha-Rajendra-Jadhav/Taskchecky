import api from './api';
const b64 = (s) => { const r = atob((s + '='.repeat((4 - s.length % 4) % 4)).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); };

// Returns 'push' | 'in-app-only' | 'no-vapid'. Push needs HTTPS (localhost is exempt) and a registered service worker.
export async function enableNotifications() {
  if (!('Notification' in window)) throw new Error('This browser does not support notifications');
  if ((await Notification.requestPermission()) !== 'granted') throw new Error('Permission denied. Allow notifications in your browser’s site settings.');
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'in-app-only';
  const reg = await navigator.serviceWorker.ready;
  const { data } = await api.get('/notifications/push/key');
  if (!data.key) return 'no-vapid';
  const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(data.key) });
  await api.post('/notifications/push/subscribe', { subscription: sub.toJSON() });
  return 'push';
}
// Same tag as the push notification, so the browser never shows two for one reminder.
export async function showLocal(n) {
  if (!('Notification' in window) || Notification.permission !== 'granted' || !navigator.serviceWorker) return;
  const reg = await navigator.serviceWorker.ready;
  reg.showNotification(n.title, { body: n.body, tag: n._id, icon: '/icon.svg' });
}

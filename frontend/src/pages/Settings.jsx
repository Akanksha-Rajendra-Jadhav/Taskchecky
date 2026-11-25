import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';
import { enableNotifications } from '../services/push';

export default function Settings() {
  const { user, setUser, theme, setTheme } = useAuth();
  const [p, setP] = useState({ name: user.name, email: user.email, ...user.settings });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' }); const [msg, setMsg] = useState(''); const [err, setErr] = useState('');
  const zones = Intl.supportedValuesOf ? Intl.supportedValuesOf('timeZone') : [p.timezone];
  const say = (m) => { setMsg(m); setErr(''); }; const bad = (e) => { setErr(errMsg(e)); setMsg(''); };
  const saveProfile = async (e) => { e.preventDefault(); try {
    const { data } = await api.put('/auth/profile', { name: p.name, email: p.email, settings: { theme, timezone: p.timezone, notificationsEnabled: p.notificationsEnabled, defaultSnooze: Number(p.defaultSnooze) } });
    setUser({ ...user, ...data.user }); say('Settings saved'); } catch (x) { bad(x); } };
  const savePw = async (e) => { e.preventDefault(); try { await api.put('/auth/password', pw); setPw({ currentPassword: '', newPassword: '' }); say('Password updated'); } catch (x) { bad(x); } };
  const enable = async () => { try { const r = await enableNotifications();
    say({ push: 'Push notifications enabled on this device.', 'in-app-only': 'Browser notifications on (this browser has no Web Push). Reminders show while the app is open.', 'no-vapid': 'Permission granted, but the server has no VAPID keys yet, so only in-app/browser alerts work while the app is open.' }[r]); } catch (x) { bad(x); } };
  return (<>
    <div className="hero card"><h2>Settings</h2></div>
    {msg && <div className="alert ok">{msg}</div>}{err && <div className="alert">{err}</div>}
    <form className="card" onSubmit={saveProfile}><h3>Profile & preferences</h3>
      <label className="field"><span className="muted small">Name</span><input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></label>
      <label className="field"><span className="muted small">Email</span><input type="email" value={p.email} onChange={e => setP({ ...p, email: e.target.value })} /></label>
      <label className="field"><span className="muted small">Timezone</span><select value={p.timezone} onChange={e => setP({ ...p, timezone: e.target.value })}>{zones.map(z => <option key={z}>{z}</option>)}</select></label>
      <label className="field"><span className="muted small">Default snooze (min)</span><select value={p.defaultSnooze} onChange={e => setP({ ...p, defaultSnooze: e.target.value })}>{[5, 10, 15, 30].map(n => <option key={n}>{n}</option>)}</select></label>
      <label className="field"><span className="muted small">Theme</span><select value={theme} onChange={e => setTheme(e.target.value)}><option>light</option><option>dark</option></select></label>
      <label className="check"><input type="checkbox" checked={!!p.notificationsEnabled} onChange={e => setP({ ...p, notificationsEnabled: e.target.checked })} /> Enable notifications</label>
      <button className="btn">Save</button>
    </form>
    <div className="card"><h3>Device notifications</h3>
      <p className="muted small">Browser permission: <b>{'Notification' in window ? Notification.permission : 'unsupported'}</b>. Web Push needs HTTPS (localhost works for development). On iPhone/iPad, install the app to your Home Screen first (iOS 16.4+).</p>
      <button className="btn" onClick={enable}>Enable on this device</button></div>
    <form className="card" onSubmit={savePw}><h3>Change password</h3>
      <input type="password" placeholder="Current password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} required />
      <input type="password" placeholder="New password" minLength={6} value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} required />
      <button className="btn">Update password</button></form>
  </>);
}

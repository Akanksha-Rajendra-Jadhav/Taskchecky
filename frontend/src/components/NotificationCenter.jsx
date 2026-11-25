import { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { showLocal } from '../services/push';

// Polls for fired reminders (state lives in MongoDB, so missed ones appear as soon as the app opens).
export default function NotificationCenter() {
  const [queue, setQueue] = useState([]); const seen = useRef(new Set());
  const poll = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications', { params: { status: 'unread', inapp: 1 } });
      data.filter(n => !seen.current.has(n._id)).forEach(n => { seen.current.add(n._id); showLocal(n); });
      setQueue(data);
    } catch { /* ignore transient errors */ }
  }, []);
  useEffect(() => { poll(); const t = setInterval(poll, 15000); return () => clearInterval(t); }, [poll]);
  const act = async (n, action, minutes) => {
    await api.post(`/notifications/${n._id}/action`, { action, minutes });
    setQueue(q => q.filter(x => x._id !== n._id)); window.dispatchEvent(new Event('tc:refresh'));
  };
  const n = queue[0]; if (!n) return null;
  return (
    <div className="overlay"><div className="card modal notif">
      <div className="bell">🔔</div><h2>{n.title}</h2><p className="muted">{n.body}</p>
      {queue.length > 1 && <p className="small muted">+{queue.length - 1} more waiting</p>}
      {n.kind === 'reminder' ? (<>
        <div className="row"><button className="btn" onClick={() => act(n, 'completed')}>✔ Completed</button><button className="btn ghost" onClick={() => act(n, 'pending')}>Pending</button></div>
        <div className="row"><button className="btn ghost" onClick={() => act(n, 'snooze', 5)}>Snooze 5 min</button><button className="btn ghost" onClick={() => act(n, 'snooze', 10)}>Snooze 10 min</button></div>
        <button className="link-btn" onClick={() => act(n, 'dismiss')}>Dismiss (keeps it pending)</button>
      </>) : <button className="btn full" onClick={() => act(n, 'dismiss')}>OK</button>}
    </div></div>
  );
}

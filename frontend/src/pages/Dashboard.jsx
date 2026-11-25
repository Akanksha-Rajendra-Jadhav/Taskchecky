import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';
import QuickAddModal from '../components/QuickAddModal';

const greet = (h) => (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');

export default function Dashboard() {
  const { user } = useAuth();
  const [now, setNow] = useState(new Date());
  const [data, setData] = useState(null);
  const [err, setErr] = useState('');
  const [adding, setAdding] = useState(false);

  const load = useCallback(() => api.get('/dashboard').then(r => setData(r.data)).catch(e => setErr(errMsg(e))), []);
  useEffect(() => {
    load(); const t = setInterval(() => setNow(new Date()), 1000); const r = setInterval(load, 30000);
    window.addEventListener('tc:refresh', load); window.addEventListener('tc:dash', load);
    return () => { clearInterval(t); clearInterval(r); window.removeEventListener('tc:refresh', load); window.removeEventListener('tc:dash', load); };
  }, [load]);

  const s = data?.stats; const max = Math.max(1, ...(data?.weekly || []).map(w => w.completed));
  const cards = s && [['Total', s.total], ['Completed', s.completed], ['Pending', s.pending], ['Overdue', s.overdue, 'danger']];

  return (
    <>
      <div className="hero card">
        <div>
          <h1>{greet(now.getHours())}, {user.name.split(' ')[0]}!</h1>
          <p className="muted">{now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} · {now.toLocaleTimeString()}</p>
        </div>
        <button className="btn" onClick={() => setAdding(true)}>+ Quick Add Task</button>
      </div>
      {err && <div className="alert">{err}</div>}
      {data && (
        <>
          <div className="grid4">{cards.map(([l, v, c]) => <div key={l} className={'card stat ' + (c || '')}><span className="muted">{l} tasks</span><b>{v}</b></div>)}</div>
          <div className="grid2">
            <div className="card">
              <h3>Daily productivity</h3>
              <div className="progress"><div style={{ width: data.dailyProductivity + '%' }} /></div>
              <p><b>{data.dailyProductivity}%</b> of today's tasks done</p>
              <h3>Weekly productivity</h3>
              <div className="bars">{data.weekly.map(w => (
                <div key={w.key} className="bar-col"><span className="bar-val">{w.completed}</span>
                  <div className="bar" style={{ height: (w.completed / max) * 100 + '%' }} /><span className="muted small">{w.label}</span></div>))}</div>
            </div>
            <div className="card">
              
              {data.upcoming.length === 0 && <p className="muted">Nothing upcoming. Add a task with a due date!</p>}
              <h3>Upcoming reminders</h3>
              {data.reminders.length === 0 && <p className="muted">No reminders set.</p>}
              <ul className="list">{data.reminders.map(r => (<li key={r._id}><b>🔔 {r.title}</b><span className="muted small">{new Date(r.nextRun).toLocaleString()} · {r.repeat}</span></li>))}</ul>
              <h3>Upcoming tasks</h3>
              <ul className="list">{data.upcoming.map(t => (
                <li key={t._id}><b>{t.title}</b><span className="muted small">{new Date(t.dueDate).toLocaleString()} · {t.priority}</span></li>))}</ul>
            </div>
          </div>
        </>
      )}
      {adding && <QuickAddModal onClose={() => setAdding(false)} onAdded={load} />}
    </>
  );
}

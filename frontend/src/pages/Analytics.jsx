import { useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';
import Bars from '../components/Bars';

export default function Analytics() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/analytics').then(r => setD(r.data)).catch(e => setErr(errMsg(e))); }, []);
  if (err) return <div className="alert">{err}</div>; if (!d) return <div className="muted">Loading…</div>;
  return (<>
    <div className="hero card"><h2>Productivity Analytics</h2></div>
    <div className="grid4">
      <div className="card stat"><span className="muted">Completion rate</span><b>{d.completionRate}%</b><div className="progress"><div style={{ width: d.completionRate + '%' }} /></div></div>
      <div className="card stat"><span className="muted">Completed / total</span><b>{d.completed}/{d.total}</b></div>
      <div className="card stat"><span className="muted">Most productive day</span><b>{d.bestDay || '—'}</b></div>
    </div>
    <div className="grid2">
      <div className="card"><h3>Daily completed (14 days)</h3><Bars data={d.daily} /></div>
      <div className="card"><h3>Weekly completed</h3><Bars data={d.weekly} /></div>
      <div className="card"><h3>Monthly productivity</h3><Bars data={d.monthly} /></div>
      <div className="card"><h3>Completions by weekday</h3><Bars data={d.weekday} /></div>
    </div>
    <div className="card"><h3>Habit streaks</h3>{d.habits.length === 0 && <p className="muted">No habits yet.</p>}
      {d.habits.map(h => <div key={h.name} className="row between"><span>{h.icon} {h.name}</span>
        <span><span className="dots">{h.week.map(w => <span key={w.date} className={'dot' + (w.done ? ' on' : '')} />)}</span> 🔥 {h.streak}</span></div>)}</div>
  </>);
}

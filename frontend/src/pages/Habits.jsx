import { useState } from 'react';
import { MdDelete } from 'react-icons/md';
import api from '../services/api';
import useList from '../hooks/useList';
import FormModal from '../components/FormModal';

const PRESETS = [['💧', 'Drink Water', 8, 'glasses'], ['🏃', 'Exercise', 1, 'session'], ['🧘', 'Meditation', 1, 'session'], ['📚', 'Reading', 1, 'session']];
const FIELDS = [{ k: 'icon', label: 'Icon (emoji)', def: '✅' }, { k: 'name', label: 'Habit', required: true },
  { k: 'target', label: 'Daily target', type: 'number', def: 1 }, { k: 'unit', label: 'Unit', def: 'time' }];

export default function Habits() {
  const { items, reload, err } = useList('/habits'); const [edit, setEdit] = useState(false);
  const log = (h, n) => api.post(`/habits/${h._id}/log`, { date: h.today.date, count: Math.max(0, h.today.count + n) }).then(reload);
  const add = (d) => api.post('/habits', d).then(reload);
  const del = (h) => confirm('Delete habit?') && api.delete('/habits/' + h._id).then(reload);
  return (<>
    <div className="hero card"><h2>Habit Tracker</h2><button className="btn" onClick={() => setEdit(true)}>+ New Habit</button></div>
    <div className="card"><span className="muted small">Quick add:</span><div className="tabs">{PRESETS.map(([icon, name, target, unit]) =>
      <button key={name} className="chip" onClick={() => add({ icon, name, target, unit })}>{icon} {name}</button>)}</div></div>
    {err && <div className="alert">{err}</div>}
    <div className="grid2">{items.map(h => { const pct = Math.min(100, Math.round(h.today.count / h.target * 100)); return (
      <div key={h._id} className="card">
        <div className="row between"><h3>{h.icon} {h.name}</h3><button className="icon-btn" onClick={() => del(h)}><MdDelete /></button></div>
        <div className="progress"><div style={{ width: pct + '%' }} /></div>
        <p>{h.today.count} / {h.target} {h.unit} today {h.today.done && '✅'} <span className="tag">🔥 {h.streak}-day streak</span></p>
        <div className="row"><button className="btn ghost" onClick={() => log(h, -1)}>−</button><button className="btn" onClick={() => log(h, 1)}>+ Log</button></div>
        <div className="dots">{h.week.map(w => <span key={w.date} title={w.date + ': ' + w.count} className={'dot' + (w.done ? ' on' : '')} />)}<span className="small muted">last 7 days</span></div>
      </div>); })}</div>
    {edit && <FormModal title="New Habit" fields={FIELDS} onSave={add} onClose={() => setEdit(false)} />}
  </>);
}

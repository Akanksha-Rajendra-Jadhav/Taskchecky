import { useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import api from '../services/api';
import useList from '../hooks/useList';
import FormModal from '../components/FormModal';

const CATS = ['Water', 'Medicine', 'Meeting', 'Study', 'Exercise', 'Meditation', 'Sleep', 'Personal', 'Custom'];
const PRESETS = [['💧', 'Time to Drink Water!', 'Water', 'daily'], ['💊', 'Take your medicine', 'Medicine', 'daily'], ['🏃', 'Exercise time', 'Exercise', 'daily'],
  ['🧘', 'Meditation session', 'Meditation', 'daily'], ['📚', 'Study session', 'Study', 'daily'], ['😴', 'Time to sleep', 'Sleep', 'daily']];
const FIELDS = [
  { k: 'title', label: 'Reminder title', required: true }, { k: 'description', label: 'Description', type: 'textarea' },
  { k: 'category', label: 'Category', type: 'select', options: CATS, def: 'Custom' },
  { k: 'nextRun', label: 'Date & time', type: 'datetime-local' },
  { k: 'repeat', label: 'Repeat', type: 'select', options: ['once', 'daily', 'weekly', 'monthly', 'custom'], def: 'once' },
  { k: 'customDays', label: 'Repeat on days', type: 'days', show: f => f.repeat === 'custom' },
  { k: 'notify', label: 'Notify via', type: 'select', options: [['both', 'Browser/push + in-app'], ['inapp', 'In-app pop-up only'], ['push', 'Browser/push only']], def: 'both' }
];

export default function Reminders() {
  const { items, reload, err } = useList('/reminders'); const [edit, setEdit] = useState(null);
  const save = (r) => (d) => (r?._id ? api.put('/reminders/' + r._id, d) : api.post('/reminders', d)).then(reload);
  const del = (r) => confirm('Delete reminder?') && api.delete('/reminders/' + r._id).then(reload);
  const soon = () => { const d = new Date(Date.now() + 3600e3); d.setSeconds(0, 0); return d.toISOString(); };
  return (<>
    <div className="hero card"><h2>Reminders</h2><button className="btn" onClick={() => setEdit({})}>+ Custom Reminder</button></div>
    <div className="card"><span className="muted small">Quick start:</span><div className="tabs">
      {PRESETS.map(([i, t, c, r]) => <button key={t} className="chip" onClick={() => setEdit({ title: t, category: c, repeat: r, nextRun: soon() })}>{i} {c}</button>)}</div></div>
    {err && <div className="alert">{err}</div>}
    {items.length === 0 && <div className="card muted">No reminders yet.</div>}
    {items.map(r => (
      <div key={r._id} className="card item">
        <div className="grow"><b>{r.title}</b>{r.description && <div className="muted small">{r.description}</div>}
          <div className="small muted">{r.status === 'active' ? 'Next: ' : ''}{new Date(r.snoozeUntil || r.nextRun).toLocaleString()}{r.snoozeUntil ? ' (snoozed)' : ''} · {r.category}</div></div>
        <span className="tag">{r.repeat}</span>
        <span className={'tag s-' + (r.status === 'done' ? 'Completed' : r.status === 'fired' ? 'Overdue' : 'Pending')}>{r.status === 'fired' ? 'pending' : r.status}</span>
        <button className="icon-btn" onClick={() => setEdit(r)}><MdEdit /></button><button className="icon-btn" onClick={() => del(r)}><MdDelete /></button>
      </div>))}
    {edit && <FormModal title={edit._id ? 'Edit Reminder' : 'New Reminder'} fields={FIELDS} initial={edit} onSave={save(edit)} onClose={() => setEdit(null)} />}
  </>);
}

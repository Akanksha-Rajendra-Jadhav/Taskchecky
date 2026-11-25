import { useState } from 'react';
import { MdDelete, MdEdit, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';
import api from '../services/api';
import useList from '../hooks/useList';
import FormModal from '../components/FormModal';
import { TASK_FIELDS } from '../components/fields';

const day = (n) => { const x = new Date(); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() + n); return x.toISOString(); };
const range = (v) => ({ all: {}, today: { from: day(0), to: day(1) }, tomorrow: { from: day(1), to: day(2) }, upcoming: { from: day(2) } }[v]);

export default function Tasks() {
  const [view, setView] = useState('all'); const [q, setQ] = useState(''); const [priority, setP] = useState(''); const [status, setS] = useState('');
  const [edit, setEdit] = useState(null);
  const { items, reload, err } = useList('/tasks', { ...range(view), q, priority, status });
  const refresh = () => { reload(); window.dispatchEvent(new Event('tc:dash')); };
  const save = (t) => (d) => (t?._id ? api.put('/tasks/' + t._id, d) : api.post('/tasks', d)).then(refresh);
  const toggle = (t) => api.put('/tasks/' + t._id, { status: t.status === 'Completed' ? 'Pending' : 'Completed' }).then(refresh);
  const del = (t) => confirm('Delete this task?') && api.delete('/tasks/' + t._id).then(refresh);
  return (<>
    <div className="hero card"><h2>My Tasks</h2><button className="btn" onClick={() => setEdit({})}>+ Add Task</button></div>
    <div className="card toolbar">
      <div className="tabs">{['all', 'today', 'tomorrow', 'upcoming'].map(v => <button key={v} className={'chip' + (view === v ? ' on' : '')} onClick={() => setView(v)}>{v[0].toUpperCase() + v.slice(1)}</button>)}</div>
      <input placeholder="Search tasks…" value={q} onChange={e => setQ(e.target.value)} />
      <select value={priority} onChange={e => setP(e.target.value)}><option value="">All priorities</option><option>High</option><option>Medium</option><option>Low</option></select>
      <select value={status} onChange={e => setS(e.target.value)}><option value="">All statuses</option><option>Pending</option><option>In Progress</option><option>Completed</option><option>Overdue</option></select>
    </div>
    {err && <div className="alert">{err}</div>}
    {items.length === 0 && <div className="card muted">No tasks here yet.</div>}
    {items.map(t => (
      <div key={t._id} className={'card item' + (t.status === 'Completed' ? ' done' : '')}>
        <button className="icon-btn" onClick={() => toggle(t)}>{t.status === 'Completed' ? <MdCheckCircle color="var(--ok)" /> : <MdRadioButtonUnchecked />}</button>
        <div className="grow"><b>{t.title}</b>{t.description && <div className="muted small">{t.description}</div>}
          <div className="small muted">{t.dueDate ? new Date(t.dueDate).toLocaleString() : 'No date'} · {t.category}</div></div>
        <span className={'tag p-' + t.priority}>{t.priority}</span>
        <span className={'tag s-' + (t.isOverdue ? 'Overdue' : t.status.replace(' ', ''))}>{t.isOverdue ? 'Overdue' : t.status}</span>
        <button className="icon-btn" onClick={() => setEdit(t)}><MdEdit /></button><button className="icon-btn" onClick={() => del(t)}><MdDelete /></button>
      </div>))}
    {edit && <FormModal title={edit._id ? 'Edit Task' : 'New Task'} fields={TASK_FIELDS} initial={edit} onSave={save(edit)} onClose={() => setEdit(null)} />}
  </>);
}

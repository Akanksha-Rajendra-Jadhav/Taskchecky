import { useState } from 'react';
import api, { errMsg } from '../services/api';

export default function QuickAddModal({ onClose, onAdded }) {
  const [f, setF] = useState({ title: '', dueDate: '', priority: 'Medium', category: 'General' });
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setErr('');
    try { await api.post('/tasks', f); onAdded(); onClose(); } catch (x) { setErr(errMsg(x)); }
  };
  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h3>Quick Add Task</h3>
        {err && <div className="alert">{err}</div>}
        <input placeholder="Task title" value={f.title} onChange={set('title')} required autoFocus />
        <input type="datetime-local" value={f.dueDate} onChange={set('dueDate')} />
        <div className="row">
          <select value={f.priority} onChange={set('priority')}><option>High</option><option>Medium</option><option>Low</option></select>
          <input placeholder="Category" value={f.category} onChange={set('category')} />
        </div>
        <div className="row"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn">Add Task</button></div>
      </form>
    </div>
  );
}

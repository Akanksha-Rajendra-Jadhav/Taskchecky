import { useState } from 'react';
import api from '../services/api';
import useList from '../hooks/useList';
import FormModal from '../components/FormModal';
import { TASK_FIELDS } from '../components/fields';

const same = (a, b) => new Date(a).toDateString() === b.toDateString();
const sow = (d) => { const x = new Date(d); x.setDate(x.getDate() - x.getDay()); x.setHours(0, 0, 0, 0); return x; };

export default function Calendar() {
  const [view, setView] = useState('month'); const [cur, setCur] = useState(new Date()); const [sel, setSel] = useState(new Date()); const [adding, setAdding] = useState(false);
  const tasks = useList('/tasks'), rem = useList('/reminders'), tt = useList('/timetable');
  const itemsFor = (d) => [
    ...tasks.items.filter(t => t.dueDate && same(t.dueDate, d)).map(t => ({ k: 'task', t: t.title, done: t.status === 'Completed', at: new Date(t.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })),
    ...rem.items.filter(r => r.status === 'active' && same(r.nextRun, d)).map(r => ({ k: 'reminder', t: r.title, at: new Date(r.nextRun).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })),
    ...tt.items.filter(e => e.days.includes(d.getDay())).map(e => ({ k: 'plan', t: e.title, at: e.start }))];
  const cells = view === 'month' ? Array.from({ length: 42 }, (_, i) => { const f = new Date(cur.getFullYear(), cur.getMonth(), 1); f.setDate(1 - f.getDay() + i); return f; })
    : view === 'week' ? Array.from({ length: 7 }, (_, i) => { const s = sow(cur); s.setDate(s.getDate() + i); return s; }) : [new Date(cur)];
  const move = (n) => { const x = new Date(cur); if (view === 'month') { x.setDate(1); x.setMonth(x.getMonth() + n); } else x.setDate(x.getDate() + n * (view === 'week' ? 7 : 1)); setCur(x); };
  const pre = new Date(sel); pre.setHours(9, 0, 0, 0);
  const Chip = ({ i }) => <div className={'cchip c-' + i.k + (i.done ? ' done' : '')}>{i.at} {i.t}</div>;
  return (<>
    <div className="hero card"><h2>{cur.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
      <div className="tabs"><button className="btn ghost" onClick={() => move(-1)}>‹</button><button className="btn ghost" onClick={() => { setCur(new Date()); setSel(new Date()); }}>Today</button><button className="btn ghost" onClick={() => move(1)}>›</button>
        {['month', 'week', 'day'].map(v => <button key={v} className={'chip' + (view === v ? ' on' : '')} onClick={() => setView(v)}>{v}</button>)}</div></div>
    <div className="card legend small"><span className="cchip c-task">Task</span><span className="cchip c-reminder">Reminder</span><span className="cchip c-plan">Timetable</span></div>
    <div className={'cal ' + view}>{cells.map(d => { const it = itemsFor(d); const lim = view === 'month' ? 2 : 99; return (
      <div key={+d} className={'cell' + (same(d, new Date()) ? ' today' : '') + (same(d, sel) ? ' sel' : '') + (view === 'month' && d.getMonth() !== cur.getMonth() ? ' dim' : '')} onClick={() => setSel(d)}>
        <b>{view === 'month' ? d.getDate() : d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</b>
        {it.slice(0, lim).map((i, n) => <Chip key={n} i={i} />)}{it.length > lim && <span className="small muted">+{it.length - lim} more</span>}</div>); })}</div>
    <div className="card"><div className="row between"><h3>{sel.toDateString()}</h3><button className="btn" onClick={() => setAdding(true)}>+ Task on this day</button></div>
      {itemsFor(sel).length === 0 ? <p className="muted">Nothing scheduled.</p> : itemsFor(sel).map((i, n) => <Chip key={n} i={i} />)}</div>
    {adding && <FormModal title="New Task" fields={TASK_FIELDS} initial={{ dueDate: pre.toISOString() }} onSave={(d) => api.post('/tasks', d).then(tasks.reload)} onClose={() => setAdding(false)} />}
  </>);
}

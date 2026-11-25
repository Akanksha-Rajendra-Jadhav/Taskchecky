import { useState } from 'react';
import { MdDelete, MdEdit } from 'react-icons/md';
import api from '../services/api';
import useList from '../hooks/useList';
import FormModal from '../components/FormModal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const TYPES = ['Study', 'Work', 'Meditation', 'Exercise', 'Break', 'Other'];
const FIELDS = [
  { k: 'title', label: 'Activity', required: true }, { k: 'type', label: 'Type', type: 'select', options: TYPES, def: 'Study' },
  { k: 'days', label: 'Repeats on', type: 'days' },
  { k: 'start', label: 'Start', type: 'time', required: true }, { k: 'end', label: 'End', type: 'time', required: true },
  { k: 'remindBefore', label: 'Remind me N minutes before (blank = no reminder)', type: 'number' }
];

export default function Timetable() {
  const { items, reload, err } = useList('/timetable'); const [day, setDay] = useState(new Date().getDay()); const [edit, setEdit] = useState(null);
  const save = (e) => (d) => (e?._id ? api.put('/timetable/' + e._id, d) : api.post('/timetable', d)).then(reload);
  const del = (e) => confirm('Delete this activity?') && api.delete('/timetable/' + e._id).then(reload);
  const list = items.filter(e => e.days.includes(day)).sort((a, b) => a.start.localeCompare(b.start));
  return (<>
    <div className="hero card"><h2>Daily Timetable</h2><button className="btn" onClick={() => setEdit({ days: [day] })}>+ Add Activity</button></div>
    <div className="card"><div className="tabs">{DAYS.map((d, i) => <button key={d} className={'chip' + (day === i ? ' on' : '')} onClick={() => setDay(i)}>{d}</button>)}</div></div>
    {err && <div className="alert">{err}</div>}
    {list.length === 0 && <div className="card muted">Nothing scheduled for {DAYS[day]}.</div>}
    <div className="timeline">{list.map(e => (
      <div key={e._id} className={'card item block t-' + e.type}>
        <div className="time"><b>{e.start}</b><span className="muted small">{e.end}</span></div>
        <div className="grow"><b>{e.title}</b><div className="small muted">{e.type}{e.remindBefore != null ? ` · reminder ${e.remindBefore} min before` : ''}</div></div>
        <button className="icon-btn" onClick={() => setEdit(e)}><MdEdit /></button><button className="icon-btn" onClick={() => del(e)}><MdDelete /></button>
      </div>))}</div>
    {edit && <FormModal title={edit._id ? 'Edit Activity' : 'New Activity'} fields={FIELDS} initial={edit} onSave={save(edit)} onClose={() => setEdit(null)} />}
  </>);
}

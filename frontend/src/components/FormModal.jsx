import { useState } from 'react';
import { errMsg } from '../services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const toLocal = (iso) => { if (!iso) return ''; const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

// Generic form: fields = [{k,label,type,options,def,required,show}]
export default function FormModal({ title, fields, initial = {}, onSave, onClose }) {
  const [f, setF] = useState(() => Object.fromEntries(fields.map(x => [x.k,
    x.type === 'datetime-local' ? toLocal(initial[x.k]) : (initial[x.k] ?? x.def ?? (x.type === 'days' ? [] : ''))])));
  const [err, setErr] = useState('');
  const set = (k, v) => setF({ ...f, [k]: v });
  const submit = async (e) => {
    e.preventDefault(); setErr('');
    const out = { ...f };
    fields.forEach(x => {
      if (x.type === 'datetime-local') out[x.k] = f[x.k] ? new Date(f[x.k]).toISOString() : null;
      if (x.type === 'number') out[x.k] = f[x.k] === '' ? null : Number(f[x.k]);
    });
    try { await onSave(out); onClose(); } catch (x) { setErr(errMsg(x)); }
  };
  return (
    <div className="overlay" onClick={onClose}>
      <form className="card modal" onClick={e => e.stopPropagation()} onSubmit={submit}>
        <h3>{title}</h3>{err && <div className="alert">{err}</div>}
        {fields.filter(x => !x.show || x.show(f)).map(x => (
          <label key={x.k} className="field"><span className="muted small">{x.label}</span>
            {x.type === 'textarea' ? <textarea value={f[x.k]} onChange={e => set(x.k, e.target.value)} rows={2} />
              : x.type === 'select' ? <select value={f[x.k]} onChange={e => set(x.k, e.target.value)}>{x.options.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o}>{o}</option>)}</select>
              : x.type === 'days' ? <div className="days">{DAYS.map((d, i) => (
                <button type="button" key={d} className={'chip' + (f[x.k].includes(i) ? ' on' : '')}
                  onClick={() => set(x.k, f[x.k].includes(i) ? f[x.k].filter(v => v !== i) : [...f[x.k], i])}>{d}</button>))}</div>
              : <input type={x.type || 'text'} value={f[x.k]} required={x.required} min={x.type === 'number' ? 0 : undefined} onChange={e => set(x.k, e.target.value)} />}
          </label>))}
        <div className="row"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn">Save</button></div>
      </form>
    </div>
  );
}

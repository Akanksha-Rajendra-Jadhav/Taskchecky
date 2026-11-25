export default function Bars({ data }) {
  const max = Math.max(1, ...data.map(d => d.value));
  return <div className="bars">{data.map(d => (
    <div key={d.label} className="bar-col"><span className="bar-val">{d.value}</span>
      <div className="bar" style={{ height: (d.value / max) * 100 + '%' }} /><span className="muted small">{d.label}</span></div>))}</div>;
}

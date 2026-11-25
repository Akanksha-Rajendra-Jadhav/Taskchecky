const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
exports.DAYS = DAYS;
exports.ymd = (d, tz) => new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(new Date(d)); // YYYY-MM-DD
exports.wd = (d, tz) => DAYS.indexOf(new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz }).format(new Date(d)));
exports.parts = (d, tz) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit',
    day: '2-digit', hour: '2-digit', minute: '2-digit', weekday: 'short' }).formatToParts(d).map(x => [x.type, x.value]));
  return { ymd: `${p.year}-${p.month}-${p.day}`, mins: +p.hour * 60 + +p.minute, wd: DAYS.indexOf(p.weekday) };
};

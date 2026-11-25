import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { MdDashboard, MdChecklist, MdAlarm, MdSchedule, MdCalendarMonth, MdSelfImprovement, MdInsights, MdSettings, MdLogout, MdMenu } from 'react-icons/md';
import NotificationCenter from '../components/NotificationCenter';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/', 'Dashboard', MdDashboard], ['/tasks', 'My Tasks', MdChecklist], ['/reminders', 'Reminders', MdAlarm],
  ['/timetable', 'Timetable', MdSchedule], ['/calendar', 'Calendar', MdCalendarMonth],
  ['/habits', 'Habits', MdSelfImprovement], ['/analytics', 'Analytics', MdInsights], ['/settings', 'Settings', MdSettings]
];

export default function AppLayout() {
  const { logout, user, theme, setTheme } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <div className="shell">
      <aside className={'sidebar' + (open ? ' open' : '')}>
        <div className="brand">✔ TaskChecky</div>
        {links.map(([to, label, Icon]) => (
          <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)} className="navlink"><Icon /> {label}</NavLink>
        ))}
        <button className="navlink" onClick={() => { logout(); nav('/login'); }}><MdLogout /> Logout</button>
      </aside>
      <main className="main">
        <header className="topbar">
          <button className="icon-btn menu" onClick={() => setOpen(!open)}><MdMenu /></button>
          <span className="muted">{user?.name}</span>
          <button className="btn ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme === 'light' ? '🌙 Dark' : '☀️ Light'}</button>
        </header>
        <Outlet />
        <NotificationCenter />
      </main>
    </div>
  );
}

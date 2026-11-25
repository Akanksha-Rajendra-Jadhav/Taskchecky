import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Reminders from './pages/Reminders';
import Timetable from './pages/Timetable';
import Calendar from './pages/Calendar';
import Habits from './pages/Habits';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { Login, Register, ForgotPassword, ResetPassword } from './pages/AuthPages';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
                <Route path="tasks" element={<Tasks />} />
        <Route path="reminders" element={<Reminders />} />
        <Route path="timetable" element={<Timetable />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="habits" element={<Habits />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

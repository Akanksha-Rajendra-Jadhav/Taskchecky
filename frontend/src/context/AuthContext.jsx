import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const Ctx = createContext();
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('tc_theme') || 'light');

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('tc_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!localStorage.getItem('tc_token')) return setLoading(false);
    api.get('/auth/me').then(r => setUser(r.data.user))
      .catch(() => localStorage.removeItem('tc_token'))
      .finally(() => setLoading(false));
  }, []);

  const accept = ({ token, user }) => { localStorage.setItem('tc_token', token); setUser(user); if (user.settings?.theme) setTheme(user.settings.theme); };
  const login = async (email, password) => accept((await api.post('/auth/login', { email, password })).data);
  const register = async (name, email, password) => accept((await api.post('/auth/register', { name, email, password, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone })).data);
  const resetPassword = async (token, password) => accept((await api.post(`/auth/reset-password/${token}`, { password })).data);
  const logout = () => { localStorage.removeItem('tc_token'); setUser(null); };

  return <Ctx.Provider value={{ user, setUser, loading, login, register, logout, resetPassword, theme, setTheme }}>{children}</Ctx.Provider>;
}

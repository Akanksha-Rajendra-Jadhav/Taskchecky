import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { errMsg } from '../services/api';

function Shell({ title, children, err, info }) {
  return (
    <div className="center-screen auth-bg">
      <div className="card auth-card">
        <h2>✔ TaskChecky</h2><p className="muted">{title}</p>
        {err && <div className="alert">{err}</div>}{info && <div className="alert ok">{info}</div>}
        {children}
      </div>
    </div>
  );
}
const useForm = (init) => { const [f, setF] = useState(init); return [f, (k) => (e) => setF({ ...f, [k]: e.target.value })]; };

export function Login() {
  const { login } = useAuth(); const nav = useNavigate();
  const [f, bind] = useForm({ email: '', password: '' }); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await login(f.email, f.password); nav('/'); } catch (x) { setErr(errMsg(x)); } };
  return (
    <Shell title="Welcome back" err={err}>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={f.email} onChange={bind('email')} required />
        <input type="password" placeholder="Password" value={f.password} onChange={bind('password')} required />
        <button className="btn full">Login</button>
      </form>
      <p className="links"><Link to="/forgot-password">Forgot password?</Link> · <Link to="/register">Create account</Link></p>
    </Shell>
  );
}

export function Register() {
  const { register } = useAuth(); const nav = useNavigate();
  const [f, bind] = useForm({ name: '', email: '', password: '' }); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await register(f.name, f.email, f.password); nav('/'); } catch (x) { setErr(errMsg(x)); } };
  return (
    <Shell title="Create your account" err={err}>
      <form onSubmit={submit}>
        <input placeholder="Full name" value={f.name} onChange={bind('name')} required />
        <input type="email" placeholder="Email" value={f.email} onChange={bind('email')} required />
        <input type="password" placeholder="Password (min 6 chars)" value={f.password} onChange={bind('password')} required minLength={6} />
        <button className="btn full">Sign up</button>
      </form>
      <p className="links">Already registered? <Link to="/login">Login</Link></p>
    </Shell>
  );
}

export function ForgotPassword() {
  const [email, setEmail] = useState(''); const [err, setErr] = useState(''); const [res, setRes] = useState(null);
  const submit = async (e) => { e.preventDefault(); try { setRes((await api.post('/auth/forgot-password', { email })).data); } catch (x) { setErr(errMsg(x)); } };
  return (
    <Shell title="Reset your password" err={err} info={res?.message}>
      <form onSubmit={submit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <button className="btn full">Send reset link</button>
      </form>
      {res?.devResetLink && <p className="muted small">Dev mode link: <a href={res.devResetLink}>open reset page</a></p>}
      <p className="links"><Link to="/login">Back to login</Link></p>
    </Shell>
  );
}

export function ResetPassword() {
  const { token } = useParams(); const { resetPassword } = useAuth(); const nav = useNavigate();
  const [password, setPassword] = useState(''); const [err, setErr] = useState('');
  const submit = async (e) => { e.preventDefault(); try { await resetPassword(token, password); nav('/'); } catch (x) { setErr(errMsg(x)); } };
  return (
    <Shell title="Choose a new password" err={err}>
      <form onSubmit={submit}>
        <input type="password" placeholder="New password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
        <button className="btn full">Update password</button>
      </form>
    </Shell>
  );
}

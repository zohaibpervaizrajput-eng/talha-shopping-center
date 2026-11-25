import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import logo from '../assets/talha-logo.png.jpeg'

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="border rounded-3xl p-6 shadow-lg">
        <div className="text-center"><div className="mx-auto flex items-center justify-center"><img src={logo} className='h-14 w-14' /></div><h1 className="text-2xl font-bold mt-3">Welcome Back</h1><p className="text-gray-500 text-sm">Login to TALHA Shopin Center</p></div>
        {err && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mt-4">{err}</div>}
        <form className="mt-5 space-y-3" onSubmit={async e => { e.preventDefault(); setErr(''); setLoading(true); try { await login({ email, password }); nav('/account'); } catch (er) { setErr(er.response?.data?.message || 'Login failed - Email ya password galat'); } setLoading(false); }}>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded-xl px-4 py-3" />
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded-xl px-4 py-3" />
          <button disabled={loading} className="w-full bg-black-lux text-white py-3 rounded-full font-bold">{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <div className="flex justify-between text-sm mt-4"><Link to="/forgot-password" className="text-gold font-semibold">Forgot Password?</Link><Link to="/register" className="font-semibold">Create Account →</Link></div>
      </div>
    </div>
  );
}
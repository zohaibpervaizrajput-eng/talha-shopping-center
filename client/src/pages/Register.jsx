import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [err, setErr] = useState('');
  const { register } = useAuth();
  const nav = useNavigate();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="border rounded-3xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-center">Create Account</h1><p className="text-gray-500 text-sm text-center mt-1">Join TALHA family - Get 10% Off</p>
        {err && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mt-4">{err}</div>}
        <form className="mt-5 space-y-3" onSubmit={async e => { e.preventDefault(); try { await register(form); nav('/account'); } catch (er) { setErr(er.response?.data?.message || 'Register failed'); } }}>
          <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full Name" className="w-full border rounded-xl px-4 py-3" />
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Email" className="w-full border rounded-xl px-4 py-3" />
          <input value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="Mobile 03xx-xxxxxxx" className="w-full border rounded-xl px-4 py-3" />
          <input required type="password" minLength={6} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Password (min 6 chars)" className="w-full border rounded-xl px-4 py-3" />
          <button className="w-full bg-[#D4AF37] py-3 rounded-full font-bold">Create Account</button>
        </form>
        <p className="text-center text-sm mt-4">Already have account? <Link to="/login" className="font-bold">Login</Link></p>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const { login, isAdmin } = useAuth();
  const nav = useNavigate();
  return <div className="min-h-screen bg-[#111111] flex items-center justify-center px-4"><div className="bg-white rounded-3xl p-6 w-full max-w-md"><div className="text-center"><div className="w-14 h-14 bg-[#111111] text-[#D4AF37] mx-auto flex items-center justify-center font-bold text-2xl rounded-2xl">T</div><h1 className="text-2xl font-bold mt-3">Admin Login</h1><p className="text-sm text-gray-500">TALHA Shopin Center - Staff Only</p></div>{err && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mt-4">{err}</div>}<form className="mt-5 space-y-3" onSubmit={async e => { e.preventDefault(); try { const d = await login({ email, password }); const u = d.user || d; const ok = ['admin','super_admin','product_manager','order_manager','inventory_manager','support','delivery_manager'].includes(u.role); if (!ok) { setErr('Ye account Admin nahi hai. Customer login alag hai.'); return; } nav('/admin'); } catch (er) { setErr(er.response?.data?.message || 'Login failed'); } }}><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" className="w-full border rounded-xl px-4 py-3" /><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded-xl px-4 py-3" /><button className="w-full bg-[#D4AF37] py-3 rounded-full font-bold">Login to Admin</button></form><p className="text-center text-xs text-gray-400 mt-4">⚠️ Admin password kabhi frontend me hardcode nahi hai. Backend se verify hota hai.</p></div></div>;
}
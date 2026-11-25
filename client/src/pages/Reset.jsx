import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
export default function Reset() {
  const { token } = useParams(); const nav = useNavigate();
  const [pw, setPw] = useState(''); const [msg, setMsg] = useState('');
  return <div className="max-w-md mx-auto px-4 py-12"><div className="border rounded-3xl p-6"><h1 className="text-2xl font-bold">Reset Password</h1>{msg && <div className="bg-green-50 p-3 rounded-xl mt-3 text-sm">{msg}</div>}<form className="mt-4" onSubmit={async e => { e.preventDefault(); try { await authAPI.reset(token, { password: pw }); setMsg('Password reset! Login karen.'); setTimeout(() => nav('/login'), 1500); } catch (er) { setMsg(er.response?.data?.message || 'Link expired'); } }}><input required type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="New Password" className="w-full border rounded-xl px-4 py-3" /><button className="w-full bg-[#111111] text-white py-3 rounded-full mt-3">Reset Password</button></form></div></div>;
}
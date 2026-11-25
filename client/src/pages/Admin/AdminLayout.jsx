import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, FolderTree, ShoppingBag, Ticket, Star, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSettings } from '../../context/SettingsContext.jsx';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const loc = useLocation(); const nav = useNavigate();
  const menu = [
    { l: '/admin', t: 'Dashboard', i: LayoutDashboard },
    { l: '/admin/products', t: 'Products', i: Package },
    { l: '/admin/categories', t: 'Categories', i: FolderTree },
    { l: '/admin/orders', t: 'Orders', i: ShoppingBag },
    { l: '/admin/coupons', t: 'Coupons', i: Ticket },
    { l: '/admin/reviews', t: 'Reviews', i: Star },
    { l: '/admin/settings', t: 'Settings', i: Settings },
  ];
  return <div className="min-h-screen bg-[#F8F6F1] flex">
    <aside className={`bg-[#111111] text-white w-64 shrink-0 fixed lg:static h-screen z-50 transition ${open ? 'left-0' : '-left-64 lg:left-0'}`}>
      <div className="p-4 border-b border-gray-800"><div className="font-bold text-[#D4AF37] text-lg">TALHA ADMIN</div><div className="text-xs text-gray-400">{settings.storeName} • {user?.name} ({user?.role})</div></div>
      <nav className="p-3 space-y-1">{menu.map(m => <Link key={m.l} to={m.l} onClick={() => setOpen(false)} className={`flex gap-3 px-3 py-2.5 rounded-xl text-sm ${loc.pathname === m.l ? 'bg-[#D4AF37] text-black font-bold' : 'hover:bg-gray-800'}`}><m.i size={18} /> {m.t}</Link>)}</nav>
      <div className="p-3 mt-6"><Link to="/" className="block text-sm text-gray-300 px-3 py-2">← View Website</Link><button onClick={async () => { await logout(); nav('/admin/login'); }} className="flex gap-2 text-sm text-red-400 px-3 py-2"><LogOut size={16} /> Logout</button></div>
    </aside>
    <div className="flex-1 min-w-0"><div className="lg:hidden bg-white p-3 flex justify-between items-center shadow"><button onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button><span className="font-bold">TALHA Admin</span><span /></div><div className="p-4 md:p-6"><Outlet /></div></div>
  </div>;
}
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Account() {
  const { user, logout } = useAuth();
  const { wishlist, items } = useCart();
  if (!user) return null;
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">My Account</h1>
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <div className="border rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center gap-4"><div className="w-16 h-16 bg-[#111111] text-[#D4AF37] rounded-full flex items-center justify-center text-2xl font-bold">{user.name?.[0]?.toUpperCase()}</div><div><div className="font-bold text-xl">{user.name}</div><div className="text-sm text-gray-500">{user.email}</div><div className="text-sm text-gray-500">{user.phone || 'No phone'} • Role: {user.role || 'customer'}</div></div></div>
          <button onClick={logout} className="mt-5 border px-5 py-2 rounded-full">Logout</button>
        </div>
        <div className="border rounded-2xl p-5 bg-[#F8F6F1]"><div className="font-bold">Quick Stats</div><div className="mt-3 space-y-2 text-sm"><div className="flex justify-between"><span>Cart Items</span><b>{items.length}</b></div><div className="flex justify-between"><span>Wishlist</span><b>{wishlist.length}</b></div></div></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {[{ t: 'My Orders', l: '/my-orders', e: '📦' }, { t: 'Wishlist', l: '/wishlist', e: '❤️' }, { t: 'Cart', l: '/cart', e: '🛒' }, { t: 'Shop', l: '/products', e: '✨' }].map(o => <Link key={o.t} to={o.l} className="border rounded-2xl p-5 text-center hover:shadow-lg"><div className="text-3xl">{o.e}</div><div className="font-bold mt-2">{o.t}</div></Link>)}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderAPI } from '../services/api';



export default function MyAccount() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [orderLoading, setOrderLoading] = useState(true);

  useEffect(() => {
  if (!user) return;
  setOrderLoading(true);
  orderAPI.my()
    .then(res => {
      const data = res.data;
      setOrders(Array.isArray(data) ? data : data.orders || []);
    })
    .catch(() => setOrders([]))
    .finally(() => setOrderLoading(false));
}, [user]);

  useEffect(() => {
    if (!user) return;
    // Backend se is user ke orders - tumhare api.js ke hisab se
    // Agar tumhare paas /orders/my nahi hai to ye /orders se filter karega
    const fetchOrders = async () => {
      try {
        // Pehle /orders/my try karo
        let res = await fetch(`${import.meta.env.VITE_API_URL}/orders/my`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include'
        });
        let data = await res.json();
        if (!Array.isArray(data)) data = data.orders || [];
        setOrders(data);
      } catch { setOrders([]); }
      setOrderLoading(false);
    };
    fetchOrders();
  }, [user]);

  if (loading) return <div className="p-20 text-center">Loading...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FFFBF8] px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white border rounded-[30px] p-6 flex flex-col md:flex-row items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-black text-white flex items-center justify-center text-3xl font-bold">
            {user.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500 text-sm">{user.email} • {user.phone || 'Phone nahi hai'}</p>
            <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
              {user.role === 'admin' || user.role === 'super_admin' ? '👑 Admin Account' : '✅ Verified Customer'}
            </span>
          </div>
          <button onClick={async () => { await logout(); navigate('/'); }} className="bg-red-500 text-white px-6 py-2.5 rounded-full font-bold text-sm">Logout</button>
        </div>

        <div className="flex gap-2 mt-6">
          <button onClick={() => setTab('orders')} className={`px-6 py-2.5 rounded-full font-bold ${tab === 'orders' ? 'bg-black text-white' : 'bg-white border'}`}>🛍️ My Orders ({orders.length})</button>
          <button onClick={() => setTab('profile')} className={`px-6 py-2.5 rounded-full font-bold ${tab === 'profile' ? 'bg-black text-white' : 'bg-white border'}`}>👤 Profile</button>
        </div>

        {tab === 'orders' && (
          <div className="mt-6 space-y-4">
            {orderLoading && <p className="text-center text-gray-400 py-10">Orders loading...</p>}
            {!orderLoading && orders.length === 0 && (
              <div className="bg-white border rounded-[30px] p-12 text-center">
                <p className="text-4xl">🛍️</p>
                <p className="font-bold mt-3">Now Any Order At the time</p>
                <p className="text-sm text-gray-500">Your Orders will Shown here</p>
                <a href="/" className="inline-block mt-5 bg-black text-white px-6 py-3 rounded-full font-bold text-sm">Start Shopping</a>
              </div>
            )}
            {orders.map(o => (
              <div key={o._id} className="bg-white border rounded-[30px] p-5">
                <div className="flex justify-between flex-wrap gap-2">
                  <p className="font-bold">Order #{o.orderNumber || o._id?.slice(-6).toUpperCase()}</p>
    <p className="text-sm text-gray-500 mt-1">📍 {o.shippingAddress?.address}, {o.shippingAddress?.city} • 📞 {o.shippingAddress?.phone}</p>
    <p className="font-bold mt-2">Rs.{o.total} • {o.status}</p>
    {/* ★★★ CANCEL BUTTON - Sirf Pending wale pe dikhega ★★★ */}
{o.status === 'Pending' && (
  <button
    onClick={async () => {
      if (!confirm('Ye order cancel karna hai?')) return;
      try {
        await orderAPI.cancelMy(o._id);
        setOrders(prev => prev.map(x => x._id === o._id ? { ...x, status: 'Cancelled' } : x));
        alert('✅ Order Canceled!');
      } catch (e) {
        alert('❌ Not Canceled: ' + (e.response?.data?.message || e.message));
      }
    }}
    className="mt-3 text-xs font-bold text-red-500 border border-red-200 px-4 py-2 rounded-full hover:bg-red-50"
  >
    ❌ Cancel Order
  </button>
)}
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">{o.status || 'Pending'}</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">{o.createdAt ? new Date(o.createdAt).toLocaleString('en-PK') : ''}</p>
                <div className="mt-3 space-y-1">
                  {o.items?.map((it, i) => (
                    <div key={i} className="flex justify-between text-sm"><span>{it.name} x {it.qty}</span><span>Rs {(it.price * it.qty).toLocaleString()}</span></div>
                  ))}
                </div>
                <div className="flex justify-between font-bold mt-3 pt-3 border-t"><span>Total</span><span>Rs {o.total?.toLocaleString()}</span></div>
                <p className="text-sm text-gray-500 mt-1">{o.shippingAddress?.address}, {o.shippingAddress?.city} • 📞 {o.shippingAddress?.phone}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div className="mt-6 bg-white border rounded-[30px] p-6 space-y-3">
            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>
            <p><b>Phone:</b> {user.phone || 'Add nahi hua'}</p>
            <p><b>Role:</b> {user.role || 'customer'}</p>
          </div>
        )}
      
      </div>
    </div>
  );
}
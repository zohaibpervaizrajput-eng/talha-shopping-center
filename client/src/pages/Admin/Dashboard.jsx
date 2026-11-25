import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productAPI, orderAPI, categoryAPI, reviewAPI } from '../../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({ revenue: 0, orders: 0, products: 0, pending: 0, delivered: 0, cancelled: 0 });
  const [recent, setRecent] = useState([]);
  const [low, setLow] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, p] = await Promise.all([orderAPI.list(), productAPI.list()]);
        const orders = Array.isArray(o.data) ? o.data : o.data.orders || [];
        const products = Array.isArray(p.data) ? p.data : [];
        // LOCK: backend total field se revenue, delivered wale hi count nahi - sab orders ka total (cancelled chor ke)
        const revenue = orders.filter(x => x.status !== 'Cancelled').reduce((s, x) => s + (x.total || 0), 0);
        setStats({ revenue, orders: orders.length, products: products.length, pending: orders.filter(x => x.status === 'Pending').length, delivered: orders.filter(x => x.status === 'Delivered').length, cancelled: orders.filter(x => x.status === 'Cancelled').length });
        setRecent(orders.slice(0, 5));
        setLow(products.filter(x => (x.stock || 0) <= 5).slice(0, 5));
      } catch {}
      setLoading(false);
    })();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  const cards = [['💰 Total Revenue', `Rs. ${stats.revenue.toLocaleString()}`], ['📦 Total Orders', stats.orders], ['💎 Total Products', stats.products], ['⏳ Pending Orders', stats.pending], ['✅ Delivered', stats.delivered], ['❌ Cancelled', stats.cancelled]];
  return <div><h1 className="text-2xl font-bold">Dashboard Overview</h1><div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">{cards.map(([t, v]) => <div key={t} className="bg-white rounded-2xl p-5 shadow"><div className="text-sm text-gray-500">{t}</div><div className="text-2xl font-bold mt-1">{v}</div></div>)}</div>
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="bg-white rounded-2xl p-5"><div className="flex justify-between"><h2 className="font-bold">Recent Orders</h2><Link to="/admin/orders" className="text-sm text-[#D4AF37]">View All →</Link></div>{recent.length === 0 ? <p className="text-sm text-gray-400 mt-3">No orders yet</p> : recent.map(o => <div key={o._id} className="flex justify-between text-sm py-2 border-b"><span>{o.orderNumber || o._id.slice(-6)} • {o.shippingAddress?.fullName || o.customerName}</span><span className="font-bold">Rs. {(o.total || 0).toLocaleString()} • {o.status}</span></div>)}</div>
      <div className="bg-white rounded-2xl p-5"><h2 className="font-bold">⚠️ Low Stock (≤5)</h2>{low.length === 0 ? <p className="text-sm text-gray-400 mt-3">All products in stock ✅</p> : low.map(p => <div key={p._id} className="flex justify-between text-sm py-2 border-b"><span>{p.name}</span><span className="text-red-600 font-bold">Stock: {p.stock}</span></div>)}</div>
    </div>
    <div className="flex gap-3 mt-6 flex-wrap"><Link to="/admin/products" className="bg-[#111111] text-white px-5 py-2 rounded-full text-sm">+ Add Product</Link><Link to="/admin/categories" className="border px-5 py-2 rounded-full text-sm">Manage Categories</Link><Link to="/admin/settings" className="border px-5 py-2 rounded-full text-sm">Website Settings</Link></div></div>;
}
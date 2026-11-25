import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI } from '../services/api';

const COLORS = { Pending: 'bg-yellow-100 text-yellow-800', Confirmed: 'bg-blue-100 text-blue-800', Processing: 'bg-purple-100 text-purple-800', Packed: 'bg-indigo-100 text-indigo-800', Dispatched: 'bg-orange-100 text-orange-800', Shipped: 'bg-cyan-100 text-cyan-800', Delivered: 'bg-green-100 text-green-800', Cancelled: 'bg-red-100 text-red-800' };

export default function MyOrders() {
  const [orders, setOrders] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { orderAPI.my().then(r => setOrders(Array.isArray(r.data) ? r.data : r.data.orders || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="p-10 text-center">Loading orders...</div>;
  if (!orders.length) return <div className="text-center py-20"><div className="text-6xl">📦</div><h2 className="text-2xl font-bold mt-3">No orders yet</h2><Link to="/products" className="inline-block mt-4 bg-[#111111] text-white px-6 py-2 rounded-full">Shop Now</Link></div>;
  return <div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold">My Orders ({orders.length})</h1><div className="space-y-4 mt-5">{orders.map(o => (
    <Link key={o._id} to={`/order/${o._id}`} className="block border rounded-2xl p-4 hover:shadow-lg">
      <div className="flex justify-between"><span className="font-bold">{o.orderNumber || o._id.slice(-6)}</span><span className={`px-3 py-1 rounded-full text-xs font-bold ${COLORS[o.status] || 'bg-gray-100'}`}>{o.status}</span></div>
      <div className="text-sm text-gray-500 mt-1">{new Date(o.createdAt).toLocaleDateString('en-PK')} • {o.items?.length || 0} items • {o.paymentMethod}</div>
      <div className="flex gap-2 mt-2">{o.items?.slice(0, 3).map((it, i) => <img key={i} src={it.image} alt="" className="w-12 h-12 object-cover rounded-lg" />)}</div>
      <div className="font-bold mt-2">Rs. {(o.total || 0).toLocaleString()} {o.trackingNumber && <span className="text-sm font-normal text-gray-500">• Tracking: {o.trackingNumber}</span>}</div>
    </Link>))}</div></div>;
}
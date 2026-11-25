import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { orderAPI } from '../services/api';

const FLOW = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Dispatched', 'Shipped', 'Delivered'];
export default function OrderDetails() {
  const { id } = useParams(); const [o, setO] = useState(null);
  useEffect(() => { orderAPI.get(id).then(r => setO(r.data.order || r.data)).catch(() => orderAPI.my().then(r => setO((Array.isArray(r.data) ? r.data : []).find(x => x._id === id)))); }, [id]);
  if (!o) return <div className="p-10 text-center">Loading order...</div>;
  const idx = FLOW.indexOf(o.status);
  return <div className="max-w-4xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold">Order {o.orderNumber}</h1>
    <div className="flex gap-1 mt-5">{FLOW.map((s, i) => <div key={s} className={`flex-1 text-center text-[10px] pb-2 border-b-4 ${i <= idx ? 'border-[#D4AF37] font-bold' : 'border-gray-200 text-gray-400'}`}>{s}</div>)}</div>
    <div className="grid md:grid-cols-2 gap-4 mt-6">
      <div className="border rounded-2xl p-4"><h3 className="font-bold">Delivery Address</h3><p className="text-sm mt-2">{o.shippingAddress?.fullName || o.customerName}<br />{o.shippingAddress?.address || o.address}<br />{o.shippingAddress?.city || o.city}, {o.shippingAddress?.province || o.province}<br />{o.shippingAddress?.phone || o.phone}</p>{o.courier && <p className="text-sm mt-2"><b>Courier:</b> {o.courier} {o.trackingNumber && <>• <b>Tracking:</b> {o.trackingNumber}</>}</p>}</div>
      <div className="border rounded-2xl p-4"><h3 className="font-bold">Items</h3>{o.items?.map((it, i) => <div key={i} className="flex gap-2 mt-2 text-sm"><img src={it.image} className="w-12 h-12 object-cover rounded-lg" alt="" /><div className="flex-1">{it.name} x {it.qty}</div><span>Rs. {(it.price * it.qty).toLocaleString()}</span></div>)}<div className="border-t mt-3 pt-2 text-sm space-y-1"><div className="flex justify-between"><span>Subtotal</span><span>Rs. {(o.subtotal || 0).toLocaleString()}</span></div><div className="flex justify-between"><span>Shipping</span><span>Rs. {(o.shippingCharges || 0).toLocaleString()}</span></div><div className="flex justify-between font-bold"><span>Total</span><span>Rs. {(o.total || 0).toLocaleString()}</span></div><div className="text-gray-500">Payment: {o.paymentMethod} • {o.paymentStatus}</div></div></div>
    </div>
    {o.statusHistory?.length > 0 && <div className="border rounded-2xl p-4 mt-4"><h3 className="font-bold">Status History</h3>{o.statusHistory.map((h, i) => <div key={i} className="text-sm py-1 border-b last:border-0 flex justify-between"><span>{h.status} - {h.note}</span><span className="text-gray-400">{h.createdAt ? new Date(h.createdAt).toLocaleString() : ''}</span></div>)}</div>}
  </div>;
}
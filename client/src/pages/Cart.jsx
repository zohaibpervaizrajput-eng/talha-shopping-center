import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, Tag } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function Cart() {
  const { items, updateQty, remove, subtotal, discount, shipping, total, coupon, applyCoupon } = useCart();
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  if (items.length === 0) return <div className="text-center py-20"><div className="text-6xl">🛒</div><h2 className="text-2xl font-bold mt-3">Cart is empty</h2><Link to="/products" className="inline-block mt-4 bg-[#111111] text-white px-6 py-2 rounded-full">Shop Jewellery</Link></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="text-2xl font-bold">Shopping Cart ({items.length})</h1>
        <div className="mt-4 space-y-3">{items.map(i => (
          <div key={i.key} className="flex gap-4 border rounded-2xl p-3">
            <img src={i.image} alt={i.name} className="w-24 h-24 object-cover rounded-xl" />
            <div className="flex-1">
              <div className="font-semibold">{i.name}</div>
              {i.size && <div className="text-xs text-gray-500">Size: {i.size}</div>}
              <div className="font-bold mt-1">Rs. {i.price?.toLocaleString()}</div>
              <div className="flex items-center gap-2 mt-2"><button onClick={() => updateQty(i.key, i.qty - 1)} className="border p-1 rounded-full"><Minus size={14} /></button><span>{i.qty}</span><button onClick={() => updateQty(i.key, i.qty + 1)} className="border p-1 rounded-full"><Plus size={14} /></button></div>
            </div>
            <div className="text-right"><div className="font-bold">Rs. {(i.price * i.qty).toLocaleString()}</div><button onClick={() => remove(i.key)} className="text-red-500 mt-2 flex gap-1 items-center text-sm"><Trash2 size={16} /> Remove</button></div>
          </div>
        ))}</div>
      </div>
      <div className="border rounded-2xl p-5 h-fit bg-[#F8F6F1]">
        <h2 className="font-bold">Coupon</h2>
        <form className="flex gap-2 mt-2" onSubmit={async e => { e.preventDefault(); try { const d = await applyCoupon(code); setMsg(d.message || 'Coupon lag gaya! 🎉'); } catch (err) { setMsg(err.response?.data?.message || 'Galat coupon code'); } }}>
          <input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 border rounded-full px-3 py-2 uppercase" />
          <button className="bg-[#D4AF37] px-4 rounded-full font-bold">Apply</button>
        </form>
        {msg && <div className="text-sm mt-2">{msg}</div>}
        <div className="space-y-2 mt-5 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div><div className="flex justify-between"><span>Discount</span><span className="text-green-600">- Rs. {discount.toLocaleString()}</span></div><div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span></div><div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div></div>
        <button onClick={() => nav('/checkout')} className="w-full bg-[#111111] text-white py-3 rounded-full mt-4 font-bold">Proceed to Checkout</button>
        <Link to="/products" className="block text-center text-sm mt-3">Continue Shopping</Link>
      </div>
    </div>
  );
}
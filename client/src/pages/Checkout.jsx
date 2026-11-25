import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

const PROVINCES = ['Punjab','Sindh','Khyber Pakhtunkhwa','Balochistan','Islamabad Capital Territory','Gilgit-Baltistan','Azad Jammu and Kashmir'];

export default function Checkout() {
  const { items, subtotal, discount, shipping, total, coupon, clear } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerName: user?.name || '', phone: user?.phone || '', email: user?.email || '',
    province: 'Punjab', city: '', area: '', address: '', postalCode: '', instructions: '',
    paymentMethod: 'COD'
  });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  if (items.length === 0) return <div className="text-center py-20"><h2 className="text-2xl font-bold">Cart is empty</h2><button onClick={() => nav('/products')} className="bg-[#111111] text-white px-6 py-2 rounded-full mt-4">Shop Now</button></div>;

  const placeOrder = async () => {
    if (!form.customerName || !form.phone || !form.city || !form.address) return alert('Please fill name, phone, city, address');
    if (!/^(03\d{9}|92\d{10})$/.test(form.phone.replace(/[\s-]/g, '')) && form.phone.length < 10) return alert('Please enter correct mobile number - 03xx-xxxxxxx');
    setLoading(true);
    try {
      const payload = {
        customerName: form.customerName, phone: form.phone, email: form.email,
        address: form.address, city: form.city, province: form.province, area: form.area,
        postalCode: form.postalCode, instructions: form.instructions,
        items: items.map(i => ({ productId: i.productId, product: i.productId, name: i.name, image: i.image, price: i.price, qty: i.qty, quantity: i.qty, size: i.size })),
        total, subtotal, discount, shippingCharges: shipping,
        paymentMethod: form.paymentMethod, couponCode: coupon?.code || ''
      };
      const { data } = await orderAPI.create(payload);
      const orderId = data.order?._id || data._id;
      clear();
      alert(`Order Placed! Order No: ${data.order?.orderNumber || ''}\nPayment: ${form.paymentMethod}`);
      nav(orderId ? `/order/${orderId}` : '/my-orders');
    } catch (err) { alert(err.response?.data?.message || 'Order failed, try again'); }
    setLoading(false);
  };

  const payBox = "flex gap-3 items-start border rounded-xl p-4 cursor-pointer hover:border-[#D4AF37] has-[:checked]:border-[#D4AF37] has-[:checked]:bg-[#FFFDF5]";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">Checkout - Step {step} of 3</h1>
      <div className="flex gap-2 mt-3">{[1,2,3].map(s => <div key={s} className={`flex-1 h-2 rounded-full ${step >= s ? 'bg-gold' : 'bg-gray-200'}`} />)}</div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="md:col-span-2">
          {step === 1 && <div className="border rounded-2xl p-5">
            <h2 className="font-bold text-lg">1. Customer Information</h2>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <input placeholder="Full Name *" value={form.customerName} onChange={e => set('customerName', e.target.value)} className="border rounded-xl px-3 py-2" />
              <input placeholder="Mobile 03xx-xxxxxxx *" value={form.phone} onChange={e => set('phone', e.target.value)} className="border rounded-xl px-3 py-2" />
              <input placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} className="border rounded-xl px-3 py-2 md:col-span-2" />
            </div>
            <button onClick={() => { if (!form.customerName || !form.phone) return alert('Name + Phone are required'); setStep(2); }} className="bg-black-lux text-white px-6 py-2 rounded-full mt-4">Continue to Address →</button>
          </div>}

          {step === 2 && <div className="border rounded-2xl p-5">
            <h2 className="font-bold text-lg">2. Delivery Address</h2>
            <div className="grid md:grid-cols-2 gap-3 mt-4">
              <select value={form.province} onChange={e => set('province', e.target.value)} className="border rounded-xl px-3 py-2">{PROVINCES.map(p => <option key={p}>{p}</option>)}</select>
              <input placeholder="City *" value={form.city} onChange={e => set('city', e.target.value)} className="border rounded-xl px-3 py-2" />
              <input placeholder="Area / Town" value={form.area} onChange={e => set('area', e.target.value)} className="border rounded-xl px-3 py-2" />
              <input placeholder="Postal Code" value={form.postalCode} onChange={e => set('postalCode', e.target.value)} className="border rounded-xl px-3 py-2" />
              <textarea placeholder="Complete Address *" value={form.address} onChange={e => set('address', e.target.value)} className="border rounded-xl px-3 py-2 md:col-span-2" rows={2} />
              <input placeholder="Delivery Instructions (optional)" value={form.instructions} onChange={e => set('instructions', e.target.value)} className="border rounded-xl px-3 py-2 md:col-span-2" />
            </div>
            <div className="flex gap-2 mt-4"><button onClick={() => setStep(1)} className="border px-5 py-2 rounded-full">← Back</button><button onClick={() => { if (!form.city || !form.address) return alert('City + Address are required'); setStep(3); }} className="bg-black-lux text-white px-6 py-2 rounded-full">Continue to Payment →</button></div>
          </div>}

          {/* ★★★ STEP 3 - PAYMENT - Now will run from Admin Settings ★★★ */}
          {step === 3 && <div className="border rounded-2xl p-5">
            <h2 className="font-bold text-lg">3. Payment Method</h2>
            <div className="space-y-3 mt-4">

              {(settings?.cod ?? true) && (
                <label className={payBox}>
                  <input type="radio" name="payment" checked={form.paymentMethod === 'COD'} onChange={() => set('paymentMethod', 'COD')} className="mt-1" />
                  <div><p className="font-bold">💵 Cash on Delivery (COD)</p><p className="text-sm text-gray-500">Pay cash when order arrives</p></div>
                </label>
              )}

              {(settings?.jazzCash ?? true) && (
                <label className={payBox}>
                  <input type="radio" name="payment" checked={form.paymentMethod === 'JazzCash'} onChange={() => set('paymentMethod', 'JazzCash')} className="mt-1" />
                  <div><p className="font-bold">📱 JazzCash</p><p className="text-sm text-gray-500">Send to {settings?.jazzCashNumber || '03076128103'} • Send screenshot on WhatsApp</p></div>
                </label>
              )}

              {(settings?.easypaisa ?? true) && (
                <label className={payBox}>
                  <input type="radio" name="payment" checked={form.paymentMethod === 'Easypaisa'} onChange={() => set('paymentMethod', 'Easypaisa')} className="mt-1" />
                  <div><p className="font-bold">📱 Easypaisa</p><p className="text-sm text-gray-500">Send to {settings?.easypaisaNumber || '03076128103'} • Send screenshot on WhatsApp</p></div>
                </label>
              )}

              {(settings?.bankTransfer ?? false) && (
                <label className={payBox}>
                  <input type="radio" name="payment" checked={form.paymentMethod === 'Bank Transfer'} onChange={() => set('paymentMethod', 'Bank Transfer')} className="mt-1" />
                  <div><p className="font-bold">🏦 Bank Transfer</p><p className="text-sm text-gray-500">{settings?.bankAccount || 'Bank details will be shared on WhatsApp'}</p></div>
                </label>
              )}

            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={() => setStep(2)} className="border px-5 py-2 rounded-full">← Back</button>
              <button onClick={placeOrder} disabled={loading} className="bg-black-lux text-white px-6 py-2 rounded-full flex-1 disabled:opacity-60">
                {loading ? '⏳ Placing Order...' : `✅ Place Order - Rs. ${total.toLocaleString()}`}
              </button>
            </div>
          </div>}
        </div>

        <div className="border rounded-2xl p-5 h-fit bg-cream">
          <h2 className="font-bold">Order Summary</h2>
          <div className="space-y-2 mt-3">{items.map(i => <div key={i.key} className="flex gap-2 text-sm"><img src={i.image} className="w-12 h-12 object-cover rounded-lg" alt="" /><div className="flex-1"><div className="line-clamp-1">{i.name}</div><div className="text-gray-500">Qty: {i.qty} {i.size ? `• Size: ${i.size}` : ''}</div></div><span>Rs. {(i.price * i.qty).toLocaleString()}</span></div>)}</div>
          <div className="border-t mt-4 pt-3 space-y-1 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>Rs. {subtotal.toLocaleString()}</span></div><div className="flex justify-between"><span>Discount</span><span className="text-green-600">- Rs. {discount.toLocaleString()}</span></div><div className="flex justify-between"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `Rs. ${shipping}`}</span></div><div className="flex justify-between font-bold text-lg"><span>Total</span><span>Rs. {total.toLocaleString()}</span></div></div>
          <div className="text-xs text-gray-500 mt-3">Free delivery over Rs. {settings?.freeDeliveryAbove?.toLocaleString()} • 7 Days Return</div>
        </div>
      </div>
    </div>
  );
}
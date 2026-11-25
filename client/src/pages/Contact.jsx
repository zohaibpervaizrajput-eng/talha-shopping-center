import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, ChevronRight, Camera, CheckCircle2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';
import { contactAPI } from '../services/api';

export default function Contact() {
  const { settings } = useSettings();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [activeImg, setActiveImg] = useState(0);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ★★★ LOCK: Shop Images - From Admin Settings ★★★
  // Admin must have added shopImages in Settings (comma separated or array). If not added then default 3 photos.
  const rawImages = settings.shopImages || settings.shopImageUrls || '';
  const shopImages = Array.isArray(rawImages) ? rawImages.filter(Boolean)
    : typeof rawImages === 'string' && rawImages.trim() ? rawImages.split(',').map(s => s.trim()).filter(Boolean)
    : [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800',
    ];

  const address = settings.locationAddress || settings.address || 'Main Bazaar, Sialkot, Punjab, Pakistan';
  const city = settings.locationCity || 'Sialkot';
  const phone = settings.phone || '0300-1234567';
  const whatsapp = settings.whatsapp || settings.phone || '0300-1234567';
  const email = settings.email || 'info@talhashopincenter.com';
  const timing = settings.storeTiming || '9 AM - 10 PM (Mon - Sat)';
  const mapUrl = settings.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;
  const waLink = `https://wa.me/92${whatsapp.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Assalam-o-Alaikum! I want to ask about jewellery from TALHA Shopin Center.')}`;

  // ★★★ CONTACT FORM - Will go to Backend ★★★
  const submit = async (e) => {
    e.preventDefault();
    setErr(''); setSending(true);
    try {
      // LOCK: In Backend POST /api/contact should exist, if not then WhatsApp will open (in catch below)
      await contactAPI.create(form);
      setSent(true); setForm({ name: '', email: '', phone: '', subject: 'General Inquiry', message: '' });
    } catch {
      // If contact route is not in Backend then WhatsApp fallback - message will never be wasted
      const text = `Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nSubject: ${form.subject}\nMessage: ${form.message}`;
      window.open(`https://wa.me/92${whatsapp.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(text)}`, '_blank');
      setSent(true);
    }
    setSending(false);
  };

  const cards = [
    { icon: Phone, label: 'Phone / WhatsApp', value: phone, sub: 'Call or WhatsApp - instant reply', href: `tel:${phone}`, bg: 'bg-green-50 hover:bg-green-100', iconBg: 'bg-green-500' },
    { icon: Mail, label: 'Email', value: email, sub: 'Reply within 24 hours', href: `mailto:${email}`, bg: 'bg-blue-50 hover:bg-blue-100', iconBg: 'bg-blue-500' },
    { icon: Clock, label: 'Store Timing', value: timing, sub: 'Sunday: Closed / Online Open', href: null, bg: 'bg-amber-50 hover:bg-amber-100', iconBg: 'bg-amber-500' },
    { icon: MapPin, label: 'Our Location', value: `${city}, Pakistan`, sub: address, href: '#location', bg: 'bg-pink-50 hover:bg-pink-100', iconBg: 'bg-pink-500' },
  ];

  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="relative bg-[#111111] text-white py-14 md:py-16">
        <div className="absolute inset-0 opacity-15 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200')] bg-cover bg-center" />
        <div className="relative max-w-4xl mx-auto px-4 text-center animate-[fadeIn_0.7s_ease]">
          <div className="inline-block bg-[#D4AF37] text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-widest">✦ WE ARE HERE TO HELP ✦</div>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">Contact <span className="text-[#D4AF37]">Us 💬</span></h1>
          <p className="text-gray-300 mt-3 max-w-xl mx-auto">Any question about order, delivery, return or jewellery - we are right here. You will get instant reply.</p>
          <div className="flex gap-3 justify-center mt-6 flex-wrap">
            <a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all duration-300 shadow-lg"><MessageCircle size={18} /> Chat on WhatsApp</a>
            <a href={`tel:${phone}`} className="border border-white/40 px-6 py-3 rounded-full font-bold hover:bg-white hover:text-black transition-all duration-300">📞 {phone}</a>
          </div>
        </div>
      </section>

      {/* INFO CARDS - Hover */}
      <section className="max-w-7xl mx-auto px-4 -mt-7 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map(c => (
            <a key={c.label} href={c.href || undefined} className={`${c.bg} rounded-3xl p-5 border border-transparent hover:border-[#D4AF37] hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer block`}>
              <div className={`w-11 h-11 ${c.iconBg} text-white rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}><c.icon size={20} /></div>
              <div className="text-xs text-gray-500 mt-3">{c.label}</div>
              <div className="font-bold text-sm mt-0.5 break-words">{c.value}</div>
              <div className="text-xs text-gray-500 mt-1 line-clamp-2">{c.sub}</div>
            </a>
          ))}
        </div>
      </section>

      {/* ★★★ SHOP IMAGES GALLERY - From Admin ★★★ */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-end"><div><h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2"><Camera className="text-[#B8962E]" /> Our Shop <span className="text-[#D4AF37]">Gallery</span></h2><p className="text-sm text-gray-500 mt-1">Real photos of our shop - Change from Admin Panel</p></div><span className="hidden md:block text-xs bg-[#F8F6F1] px-3 py-1.5 rounded-full">{shopImages.length} Photos</span></div>

        <div className="grid md:grid-cols-5 gap-4 mt-5">
          {/* Main Image */}
          <div className="md:col-span-3 relative group overflow-hidden rounded-[2rem] shadow-xl">
            <img key={activeImg} src={shopImages[activeImg]} alt="TALHA Shop" className="w-full h-[320px] md:h-[420px] object-cover group-hover:scale-105 transition duration-700 animate-[fadeIn_0.5s_ease]" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5"><div className="text-white font-bold text-lg">TALHA Shopin Center</div><div className="text-white/80 text-sm flex items-center gap-1"><MapPin size={14} className="text-[#D4AF37]" /> {address}</div></div>
            <div className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-full text-xs font-bold shadow">📸 {activeImg + 1} / {shopImages.length}</div>
          </div>
          {/* Thumbnails */}
          <div className="md:col-span-2 grid grid-cols-2 gap-3">
            {shopImages.slice(0, 4).map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`relative overflow-hidden rounded-3xl group ${activeImg === i ? 'ring-4 ring-[#D4AF37] scale-[1.02]' : 'opacity-80 hover:opacity-100'}`}>
                <img src={img} alt={`Shop ${i + 1}`} className="w-full h-[150px] md:h-[200px] object-cover group-hover:scale-110 transition duration-500" />
                <span className="absolute bottom-2 left-2 bg-black/70 text-white text-[11px] px-2.5 py-1 rounded-full">{i === 0 ? '🏪 Main Shop' : i === 1 ? '💎 Collection' : i === 2 ? '✨ Display' : '🎁 Bridal'}</span>
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">📍 Shop photos change from Admin → Settings → Shop Images - nothing to do in code</p>
      </section>

      {/* FORM + MAP */}
      <section className="max-w-7xl mx-auto px-4 pb-14 grid md:grid-cols-5 gap-6 items-start">
        {/* FORM */}
        <div className="md:col-span-3 bg-white border rounded-[2rem] p-6 md:p-7 shadow-lg hover:shadow-xl transition">
          <h2 className="text-2xl font-bold">Send Us a Message ✉️</h2>
          <p className="text-sm text-gray-500 mt-1">Fill form - message will go to Admin / WhatsApp.</p>
          {sent && <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl mt-4 flex gap-2 text-sm"><CheckCircle2 className="shrink-0" /> <span><b>Message sent!</b> We will reply soon. Thank you!</span></div>}
          {err && <div className="bg-red-50 text-red-600 p-3 rounded-xl mt-4 text-sm">{err}</div>}
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-3 mt-5">
            <input required placeholder="Your Name *" value={form.name} onChange={e => set('name', e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] transition" />
            <input required type="email" placeholder="Email *" value={form.email} onChange={e => set('email', e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] transition" />
            <input placeholder="Mobile - 03xx-xxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] transition" />
            <select value={form.subject} onChange={e => set('subject', e.target.value)} className="border rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] bg-white"><option>General Inquiry</option><option>Order Status</option><option>Return / Exchange</option><option>Bulk / Wholesale Order</option><option>Bridal Collection</option><option>Complaint</option></select>
            <textarea required placeholder="Write your message... *" value={form.message} onChange={e => set('message', e.target.value)} rows={5} className="border rounded-xl px-4 py-3 outline-none focus:border-[#D4AF37] transition md:col-span-2 resize-none" />
            <button disabled={sending} className="md:col-span-2 bg-[#111111] hover:bg-[#D4AF37] hover:text-black text-white py-3.5 rounded-full font-bold flex items-center justify-center gap-2 transition-all duration-300 active:scale-95 disabled:opacity-60">{sending ? 'Sending...' : <>Send Message <Send size={16} /></>}</button>
            <a href={waLink} target="_blank" rel="noreferrer" className="md:col-span-2 text-center text-sm text-green-600 font-semibold hover:underline">Or send directly on WhatsApp →</a>
          </form>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t">
            <Link to="/faq" className="text-xs bg-[#F8F6F1] hover:bg-[#FFF8DC] px-3.5 py-2 rounded-full font-medium transition">❓ View FAQ</Link>
            <Link to="/my-orders" className="text-xs bg-[#F8F6F1] hover:bg-[#FFF8DC] px-3.5 py-2 rounded-full font-medium transition">📦 Track Order</Link>
            <Link to="/shipping-policy" className="text-xs bg-[#F8F6F1] hover:bg-[#FFF8DC] px-3.5 py-2 rounded-full font-medium transition">🚚 Shipping Policy</Link>
            <Link to="/return-policy" className="text-xs bg-[#F8F6F1] hover:bg-[#FFF8DC] px-3.5 py-2 rounded-full font-medium transition">↩️ Return Policy</Link>
          </div>
        </div>

        {/* MAP + ADDRESS */}
        <div id="location" className="md:col-span-2 space-y-4">
          <div className="bg-[#111111] text-white rounded-[2rem] p-6 hover:shadow-2xl transition">
            <div className="flex gap-3"><div className="w-11 h-11 bg-[#D4AF37] rounded-2xl flex items-center justify-center shrink-0"><MapPin /></div><div><div className="font-bold">Visit Our Store</div><div className="text-sm text-gray-300 mt-1">{address}</div><div className="text-sm text-[#D4AF37] font-semibold">{city}, Pakistan</div></div></div>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-white text-black px-4 py-2.5 rounded-full text-sm font-bold mt-4 hover:bg-[#D4AF37] transition">Open in Google Maps <ChevronRight size={16} /></a>
          </div>
          <div className="rounded-[2rem] overflow-hidden border-4 border-[#F8F6F1] shadow-xl hover:border-[#D4AF37] transition-all duration-300 h-[320px] relative group">
            <iframe title="TALHA Location" src={mapUrl} className="w-full h-full border-0 grayscale-[20%] group-hover:grayscale-0 transition duration-500" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
            <div className="absolute bottom-3 left-3 bg-white/95 px-3.5 py-2.5 rounded-2xl shadow flex gap-2 items-center max-w-[90%]"><span className="w-8 h-8 bg-[#111111] text-[#D4AF37] rounded-lg flex items-center justify-center font-bold text-sm shrink-0">T</span><div className="min-w-0"><div className="font-bold text-xs truncate">TALHA Shopin Center</div><div className="text-[11px] text-gray-500 truncate">{address}</div></div></div>
          </div>
          <a href={waLink} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-[1.5rem] font-bold hover:scale-[1.02] transition-all duration-300 shadow-lg">💬 Chat on WhatsApp - Fast Reply</a>
        </div>
      </section>
      <style>{`@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }`}</style>
    </div>
  );
}
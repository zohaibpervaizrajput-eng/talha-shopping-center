import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Truck,  Gem, Heart, Star, ChevronRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

export default function About() {
  const { settings } = useSettings();

  // ★★★ ABOUT IMAGE - From Admin, otherwise default ★★★
  const aboutImage = settings.aboutImage || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';

  // LOCK: Location will come from Admin Settings - if admin has not filled it then this default will show
  const address = settings.locationAddress || settings.address || 'Main Bazaar, Sialkot, Punjab, Pakistan';
  const city = settings.locationCity || 'Sialkot';
  const phone = settings.phone || '0300-1234567';
  const email = settings.email || 'info@talhashopincenter.com';
  const whatsapp = settings.whatsapp || settings.phone || '0300-1234567';
  const timing = settings.storeTiming || '9 AM - 10 PM (Mon - Sat)';
  // LOCK: Admin will put Google Maps "Embed Link", that will run here in iframe
  const mapUrl = settings.mapEmbedUrl || `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const stats = [
    { icon: Heart, num: '10,000+', label: 'Happy Customers', color: 'bg-pink-50 text-pink-600' },
    { icon: Gem, num: '500+', label: 'Premium Designs', color: 'bg-amber-50 text-amber-600' },
    { icon: Truck, num: 'All Pakistan', label: 'Fast Delivery', color: 'bg-blue-50 text-blue-600' },
    { icon: Star, num: '4.9 / 5', label: 'Customer Rating', color: 'bg-green-50 text-green-600' },
  ];

  const values = [
    { title: '100% Genuine', desc: 'Every product is quality-checked. Gold, Diamond, Silver all original.', emoji: '💎' },
    { title: 'Best Prices', desc: 'Premium jewellery at factory rates. Daily offers and Sale.', emoji: '💰' },
    { title: 'Easy Returns', desc: 'Easy return within 7 days. No questions, no tension.', emoji: '↩️' },
    { title: 'Trusted Service', desc: 'Trust of 10,000+ customers. COD all over Pakistan.', emoji: '🤝' },
  ];

  const newLocal = "inline-block bg-gold text-black text-xs font-bold px-4 py-1.5 rounded-full tracking-widest";
  return (
    <div className="overflow-hidden">
      {/* HERO - With Animation */}
      <section className="relative bg-black-lux text-white py-16 md:py-20">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200')] bg-cover bg-center" />
        <div className="relative max-w-4xl mx-auto px-4 text-center animate-[fadeIn_0.8s_ease]">
          <div className={newLocal}>✦ EST. 2020 • PAKISTAN ✦</div>
          <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">About <span className="text-gold">Nisa</span><br />Collection</h1>
          <p className="text-gray-300 mt-4 max-w-2xl mx-auto">Where every piece is not just jewellery, it is a <b className="text-white">story</b>. Elegance, trust and premium quality - this is our identity.</p>
          <div className="flex gap-3 justify-center mt-6">
            <Link to="/products" className="bg-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 hover:shadow-[0_0_25px_#D4AF37] transition-all duration-300">Shop Collection →</Link>
            <a href="#location" className="border border-white/40 px-6 py-3 rounded-full hover:bg-white hover:text-black transition-all duration-300">Visit Our Store 📍</a>
          </div>
        </div>
      </section>

      {/* STATS - Will lift up on Hover */}
      <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={s.label} className="bg-white rounded-3xl shadow-lg p-5 text-center border hover:-translate-y-2 hover:shadow-2xl hover:border-gold transition-all duration-300 cursor-pointer group" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-12 h-12 ${s.color} rounded-2xl mx-auto flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}><s.icon size={24} /></div>
              <div className="font-bold text-2xl mt-3 group-hover:text-[#B8962E] transition">{s.num}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* OUR STORY */}
      <section className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-2 gap-10 items-center">
        <div className="group relative">
          <img src={aboutImage} alt={settings.storeName} className="w-full h-100 object-cover rounded-4xl" />
          <div className="absolute -bottom-4 -right-2 md:-right-4 bg-gold text-black rounded-2xl px-5 py-4 shadow-xl rotate-2 group-hover:rotate-0 transition duration-300"><div className="font-bold text-2xl">Since 2020</div><div className="text-xs">Trusted in Pakistan</div></div>
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold shadow">⭐ 4.9 Rated Store</div>
        </div>
        <div>
          <div className="text-[#B8962E] font-bold tracking-widest text-sm">✦ OUR STORY ✦</div>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 leading-tight">Jewellery that <span className="text-gold">wins hearts</span></h2>
          <p className="text-gray-600 mt-4 leading-relaxed">TALHA Shopin Center started with a small dream - every girl in Pakistan should get premium, genuine and affordable jewellery.</p>
          <p className="text-gray-600 mt-3 leading-relaxed">Today we specialize in <b>Gold, Diamond, Silver, Artificial and Bridal Collections</b>. We check every order with our own hands before sending it.</p>
          <div className="space-y-3 mt-5">
            {['Every product 100% Quality Checked', 'Cash on Delivery - All Pakistan', 'Free Delivery on orders of Rs. 5000+'].map(t => (
              <div key={t} className="flex gap-2 items-center text-sm font-medium bg-cream p-3 rounded-xl hover:bg-[#FFF8DC] hover:translate-x-1 transition-all duration-300"><span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs shrink-0">✓</span>{t}</div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY CHOOSE - Hover Cards */}
      <section className="bg-cream py-14">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center">Why Choose <span className="text-gold">TALHA?</span></h2>
          <p className="text-center text-gray-500 mt-2">The reason that makes us different from everyone</p>
          <div className="grid md:grid-cols-4 gap-4 mt-8">
            {values.map(v => (
              <div key={v.title} className="bg-white rounded-3xl p-6 text-center border-2 border-transparent hover:border-gold hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group cursor-pointer">
                <div className="text-5xl group-hover:scale-125 group-hover:-rotate-6 transition-all duration-300">{v.emoji}</div>
                <h3 className="font-bold text-lg mt-3 group-hover:text-[#B8962E] transition">{v.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ★★★ LOCATION + MAP - Will be controlled from Admin ★★★ */}
      <section id="location" className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-bold text-center">Visit Our <span className="text-gold">Store 📍</span></h2>
        <p className="text-center text-gray-500 mt-2">Come, have tea, see jewellery - you will find us right here</p>

        <div className="grid md:grid-cols-5 gap-6 mt-8">
          {/* LEFT - Location Details */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-black-lux text-white rounded-3xl p-6 hover:shadow-2xl transition duration-300">
              <div className="flex gap-3"><div className="w-11 h-11 bg-gold rounded-2xl flex items-center justify-center shrink-0"><MapPin /></div><div><div className="font-bold">Our Address</div><div className="text-sm text-gray-300 mt-1">{address}</div><div className="text-sm text-gold font-semibold mt-1">{city}, Pakistan</div></div></div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 bg-white text-black px-4 py-2 rounded-full text-sm font-bold mt-4 hover:bg-gold transition">Open in Google Maps <ChevronRight size={16} /></a>
            </div>

            {[
              { icon: Phone, label: 'Phone / WhatsApp', value: phone, href: `tel:${phone}`, bg: 'bg-green-50 hover:bg-green-100' },
              { icon: Mail, label: 'Email', value: email, href: `mailto:${email}`, bg: 'bg-blue-50 hover:bg-blue-100' },
              { icon: Clock, label: 'Store Timing', value: timing, href: null, bg: 'bg-amber-50 hover:bg-amber-100' },
            ].map(c => (
              <a key={c.label} href={c.href || undefined} className={`flex gap-3 items-center ${c.bg} rounded-2xl p-4 transition-all duration-300 hover:translate-x-1 hover:shadow-md group`}>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition"><c.icon size={20} /></div>
                <div><div className="text-xs text-gray-500">{c.label}</div><div className="font-bold text-sm">{c.value}</div></div>
              </a>
            ))}

            <a href={`https://wa.me/92${whatsapp.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-2xl font-bold hover:scale-[1.02] transition-all duration-300 shadow-lg">💬 Chat on WhatsApp</a>
          </div>

          {/* RIGHT - LIVE MAP */}
          <div className="md:col-span-3">
            <div className="rounded-3xl overflow-hidden border-4 border-cream shadow-xl hover:shadow-2xl hover:border-gold transition-all duration-300 h-full min-h-95 relative group">
              <iframe title="TALHA Shopin Center Location" src={mapUrl} className="w-full h-95 md:h-full min-h-0.5-[380px] border-0 grayscale-20 group-hover:grayscale-0 transition-all duration-500" loading="lazy" allowFullScreen referrerPolicy="no-referrer-when-downgrade" />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-3 rounded-2xl shadow-lg flex gap-2 items-center max-w-[90%]">
                <span className="w-9 h-9 bg-black-lux text-gold rounded-xl flex items-center justify-center font-bold shrink-0">T</span>
                <div className="min-w-0"><div className="font-bold text-sm truncate">TALHA Shopin Center</div><div className="text-xs text-gray-500 truncate">{address}</div></div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">📍 Map changes from Admin Panel - Settings → Store Location</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-linear-to-r from-black-lux to-[#2a2a2a] rounded-4xl p-8 md:p-10 text-center text-white relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gold opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition duration-500" />
          <h2 className="text-2xl md:text-3xl font-bold">Ready to Shine? ✨</h2>
          <p className="text-gray-300 mt-2">Order your favourite jewellery now - COD is available.</p>
          <div className="flex gap-3 justify-center mt-5 flex-wrap"><Link to="/products" className="bg-gold text-black px-6 py-3 rounded-full font-bold hover:scale-105 transition">Shop Now</Link><Link to="/contact" className="border border-white/40 px-6 py-3 rounded-full hover:bg-white hover:text-black transition">Contact Us</Link></div>
        </div>
      </section>
    </div>
  );
}

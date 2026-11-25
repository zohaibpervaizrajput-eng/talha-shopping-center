import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, ArrowRight, Truck, ShieldCheck, RotateCcw, Sparkles, Star, MessageCircle, ChevronRight } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';


// ★★★ FROM BACKEND - Image / Category object or string ★★★
const getCatName = (c) => { if (!c) return ''; if (typeof c === 'string') return c; return c.name || c.title || c.slug || ''; };
const getImg = (p) => {
  const raw = p?.images?.[0] || p?.image || '';
  if (!raw) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';
  if (typeof raw === 'string') return raw;
  return raw.url || raw.src || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800';
};

export default function Home() {
  const { add, toggleWish, wishlist } = useCart();
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(new Set());
  const [addedId, setAddedId] = useState(null);

  // ★★★ HERO FROM ADMIN SETTINGS - Admin -> Settings -> Hero Image / Title / Subtitle ★★★
  // ★★★ HERO SWIPER - ADMIN SE ★★★
const heroSlides = useMemo(() => {
  const fromAdmin = settings.heroImages || settings.heroGallery || [];
  let imgs = [];
  if (Array.isArray(fromAdmin) && fromAdmin.length > 0) {
    imgs = fromAdmin.map(i => typeof i === 'string' ? i : i.url || i.image || i.src).filter(Boolean);
  } else if (settings.heroImage) {
    imgs = [settings.heroImage];
  }
  const fallback = [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1600&q=80',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1600&q=80',
    'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=1600&q=80',
  ];
  if (imgs.length === 0) return fallback;
  if (imgs.length === 1) return [imgs[0], fallback[1], fallback[2]];
  return imgs;
}, [settings]);
  const heroTitle = settings.heroTitle || 'Timeless Jewellery';
  const heroSub = settings.heroSubtitle || 'Handcrafted with love, made to shine forever.';
  const whatsapp = settings.whatsapp || settings.phone || '0307-6128103';
  const waLink = `https://wa.me/92${String(whatsapp).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Hello! I want to order jewellery.')}`;

  // ★★★ BACKEND + ADMIN CONNECTED - Only 4 Products ★★★
  useEffect(() => {
    productAPI.list({ limit: 100 }).then(r => {
      const list = r.data?.products || r.data?.data || r.data || [];
      const arr = (Array.isArray(list) ? list : []).filter(p => p.isActive !== false);
      // Featured / New / Best first, then all
      arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setProducts(arr);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const featured = useMemo(() => products.slice(0, 4), [products]); // ★★★ ONLY 4 ★★★
  const saleCount = useMemo(() => products.filter(p => Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price)).length, [products]);

  // ★★★ FIXED: Add to Cart - Now connected to CartContext ★★★
  const addToCart = (p) => {
    if (!p || p.stock <= 0) return;
    add(p, 1, '');
    setAddedId(p._id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const toggleLike = (p) => {
    toggleWish(p);
    setLiked(prev => { const n = new Set(prev); n.has(p._id) ? n.delete(p._id) : n.add(p._id); return n; });
  };

  return <div className="overflow-hidden">

    {/* ★★★ HERO - IMAGE CHANGEABLE FROM ADMIN ★★★ */}
    {/* ★★★ HERO SWIPER - TEXT SAME, SIRF IMAGE CHANGE HOGI ★★★ */}
{/* ★★★ HERO SWIPER - FIXED - IMAGE AB AAYEGI ★★★ */}
{/* ★★★ HERO SWIPER - FINAL FIXED ★★★ */}
<section className="relative min-h-[520px] md:min-h-[620px] flex items-center overflow-hidden bg-black">
  
  {/* SWIPER */}
  <div className="absolute inset-0 w-full h-full">
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{ delay: 2500, disableOnInteraction: false }}
      pagination={{ clickable: true }}
      loop={true}
      className="w-full h-full"
      style={{ height: '100%', width: '100%' }}
    >
      {heroSlides.map((img, i) => (
        <SwiperSlide key={i} className="w-full h-full">
          <img 
            src={img} 
            alt={heroTitle} 
            className="w-full h-full object-cover block" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </SwiperSlide>
      ))}
    </Swiper>
  </div>

  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent z-10 pointer-events-none" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent z-10 pointer-events-none" />

  {/* Text */}
  <div className="relative z-20 max-w-7xl mx-auto px-4 py-16 w-full">
    <div className="max-w-xl animate-[fadeUp_0.6s_ease]">
      <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur border border-white/30 text-white text-xs font-bold px-4 py-2 rounded-full"><Sparkles size={14} className="text-yellow-300" /> NEW COLLECTION 2026 • HANDMADE</span>
      <h1 className="text-white text-5xl md:text-7xl font-black leading-[0.95] mt-5">{heroTitle.split(' ')[0]}<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-500 to-yellow-500">{heroTitle.split(' ').slice(1).join(' ') || 'Jewellery'}</span></h1>
      <p className="text-gray-200 mt-4 text-base md:text-lg leading-relaxed max-w-md">{heroSub}</p>
      <div className="flex items-center gap-1 mt-3 text-yellow-300 text-sm"><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><Star size={16} fill="currentColor" /><span className="text-white/80 ml-1 font-medium">4.9 • 2,000+ Happy Customers</span></div>
      <div className="flex gap-3 mt-7 flex-wrap">
        <Link to="/products" className="bg-yellow-500 text-black px-7 py-3.5 rounded-full font-black hover:bg-white hover:scale-105 transition shadow-xl shadow-yellow-500/30 flex items-center gap-2">Shop Now <ArrowRight size={18} /></Link>
        <Link to="/sale" className="bg-white/10 backdrop-blur border border-white/40 text-white px-7 py-3.5 rounded-full font-bold hover:bg-white hover:text-black transition">🔥 Sale {saleCount > 0 && `(${saleCount})`}</Link>
        <a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 text-white px-6 py-3.5 rounded-full font-bold flex items-center gap-2 hover:bg-green-600 hover:scale-105 transition"><MessageCircle size={18} /> WhatsApp</a>
      </div>
      <div className="flex gap-6 mt-8 text-white/90 text-sm"><div><b className="text-white text-lg block">{products.length}+</b>Designs</div><div><b className="text-white text-lg block">COD</b>All Pakistan</div><div><b className="text-white text-lg block">100%</b>Original</div></div>
    </div>
  </div>

  {/* Bottom Wave */}
  <div className="absolute bottom-0 left-0 right-0 z-20"><svg viewBox="0 0 1440 60" className="w-full h-10 fill-white"><path d="M0,30 C240,60 480,0 720,30 C960,60 1200,0 1440,30 L1440,60 L0,60 Z" /></svg></div>
</section>

{/* ★★★ TRUST BAR ★★★ */}

    {/* ★★★ TRUST BAR ★★★ */}
    <section className="max-w-7xl mx-auto px-4 -mt-2 relative z-10">
      <div className="bg-white border shadow-xl rounded-3xl grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 overflow-hidden">
        {[[Truck, 'Free Delivery', 'On orders over Rs 3000'], [ShieldCheck, '100% Original', 'Quality Guaranteed'], [RotateCcw, 'Easy Return', '7 Days Return'], [Sparkles, 'Handmade', 'Made With Love & Care']].map(([Icon, t, s], i) => (
          <div key={i} className="p-4 flex gap-3 items-center hover:bg-yellow-50 transition"><div className="w-11 h-11 shrink-0 bg-yellow-100 rounded-full flex items-center justify-center text-[#B8962E]"><Icon size={20} /></div><div><div className="font-bold text-sm">{t}</div><div className="text-[11px] text-gray-500">{s}</div></div></div>
        ))}
      </div>
    </section>

    {/* ★★★ FEATURED - ONLY 4 PRODUCTS - CONNECTED TO CART + PRODUCTS PAGE ★★★ */}
    <section className="max-w-7xl mx-auto px-4 pt-12 pb-4">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div><span className="text-[#B8962E] font-bold text-xs tracking-[0.2em]">✨ HANDPICKED FOR YOU</span><h2 className="text-3xl md:text-4xl font-black mt-1">Featured <span className="text-gold">Products</span></h2><p className="text-sm text-gray-500 mt-1">Only 4 best products - Find all products on the Products Page.</p></div>
        <Link to="/products" className="group bg-black-lux text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gold hover:text-black transition">View All Products <ArrowRight size={16} className="group-hover:translate-x-1 transition" /></Link>
      </div>

      {loading ? <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
        : featured.length === 0 ? (
          <div className="text-center py-14 bg-gray-50 rounded-4xl mt-6 border-2 border-dashed"><div className="text-5xl">💎</div><p className="font-bold text-lg mt-2">No products yet</p><p className="text-sm text-gray-500">Go to Admin → Products → Add Product</p><Link to="/products" className="inline-block bg-black-lux text-white px-6 py-3 rounded-full font-bold text-sm mt-4">Products Page →</Link></div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {featured.map(p => {
              const price = Number(p.salePrice || p.price || 0);
              const old = Number(p.price || 0);
              const disc = old > price ? Math.round((1 - price / old) * 100) : 0;
              const isLiked = liked.has(p._id) || wishlist?.some(w => w._id === p._id);
              return (
                <div key={p._id} className="group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-gold transition-all duration-500">
                  <div className="relative overflow-hidden h-55 md:h-65">
                    <Link to={`/product/${p._id}`}><img src={getImg(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" loading="lazy" /></Link>
                    {p.isNew && <span className="absolute top-3 left-3 bg-gold text-black text-[11px] font-bold px-2.5 py-1 rounded-full">🆕 NEW</span>}
                    {disc > 0 && <span className="absolute top-3 right-3 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">-{disc}% OFF</span>}
                    <button onClick={() => toggleLike(p)} className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition hover:scale-110 ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}><Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /></button>
                    {/* Hover Quick Add */}
                    <div className="absolute inset-x-3 bottom-3 translate-y-14 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                      <button onClick={() => addToCart(p)} className={`flex-1 text-white text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1.5 transition ${addedId === p._id ? 'bg-green-500' : 'bg-black-lux hover:bg.filter(item => item)-[#D4AF37] hover:text-black'}`}><ShoppingBag size={14} /> {addedId === p._id ? 'Added ✓' : 'Add to Cart'}</button>
                      <Link to={`/product/${p._id}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gold transition"><Eye size={16} /></Link>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] text-[#B8962E] font-bold uppercase tracking-wide">{getCatName(p.category) || 'Jewellery'} • {p.material || 'Gold'}</div>
                    <Link to={`/product/${p._id}`} className="font-bold text-sm line-clamp-2 leading-snug hover:text-[#B8962E] block min-h-10 mt-0.5">{p.name}</Link>
                    <div className="flex items-center gap-1 mt-1 text-xs"><span className="text-gold">★ ★ ★ ★ ★</span><span className="font-semibold">{p.rating || 5}.0</span><span className={`ml-auto px-2 py-0.5 rounded-full font-bold ${p.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>{p.stock > 0 ? 'In Stock' : 'Out of Stock'}</span></div>
                    <div className="flex items-center gap-2 mt-2"><span className="font-black">Rs. {price.toLocaleString()}</span>{disc > 0 && <span className="text-xs text-gray-400 line-through">Rs. {old.toLocaleString()}</span>}</div>
                    <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className="md:hidden w-full bg-black-lux text-white text-xs font-bold py-2.5 rounded-full mt-3 active:scale-95 transition disabled:opacity-50">{addedId === p._id ? 'Added ✓' : 'Add to Cart 🛒'}</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </section>

    {/* ★★★ SALE BANNER - Sale Count from Backend ★★★ */}
    {saleCount > 0 && (
      <section className="max-w-7xl mx-auto px-4 pt-6">
        <Link to="/sale" className="group block bg-linear-to-r from-red-600 via-red-500 to-orange-500 text-white rounded-4xl p-6 md:p-8 relative overflow-hidden hover:scale-[1.01] transition shadow-xl">
          <div className="absolute -right-4 -top-6 text-[120px] opacity-20 font-black rotate-12 select-none">%</div>
          <div className="relative flex items-center justify-between flex-wrap gap-4"><div><span className="bg-yellow-400 text-black text-xs font-black px-3 py-1.5 rounded-full">🔥 LIMITED TIME</span><h3 className="text-2xl md:text-3xl font-black mt-2">MEGA SALE is Live!</h3><p className="text-red-100 text-sm mt-1">{saleCount} products on discount - Shop now, do not miss out!</p></div><span className="bg-white text-red-600 px-6 py-3 rounded-full font-black flex items-center gap-2 group-hover:gap-3 transition-all">Shop Sale <ChevronRight size={18} /></span></div>
        </Link>
      </section>
    )}

    {/* ★★★ CATEGORIES - Connected to Products Page ★★★ */}
    <section className="max-w-7xl mx-auto px-4 pt-10">
      <h2 className="text-2xl font-black">Shop by <span className="text-gold">Category</span></h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
        {[['💍', 'Rings', 'ring'], ['📿', 'Necklaces', 'necklace'], ['👂', 'Earrings', 'earring'], ['⌚', 'Bracelets', 'bracelet'], ['👑', 'Bridal', 'bridal'], ['✨', 'All', '']].map(([emoji, label, cat]) => (
          <Link key={label} to={cat ? `/products?category=${cat}` : '/products'} className="bg-white border rounded-3xl p-4 text-center hover:border-gold hover:shadow-xl hover:-translate-y-1 transition group"><div className="text-3xl group-hover:scale-125 transition">{emoji}</div><div className="font-bold text-sm mt-2">{label}</div><div className="text-[11px] text-gray-400 group-hover:text-[#B8962E]">Shop Now →</div></Link>
        ))}
      </div>
    </section>

    {/* ★★★ DETAILS - BELOW ★★★ */}
    <section className="max-w-7xl mx-auto px-4 py-12">
      <div className="bg-black-lux text-white rounded-4xl p-7 md:p-10 grid md:grid-cols-2 gap-8 items-center relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 text-[180px] opacity-10 select-none">💎</div>
        <div className="relative">
          <span className="text-gold font-bold text-xs tracking-[0.2em]">✨ OUR STORY</span>
          <h2 className="text-3xl md:text-4xl font-black leading-tight mt-2">Every Piece Tells A <span className="text-gold">Story</span></h2>
          <p className="text-gray-300 mt-3 leading-relaxed text-sm md:text-base">We handcraft every jewellery piece with premium quality, genuine material, and love. Whether it is a wedding or a gift, make every moment memorable. Cash on Delivery across Pakistan.</p>
          <div className="grid grid-cols-2 gap-3 mt-5 text-sm"><div className="bg-white/10 rounded-2xl p-3"><b className="text-gold">✓ Premium Quality</b><div className="text-gray-300 text-xs mt-1">Gold Plated • Long Lasting Shine</div></div><div className="bg-white/10 rounded-2xl p-3"><b className="text-gold">✓ Safe Delivery</b><div className="text-gray-300 text-xs mt-1">Secure Packing • Fast COD</div></div></div>
          <div className="flex gap-3 mt-6 flex-wrap"><Link to="/products" className="bg-gold text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-white transition">Shop Collection →</Link><a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 px-6 py-3 rounded-full font-bold text-sm hover:bg-green-600 transition">💬 WhatsApp Order</a></div>
        </div>
        <div className="relative"><img src="https://images.unsplash.com/photo-1610694955371-d4a3e0ce4b52?w=900&q=80" alt="Jewellery Details" className="rounded-3xl w-full h-70 md:h-85 object-cover border-4 border-white/10" /><div className="absolute -bottom-3 left-4 bg-white text-black rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3"><div className="text-2xl">💎</div><div><div className="font-black text-sm">2,000+ Happy Customers</div><div className="text-xs text-gray-500">★★★★★ 4.9 Rating</div></div></div></div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-6">© {new Date().getFullYear()} {settings.siteName || 'Your Store'} • Cash on Delivery • 7 Days Easy Return • Made with ❤️ in Pakistan</p>
    </section>

    <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>
  </div>;
}
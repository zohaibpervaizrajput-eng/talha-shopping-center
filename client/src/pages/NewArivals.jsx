import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, Sparkles, Clock, Flame, MessageCircle, ChevronRight } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

// ★★★ FROM BACKEND - Category / Image object or string, both will work ★★★
const getCatName = (c) => { if (!c) return ''; if (typeof c === 'string') return c; return c.name || c.title || c.slug || ''; };
const getImg = (p) => {
  const raw = p?.images?.[0] || p?.image || '';
  if (!raw) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
  if (typeof raw === 'string') return raw;
  return raw.url || raw.src || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
};
const daysAgo = (d) => {
  if (!d) return 'Just Now';
  const diff = Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today ✨';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} Days Ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} Week Ago`;
  return `${Math.floor(diff / 30)} Month Ago`;
};

const PER_PAGE = 6;

export default function NewArrivals() {
  // ★★★ FIXED: In CartContext name is 'add', not 'addToCart' ★★★
  const { add, toggleWish, wishlist } = useCart();
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(new Set());
  const [addedId, setAddedId] = useState(null);
  const [page, setPage] = useState(1);

  const whatsapp = settings.whatsapp || settings.phone || '0307-6128103';
  const waLink = `https://wa.me/92${String(whatsapp).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Assalam-o-Alaikum! I want to order from New Arrivals.')}`;

  // ★★★ BACKEND + ADMIN CONNECTED - Only New Products ★★★
  // Admin -> Products -> Edit -> ✨ New Arrival tick = will come here
  // If no one is ticked then Backend will bring newest (createdAt) 12 products - so page does not look empty
  useEffect(() => {
    productAPI.list({ limit: 100 }).then(r => {
      const list = r.data?.products || r.data?.data || r.data || [];
      const arr = Array.isArray(list) ? list : [];
      const active = arr.filter(p => p.isActive !== false);
      const markedNew = active.filter(p => p.isNew === true);
      // Newest first - freshest on top
      const sorted = [...active].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      const final = markedNew.length > 0 ? [...markedNew].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)) : sorted.slice(0, 12);
      setProducts(final);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  // ★★★ FIXED: Add to Cart - Now will work correctly ★★★
  const addToCart = (p) => {
    if (!p || p.stock <= 0) return;
    add(p, 1, '');
    setAddedId(p._id || p.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  // ★★★ PAGINATION - 8 per page ★★★
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PER_PAGE;
  const paged = products.slice(startIdx, startIdx + PER_PAGE);
  const goPage = (n) => { setPage(Math.max(1, Math.min(totalPages, n))); window.scrollTo({ top: document.getElementById('new-grid')?.offsetTop - 80 || 0, behavior: 'smooth' }); };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [products.length]);

  const heroProduct = products[0];
  const toggleLike = (p) => {
    toggleWish(p);
    const id = p._id || p.id;
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  // Just Landed - Today / This Week ones
  const todayCount = useMemo(() => products.filter(p => daysAgo(p.createdAt) === 'Today ✨' || daysAgo(p.createdAt) === 'Yesterday').length, [products]);

  const newLocal = "absolute inset-0 bg-linear-to-br from-gold/30 via-black to-black";
  return <div className="overflow-hidden">
    {/* ★★★ HERO - NOT LIKE SHOP, MAGAZINE STYLE ★★★ */}
    <section className="relative bg-black-lux text-white overflow-hidden">
      <div className={newLocal} />
      <div className="absolute -right-10 -top-10 text-[180px] opacity-10 rotate-12">✨</div>
      <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16 grid md:grid-cols-2 gap-8 items-center">
        <div className="animate-[fadeUp_0.6s_ease]">
          <div className="inline-flex items-center gap-2 bg-gold text-black text-xs font-bold px-4 py-2 rounded-full animate-[pulse_2s_infinite]"><Sparkles size={14} /> JUST LANDED • {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} ✨</div>
          <h1 className="text-4xl md:text-6xl font-bold leading-[1.05] mt-4">Fresh <span className="text-gold">Arrivals</span><br />Hot & New 💎</h1>
          <p className="text-gray-300 mt-4 max-w-md">Newest designs - first come, first served! This stock finishes quickly. Admin has just added them.</p>
          <div className="flex gap-4 mt-5">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5 text-center"><div className="font-bold text-xl text-gold">{products.length}</div><div className="text-[11px] text-gray-300">New Designs</div></div>
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5 text-center"><div className="font-bold text-xl text-gold">{todayCount}</div><div className="text-[11px] text-gray-300">Added Today</div></div>
            <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-2.5 text-center"><div className="font-bold text-xl text-gold">🔥</div><div className="text-[11px] text-gray-300">Limited Stock</div></div>
          </div>
          <div className="flex gap-3 mt-6 flex-wrap">
            <a href="#new-grid" className="bg-gold text-black px-6 py-3 rounded-full font-bold hover:bg-white transition hover:scale-105">Explore New ↓</a>
            <a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-600 hover:scale-105 transition"><MessageCircle size={18} /> WhatsApp Order</a>
          </div>
        </div>
        {/* HERO FEATURED - Newest product will show big */}
        {heroProduct && (
          <Link to={`/product/${heroProduct._id}`} className="group relative block overflow-hidden rounded-4xl h-75 md:h-90 shadow-2xl hover:scale-[1.02] transition duration-500">
            <img src={getImg(heroProduct)} alt={heroProduct.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full animate-[pulse_1.5s_infinite]">🔥 STAR OF THE WEEK</span>
            <span className="absolute top-4 right-4 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">🆕 {daysAgo(heroProduct.createdAt)}</span>
            <div className="absolute bottom-0 p-5 text-white w-full">
              <div className="text-[11px] text-gold font-bold tracking-widest">{getCatName(heroProduct.category)?.toUpperCase()}</div>
              <div className="font-bold text-2xl leading-tight">{heroProduct.name}</div>
              <div className="flex items-center gap-2 mt-1"><span className="font-bold text-xl">Rs {Number(heroProduct.salePrice || heroProduct.price || 0).toLocaleString()}</span>{heroProduct.salePrice && Number(heroProduct.salePrice) !== Number(heroProduct.price) && <span className="text-sm text-gray-300 line-through">Rs {Number(heroProduct.price).toLocaleString()}</span>}<span className="ml-auto bg-gold text-black text-xs font-bold px-3 py-1.5 rounded-full group-hover:bg-white transition">View →</span></div>
            </div>
          </Link>
        )}
      </div>
      {/* Marquee - Not in Shop */}
      <div className="relative bg-gold text-black py-2 overflow-hidden whitespace-nowrap font-bold text-sm"><div className="inline-block animate-[marquee_18s_linear_infinite]">✨ NEW ARRIVALS &nbsp;•&nbsp; FRESH STOCK &nbsp;•&nbsp; LIMITED PIECES &nbsp;•&nbsp; ORDER ON WHATSAPP &nbsp;•&nbsp; CASH ON DELIVERY &nbsp;•&nbsp; ✨ NEW ARRIVALS &nbsp;•&nbsp; FRESH STOCK &nbsp;•&nbsp; LIMITED PIECES &nbsp;•&nbsp;</div></div>
    </section>

    {/* ★★★ TIMELINE STRIP - WHEN IT CAME, HOW NEW ★★★ */}
    <section className="max-w-7xl mx-auto px-4 pt-8">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { e: '🆕', t: 'Today Added', d: 'Absolutely fresh' },
          { e: '🔥', t: 'Hot Selling', d: 'Everyone is asking for it' },
          { e: '💎', t: 'Premium Pick', d: 'Best quality' },
          { e: '🎁', t: 'Gift Ready', d: 'Beautiful packing' },
        ].map((b, i) => <div key={i} className="flex items-center gap-3 bg-white border rounded-full pl-2 pr-5 py-2 shrink-0 hover:border-gold hover:shadow-lg hover:-translate-y-0.5 transition"><span className="w-9 h-9 bg-[#FFF8DC] rounded-full flex items-center justify-center text-lg">{b.e}</span><div><div className="font-bold text-sm leading-none">{b.t}</div><div className="text-[11px] text-gray-400">{b.d}</div></div></div>)}
      </div>
    </section>

    {/* ★★★ GRID - NO FILTER, NO SEARCH, NO SORT - ONLY NEW ★★★ */}
    <section id="new-grid" className="max-w-7xl mx-auto px-4 pt-8 pb-12 scroll-mt-20">
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div><h2 className="text-2xl md:text-3xl font-bold">This Week's <span className="text-gold">Fresh Drops</span> ✨</h2><p className="text-sm text-gray-500 mt-1">What Admin newly added - only those are showing here. No filter, only new.</p></div>
        <Link to="/shop" className="text-sm font-bold flex items-center gap-1 hover:text-[#B8962E] group">View All Products <ChevronRight size={16} className="group-hover:translate-x-1 transition" /></Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-70 bg-gray-100 rounded-3xl animate-pulse" />)}</div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFDF5] rounded-4xl mt-6 border-2 border-dashed border-gold/40">
          <div className="text-6xl">💎✨</div><p className="font-bold text-xl mt-3">No New Arrival right now</p><p className="text-sm text-gray-500 mt-1">Admin → Products → Edit → ✨ Tick New Arrival, then it will come here</p>
          <Link to="/shop" className="inline-block bg-black-lux text-white px-6 py-3 rounded-full font-bold text-sm mt-4 hover:bg-gold hover:text-black transition">View Shop →</Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
            {paged.map((p, idx) => {
              const price = Number(p.salePrice || p.price || 0);
              const old = Number(p.price || 0);
              const disc = old > price ? Math.round((1 - price / old) * 100) : 0;
              const isToday = daysAgo(p.createdAt) === 'Today ✨';
              const pid = p._id || p.id;
              const isLiked = liked.has(pid) || wishlist?.some(w => (w._id || w.id) === pid);
              const isAdded = addedId === pid;
              return (
                <div key={pid} className="group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-gold transition-all duration-500 relative">
                  {/* Number Badge - Not in Shop */}
                  <span className="absolute top-3 left-3 z-10 bg-black text-white text-[11px] font-bold w-7 h-7 rounded-full flex items-center justify-center shadow">#{startIdx + idx + 1}</span>
                  <div className="relative overflow-hidden h-50 md:h-57.5">
                    <Link to={`/product/${pid}`}><img src={getImg(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-700" loading="lazy" /></Link>
                    {disc > 0 && <span className="absolute top-3 left-10 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">-{disc}%</span>}
                    <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${isToday ? 'bg-green-500 text-white animate-[pulse_1.5s_infinite]' : 'bg-gold text-black'}`}>{isToday ? '🆕 TODAY' : '✨ NEW'}</span>
                    <button onClick={() => toggleLike(p)} className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition hover:scale-110 ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}><Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /></button>
                    <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1"><Clock size={12} /> {daysAgo(p.createdAt)}</span>
                    <div className="absolute inset-x-3 bottom-12 flex gap-2 translate-y-14 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => addToCart(p)} className={`flex-1 text-white text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1 transition ${isAdded ? 'bg-green-500' : 'bg-black-lux hover:bg-gold hover:text-black'}`}><ShoppingBag size={14} /> {isAdded ? 'Added ✓' : 'Add to Cart'}</button>
                      <Link to={`/product/${pid}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gold transition"><Eye size={16} /></Link>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="text-[11px] text-[#B8962E] font-bold uppercase tracking-wide">{getCatName(p.category) || 'Jewellery'}</div>
                    <Link to={`/product/${pid}`} className="font-bold text-sm line-clamp-2 leading-snug hover:text-[#B8962E] transition block min-h-10">{p.name}</Link>
                    <div className="flex items-center gap-1 mt-1 text-xs"><span className="text-gold">★★★★★</span><span className="text-gray-400">(New • 5.0)</span></div>
                    <div className="flex items-center gap-2 mt-1.5"><span className="font-bold text-base">Rs {price.toLocaleString()}</span>{disc > 0 && <span className="text-xs text-gray-400 line-through">Rs {old.toLocaleString()}</span>}</div>
                    {p.stock <= 5 && p.stock > 0 && <div className="text-[11px] font-bold text-orange-600 mt-1 flex items-center gap-1"><Flame size={12} /> Hurry! Only {p.stock} left</div>}
                    {p.stock <= 0 && <div className="text-[11px] font-bold text-red-600 mt-1">Out of Stock - Order on WhatsApp</div>}
                    <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className="md:hidden w-full bg-black-lux text-white text-xs font-bold py-2.5 rounded-full mt-2 active:scale-95 transition disabled:opacity-50">{isAdded ? 'Added ✓' : 'Add to Cart 🛒'}</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ★★★ PAGINATION - Like Products Page ★★★ */}
          {totalPages > 1 && (
            <div className="mt-8">
              <div className="text-center mb-3">
                <span className="bg-black-lux text-white text-xs font-bold px-4 py-2 rounded-full">
                  📄 Page {safePage} of {totalPages} • Showing {startIdx + 1} - {Math.min(startIdx + PER_PAGE, products.length)} of {products.length} products • {PER_PAGE} per page
                </span>
              </div>
              <div className="flex justify-center items-center gap-2 flex-wrap">
                <button disabled={safePage === 1} onClick={() => goPage(safePage - 1)} className="flex items-center gap-1 border px-4 py-2.5 rounded-full bg-white font-bold text-sm disabled:opacity-40">← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => goPage(n)} className={`w-10 h-10 rounded-full font-bold text-sm ${n === safePage ? 'bg-black-lux text-white scale-110 shadow-lg' : 'bg-white border'}`}>{n}</button>
                ))}
                <button disabled={safePage === totalPages} onClick={() => goPage(safePage + 1)} className="flex items-center gap-1 border px-4 py-2.5 rounded-full bg-white font-bold text-sm disabled:opacity-40">Next →</button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">One page has <b>{PER_PAGE} products</b> • Total <b>{products.length}</b> products • Total Pages <b>{totalPages}</b></p>
            </div>
          )}
        </>
      )}
    </section>

    {/* CTA - NOT LIKE SHOP */}
    <section className="max-w-7xl mx-auto px-4 pb-14">
      <div className="bg-linear-to-r from-black-lux to-[#2a2a2a] text-white rounded-4xl p-7 md:p-10 text-center relative overflow-hidden">
        <div className="absolute -left-8 -top-8 text-7xl opacity-20 rotate-12">💎</div><div className="absolute -right-8 -bottom-8 text-7xl opacity-20 -rotate-12">✨</div>
        <h2 className="text-3xl font-bold relative">New Stock <span className="text-gold">Finishes As Soon As It Comes!</span></h2>
        <p className="text-gray-300 mt-2 relative">Order on WhatsApp - order today, delivery tomorrow. Cash on Delivery.</p>
        <div className="flex gap-3 justify-center mt-6 flex-wrap relative"><Link to="/shop" className="bg-gold text-black px-7 py-3.5 rounded-full font-bold hover:bg-white transition hover:scale-105">Shop All →</Link><a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 px-7 py-3.5 rounded-full font-bold hover:scale-105 transition">💬 WhatsApp Order</a></div>
      </div>
    </section>

    <style>{`
      @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
      .scrollbar-hide::-webkit-scrollbar { display:none; } .scrollbar-hide { scrollbar-width:none; }
    `}</style>
  </div>;
}
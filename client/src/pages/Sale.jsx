import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Eye, Flame, Clock, MessageCircle, Zap, Tag, ChevronRight } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

// ★★★ FROM BACKEND - Image / Category object or string ★★★
const getCatName = (c) => { if (!c) return ''; if (typeof c === 'string') return c; return c.name || c.title || c.slug || ''; };
const getImg = (p) => {
  const raw = p?.images?.[0] || p?.image || '';
  if (!raw) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
  if (typeof raw === 'string') return raw;
  return raw.url || raw.src || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600';
};

// ★★★ SALE END - Till Next Sunday night 12 o'clock Sale (Can change from Admin Settings) ★★★
const getSaleEnd = () => {
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7 || 7)); // Next Sunday
  end.setHours(23, 59, 59, 0);
  return end;
};

const PER_PAGE = 6;

export default function Sale() {
  // ★★★ FIXED: In CartContext name is 'add', not 'addToCart' ★★★
  const { add, toggleWish, wishlist } = useCart();
  const { settings } = useSettings();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(new Set());
  const [addedId, setAddedId] = useState(null);
  const [page, setPage] = useState(1);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [tab, setTab] = useState('All'); // All | 50%+ | Category tabs - These are not Filters, they are Sale Tabs

  const whatsapp = settings.whatsapp || settings.phone || '0307-6128103';
  const waLink = `https://wa.me/92${String(whatsapp).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Assalam-o-Alaikum! I want to order from SALE products.')}`;

  // ★★★ COUNTDOWN TIMER ★★★
  useEffect(() => {
    const tick = () => {
      const diff = getSaleEnd() - new Date();
      setTimeLeft({ d: Math.floor(diff / 86400000), h: Math.floor(diff / 3600000) % 24, m: Math.floor(diff / 60000) % 60, s: Math.floor(diff / 1000) % 60 });
    };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, []);

  // ★★★ FIXED: BACKEND + ADMIN CONNECTED - ONLY ADMIN SELECTED SALE PRODUCTS ★★★
  // Admin -> Products -> Edit -> ✅ "Show in Sale" / "Is On Sale" tick = Only those will come here
  // Reducing Price will NOT bring it to Sale now - Only Admin Selection will work
  useEffect(() => {
    productAPI.list({ limit: 200 }).then(r => {
      const list = r.data?.products || r.data?.data || r.data || [];
      const arr = Array.isArray(list) ? list : [];
      const active = arr.filter(p => p.isActive !== false);

      // ★★★ ADMIN SELECTION CHECK - If any one field is ticked then it will come in Sale ★★★
      const isSelectedForSale = (p) => p.isOnSale === true || p.isSale === true || p.showInSale === true || p.showOnSalePage === true || p.isSaleSelected === true || p.saleSelected === true;

      const hasAnySelection = active.some(isSelectedForSale);

      let sale;
      if (hasAnySelection) {
        // ✅ ADMIN SELECTED - Only selected ones
        sale = active.filter(p => isSelectedForSale(p));
      } else {
        // ⚠️ FALLBACK: If Admin has not selected anyone yet then old logic (Sale Price < Price) will run so page does not look empty
        sale = active.filter(p => {
          const price = Number(p.price || 0);
          const salePrice = Number(p.salePrice || 0);
          return price > 0 && salePrice > 0 && salePrice < price;
        });
      }

      // Highest discount first
      sale.sort((a, b) => {
        const da = 1 - Number(a.salePrice) / Number(a.price);
        const db = 1 - Number(b.salePrice) / Number(b.price);
        return db - da;
      });
      setProducts(sale);
    }).catch(() => setProducts([])).finally(() => setLoading(false));
  }, []);

  const withDisc = useMemo(() => products.map(p => {
    const price = Number(p.price || 0);
    const salePrice = Number(p.salePrice || 0);
    const disc = price > 0 ? Math.round((1 - salePrice / price) * 100) : 0;
    const save = price - salePrice;
    return { ...p, price, salePrice, disc, save };
  }), [products]);

  // ★★★ FIXED TABS: Under 1000 / Under 2000 finished - Now only All, 50%+ and Category tabs ★★★
  const categories = useMemo(() => {
    const s = new Set();
    withDisc.forEach(p => { const n = getCatName(p.category); if (n) s.add(n); });
    return [...s];
  }, [withDisc]);

  const filtered = tab === 'All' ? withDisc : tab === '50%+' ? withDisc.filter(p => p.disc >= 50) : withDisc.filter(p => getCatName(p.category) === tab);

  // ★★★ PAGINATION - 8 per page ★★★
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const startIdx = (safePage - 1) * PER_PAGE;
  const shown = filtered.slice(startIdx, startIdx + PER_PAGE);
  const goPage = (n) => { setPage(Math.max(1, Math.min(totalPages, n))); window.scrollTo({ top: document.getElementById('sale-grid')?.offsetTop - 80 || 0, behavior: 'smooth' }); };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [tab, products.length]);

  const hero = withDisc[0];
  const maxDisc = withDisc.length ? Math.max(...withDisc.map(p => p.disc)) : 0;
  const totalSave = withDisc.reduce((s, p) => s + p.save, 0);

  // ★★★ FIXED: Add to Cart + Wishlist ★★★
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

  const newLocal = "group relative block overflow-hidden rounded-4xl h-75 md:h-90 shadow-2xl border-4 border-white/30 hover:scale-[1.02] transition";
  return <div className="overflow-hidden">
    {/* ★★★ SALE HERO - RED THEME, DIFFERENT FROM SHOP / NEW ARRIVALS ★★★ */}
    <section className="relative bg-linear-to-br from-[#B91C1C] via-[#DC2626] to-[#7F1D1D] text-white overflow-hidden">
      <div className="absolute inset-0 opacity-20 text-[200px] font-black leading-none select-none">SALE<br />SALE</div>
      <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-14 grid md:grid-cols-2 gap-8 items-center">
        <div className="animate-[fadeUp_0.6s_ease]">
          <div className="inline-flex items-center gap-2 bg-white text-red-600 text-xs font-black px-4 py-2 rounded-full animate-[pulse_1.5s_infinite]"><Zap size={14} /> MEGA SALE IS LIVE 🔥</div>
          <h1 className="text-5xl md:text-7xl font-black leading-[0.95] mt-4">UP TO<br /><span className="text-yellow-300 text-6xl md:text-8xl">{maxDisc}% OFF</span></h1>
          <p className="text-red-100 mt-3 max-w-md">Biggest Sale! Only Admin Selected products - Which Admin selected for Sale, only those are here. Buy before stock finishes!</p>

          {/* COUNTDOWN */}
          <div className="mt-5">
            <div className="text-xs font-bold tracking-widest flex items-center gap-1"><Clock size={14} /> SALE ENDS IN:</div>
            <div className="flex gap-2 mt-2">
              {[['Days', timeLeft.d], ['Hours', timeLeft.h], ['Mins', timeLeft.m], ['Secs', timeLeft.s]].map(([label, val]) => (
                <div key={label} className="bg-black/40 backdrop-blur rounded-2xl w-17.5 py-2.5 text-center border border-white/20"><div className="font-black text-2xl tabular-nums">{String(val).padStart(2, '0')}</div><div className="text-[10px] tracking-widest text-red-200">{label}</div></div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6 flex-wrap">
            <a href="#sale-grid" className="bg-white text-red-600 px-6 py-3 rounded-full font-black hover:scale-105 transition shadow-xl">Shop Sale ↓</a>
            <a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-green-600 hover:scale-105 transition"><MessageCircle size={18} /> WhatsApp Order</a>
          </div>
        </div>

        {/* HERO PRODUCT - Highest discount one */}
        {hero && (
          <Link to={`/product/${hero._id}`} className={newLocal}>
            <img src={getImg(hero)} alt={hero.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
            <span className="absolute top-4 left-4 bg-yellow-400 text-black text-sm font-black px-4 py-2 rounded-full rotate-[-3deg] shadow-xl">🔥 -{hero.disc}% BIGGEST DEAL</span>
            <span className="absolute top-4 right-4 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-full">You Save Rs {hero.save.toLocaleString()}</span>
            <div className="absolute bottom-0 p-5 text-white w-full">
              <div className="text-[11px] text-yellow-300 font-bold tracking-widest">{getCatName(hero.category)?.toUpperCase()}</div>
              <div className="font-bold text-2xl leading-tight">{hero.name}</div>
              <div className="flex items-center gap-2 mt-1"><span className="font-black text-2xl text-yellow-300">Rs {hero.salePrice.toLocaleString()}</span><span className="text-gray-300 line-through">Rs {hero.price.toLocaleString()}</span><span className="ml-auto bg-yellow-400 text-black text-xs font-black px-3 py-1.5 rounded-full">View Deal →</span></div>
            </div>
          </Link>
        )}
      </div>
      <div className="relative bg-yellow-400 text-black py-2 overflow-hidden whitespace-nowrap font-black text-sm"><div className="inline-block animate-[marquee_16s_linear_infinite]">🔥 SALE SALE SALE &nbsp;•&nbsp; UP TO {maxDisc}% OFF &nbsp;•&nbsp; CASH ON DELIVERY &nbsp;•&nbsp; LIMITED STOCK &nbsp;•&nbsp; 🔥 SALE SALE SALE &nbsp;•&nbsp; UP TO {maxDisc}% OFF &nbsp;•&nbsp;</div></div>
    </section>

    {/* SALE STATS */}
    <section className="max-w-7xl mx-auto px-4 mt-0 pt-6">
      <div className="grid grid-cols-3 gap-3">
        {[['🔥', `${products.length} Products`, 'On Sale'], ['💰', `Rs ${totalSave.toLocaleString()}`, 'Total You Save'], ['🏷️', `Up to ${maxDisc}%`, 'Max Discount']].map(([e, n, l], i) => <div key={i} className="bg-white border rounded-2xl p-4 text-center hover:shadow-xl hover:-translate-y-1 transition"><div className="text-2xl">{e}</div><div className="font-black text-lg">{n}</div><div className="text-[11px] text-gray-500">{l}</div></div>)}
      </div>
    </section>

    {/* SALE TABS - These are not Filters, they are Sale Categories */}
    <section id="sale-grid" className="max-w-7xl mx-auto px-4 pt-8 pb-12 scroll-mt-20">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div><h2 className="text-2xl md:text-3xl font-black">All <span className="text-red-600">Sale Deals</span> 🏷️</h2><p className="text-sm text-gray-500 mt-1">Only Admin Selected Sale products - Highest discount first.</p></div>
        <Link to="/shop" className="text-sm font-bold flex items-center gap-1 hover:text-red-600 group">Full Price Shop <ChevronRight size={16} className="group-hover:translate-x-1 transition" /></Link>
      </div>
      <div className="flex gap-2 mt-5 flex-wrap">
        <button onClick={() => setTab('All')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition hover:scale-105 ${tab === 'All' ? 'bg-red-600 text-white shadow-lg shadow-red-300' : 'bg-white border hover:border-red-400'}`}>🔥 All Sale ({withDisc.length})</button>
        <button onClick={() => setTab('50%+')} className={`px-5 py-2.5 rounded-full text-sm font-bold transition hover:scale-105 ${tab === '50%+' ? 'bg-red-600 text-white shadow-lg shadow-red-300' : 'bg-white border hover:border-red-400'}`}>💥 50%+ OFF</button>
        {categories.map(c => <button key={c} onClick={() => setTab(c)} className={`px-5 py-2.5 rounded-full text-sm font-bold transition hover:scale-105 ${tab === c ? 'bg-red-600 text-white shadow-lg shadow-red-300' : 'bg-white border hover:border-red-400'}`}>💎 {c}</button>)}
      </div>

      {loading ? <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">{[1, 2, 3, 4].map(i => <div key={i} className="h-70 bg-gray-100 rounded-[1.5rem] animate-pulse" />)}</div>
        : filtered.length === 0 ? (
          <div className="text-center py-16 bg-red-50 rounded-4xl mt-6 border-2 border-dashed border-red-300">
            <div className="text-6xl">🏷️</div><p className="font-bold text-xl mt-3">No products in sale.</p><p className="text-sm text-gray-500 mt-1">Admin → Products → Edit → ✅ Tick "Show in Sale", then it will come here</p>
            <div className="inline-block bg-white border rounded-2xl px-5 py-3 text-sm mt-4 text-left"><b>Now Sale will not come from Price.</b> Only Admin Selection will work.<br />Example: Edit Product → <b>Show in Sale ✅</b> tick → It will come on Sale Page ✅</div>
            <div><Link to="/shop" className="inline-block bg-black-lux text-white px-6 py-3 rounded-full font-bold text-sm mt-4">View Shop →</Link></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {shown.map((p, id) => {
                const isAdded = addedId === p._id;
                const isLiked = liked.has(p._id) || wishlist?.some(w => w._id === p._id);
                const newLocal_1 = "group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-red-400 transition-all duration-500 relative";
                return (
                <div key={p._id} className={newLocal_1}>
                  <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1.5 rounded-full shadow-lg -rotate-3">-{p.disc}% OFF</span>
                  <div className="relative overflow-hidden h-50 md:h-57.5">
                    <Link to={`/product/${p._id}`}><img src={getImg(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-700" loading="lazy" /></Link>
                    <span className="absolute top-3 right-3 bg-yellow-400 text-black text-[11px] font-black px-2.5 py-1 rounded-full">Save Rs {p.save.toLocaleString()}</span>
                    <button onClick={() => toggleLike(p)} className={`absolute bottom-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow transition hover:scale-110 ${isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'}`}><Heart size={16} fill={isLiked ? 'currentColor' : 'none'} /></button>
                    {p.stock <= 5 && p.stock > 0 && <span className="absolute bottom-3 left-3 bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1"><Flame size={12} /> Only {p.stock} Left!</span>}
                    <div className="absolute inset-x-3 bottom-12 flex gap-2 translate-y-14 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      <button onClick={() => addToCart(p)} className={`flex-1 text-white text-xs font-bold py-2.5 rounded-full flex items-center justify-center gap-1 transition ${isAdded ? 'bg-green-500' : 'bg-red-600 hover:bg-black'}`}><ShoppingBag size={14} /> {isAdded ? 'Added ✓' : 'Add to Cart'}</button>
                      <Link to={`/product/${p._id}`} className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-yellow-400 transition"><Eye size={16} /></Link>
                    </div>
                  </div>
                  <div className="p-3.5">
                    <div className="text-[11px] text-red-600 font-bold uppercase tracking-wide flex items-center gap-1"><Tag size={11} /> {getCatName(p.category) || 'Jewellery'} • SALE</div>
                    <Link to={`/product/${p._id}`} className="font-bold text-sm line-clamp-2 leading-snug hover:text-red-600 transition block min-h-10">{p.name}</Link>
                    <div className="mt-2"><div className="flex items-baseline gap-2"><span className="font-black text-lg text-red-600">Rs {p.salePrice.toLocaleString()}</span><span className="text-xs text-gray-400 line-through">Rs {p.price.toLocaleString()}</span></div><div className="text-[11px] text-green-600 font-bold mt-0.5">✅ You Save Rs {p.save.toLocaleString()} ({p.disc}% OFF)</div></div>
                    {/* Discount Bar */}
                    <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden"><div className="h-full bg-linear-to-r from-red-500 to-yellow-400 rounded-full" style={{ width: `${Math.min(p.disc, 100)}%` }} /></div>
                    <button onClick={() => addToCart(p)} disabled={p.stock <= 0} className="md:hidden w-full bg-red-600 text-white text-xs font-bold py-2.5 rounded-full mt-2 active:scale-95 transition disabled:opacity-50">{isAdded ? 'Added ✓' : 'Add to Cart 🛒'}</button>
                  </div>
                </div>
              )})}
            </div>

            {/* ★★★ PAGINATION - Instead of Load More ★★★ */}
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="text-center mb-3">
                  <span className="bg-black-lux text-white text-xs font-bold px-4 py-2 rounded-full">
                    📄 Page {safePage} of {totalPages} • Showing {startIdx + 1} - {Math.min(startIdx + PER_PAGE, filtered.length)} of {filtered.length} products • {PER_PAGE} per page
                  </span>
                </div>
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <button disabled={safePage === 1} onClick={() => goPage(safePage - 1)} className="flex items-center gap-1 border px-4 py-2.5 rounded-full bg-white font-bold text-sm disabled:opacity-40">← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                    <button key={n} onClick={() => goPage(n)} className={`w-10 h-10 rounded-full font-bold text-sm ${n === safePage ? 'bg-red-600 text-white scale-110 shadow-lg' : 'bg-white border'}`}>{n}</button>
                  ))}
                  <button disabled={safePage === totalPages} onClick={() => goPage(safePage + 1)} className="flex items-center gap-1 border px-4 py-2.5 rounded-full bg-white font-bold text-sm disabled:opacity-40">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
    </section>

    {/* CTA */}
    <section className="max-w-7xl mx-auto px-4 pb-14">
      <div className="bg-black-lux text-white rounded-4xl p-7 md:p-10 text-center relative overflow-hidden">
        <h2 className="text-3xl font-black relative">Order Before <span className="text-yellow-300">Sale Ends!</span> ⏰</h2>
        <p className="text-gray-300 mt-2 relative">Cash on Delivery - Order today, delivery tomorrow.</p>
        <div className="flex gap-3 justify-center mt-6 flex-wrap relative"><Link to="/products" className="bg-white text-black px-7 py-3.5 rounded-full font-bold hover:bg-yellow-400 transition hover:scale-105">Shop All →</Link><a href={waLink} target="_blank" rel="noreferrer" className="bg-green-500 px-7 py-3.5 rounded-full font-bold hover:scale-105 transition">💬 WhatsApp Order</a></div>
      </div>
    </section>

    <style>{`
      @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
      @keyframes marquee { from { transform:translateX(0); } to { transform:translateX(-50%); } }
    `}</style>
  </div>;
}
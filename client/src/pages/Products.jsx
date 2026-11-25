import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Search, SlidersHorizontal, X, Eye } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import { useCart } from '../context/CartContext.jsx';

const PER_PAGE = 6;
const MATERIALS = ['Gold', 'Silver', 'Diamond', 'Artificial', 'Platinum'];

// ★★★ PRODUCT CARD - Hover + Click pe Details ★★★
function Card({ p }) {
  const { add, toggleWish, wishlist } = useCart();
  const nav = useNavigate();
  const price = p.salePrice > 0 ? p.salePrice : p.price;
  const off = p.salePrice > 0 && p.price > 0 ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  const wished = wishlist.some(w => w._id === p._id);
  const img = p.images?.[0]?.url || p.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400';

  return (
    <div className="border rounded-3xl overflow-hidden bg-white group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] hover:border-gold transition-all duration-300 animate-[fadeInUp_0.4s_ease]">
      {/* Click pe Details - poora image clickable */}
      <div onClick={() => nav(`/product/${p._id}`)} className="block relative overflow-hidden cursor-pointer">
        <img src={img} alt={p.name} className="w-full h-56 md:h-60 object-cover group-hover:scale-110 transition duration-500" loading="lazy" />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {off > 0 && <span className="bg-red-600 text-white text-xs px-2.5 py-1 rounded-full font-bold shadow">-{off}% OFF</span>}
          {p.isNewArrival && <span className="bg-gold text-black text-xs px-2.5 py-1 rounded-full font-bold">🆕 NEW</span>}
        </div>
        {p.isBestSeller && <span className="absolute top-2 right-2 bg-black text-gold text-xs px-2.5 py-1 rounded-full font-bold">🏆 BEST SELLER</span>}
        {/* Hover Overlay */}
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition duration-300">
          <span className="block bg-white text-black text-center py-2 rounded-full text-xs font-bold items-center justify-center gap-1"><Eye size={14} /> View Details →</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleWish(p); }} className={`absolute bottom-12 right-2 p-2.5 rounded-full shadow-lg transition-all duration-300 ${wished ? 'bg-red-500 text-white' : 'bg-white text-gray-700 opacity-0 group-hover:opacity-100 hover:text-red-500'}`}><Heart size={18} className={wished ? 'fill-white' : ''} /></button>
      </div>
      <div className="p-3.5">
        <div className="text-[11px] text-[#B8962E] font-bold tracking-wide uppercase">{p.category?.name || (typeof p.category === 'string' ? p.category : 'Jewellery')} • {p.material || ''}</div>
        <div onClick={() => nav(`/product/${p._id}`)} className="font-semibold line-clamp-1 hover:text-[#B8962E] transition cursor-pointer mt-0.5">{p.name}</div>
        <div className="flex items-center gap-1 text-sm mt-1"><Star size={14} className="fill-yellow-400 text-yellow-400" /><span className="font-semibold">{p.rating || 0}</span><span className="text-gray-400">({p.numReviews || 0})</span><span className={`ml-auto text-[11px] px-2 py-0.5 rounded-full ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.stock > 0 ? `In Stock (${p.stock})` : 'Out of Stock'}</span></div>
        <div className="flex items-center gap-2 mt-1.5"><span className="font-bold text-lg">Rs. {price?.toLocaleString()}</span>{off > 0 && <span className="line-through text-sm text-gray-400">Rs. {p.price?.toLocaleString()}</span>}</div>
        <div className="flex gap-2 mt-3">
          <button onClick={() => add(p)} disabled={p.stock <= 0} className="flex-1 bg-black-lux hover:bg-gold hover:text-black text-white py-2.5 rounded-full text-sm flex items-center justify-center gap-1.5 font-semibold transition-all duration-300 active:scale-95 disabled:opacity-40"><ShoppingCart size={16} /> Add</button>
          <button onClick={() => nav(`/product/${p._id}`)} className="px-4 border rounded-full text-sm font-semibold hover:bg-cream hover:border-gold transition">Details</button>
        </div>
      </div>
    </div>
  );
}

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [all, setAll] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filters - URL + Local dono sync
  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const [localSearch, setLocalSearch] = useState(search);
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [material, setMaterial] = useState('');
  const [sort, setSort] = useState(params.get('sort') || 'featured');
  const [minRating, setMinRating] = useState(0);
  const [onlySale, setOnlySale] = useState(false);
  const [onlyStock, setOnlyStock] = useState(false);
  const [page, setPage] = useState(Number(params.get('page')) || 1);

  // LOCK: Page change pe upar scroll
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  // LOCK: URL se search aaye to local bhi update
  useEffect(() => { setLocalSearch(search); setPage(1); }, [search]);

  // ★★★ FIXED: URL se category / sort aaye to sync karo ★★★
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setPage(1); }, [category]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { const s = params.get('sort'); if (s) setSort(s); }, [params]);

  // ★★★ BACKEND SE DATA - Admin jo product banayega wo yahan aayega ★★★
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [pr, ct] = await Promise.all([productAPI.list({ limit: 500 }), categoryAPI.list()]);
        const prods = Array.isArray(pr.data) ? pr.data : pr.data.products || [];
        // LOCK: Sirf Published products - Admin ne Published off kiya to yahan nahi dikhega
        setAll(prods.filter(p => p.isPublished !== false));
        setCats(Array.isArray(ct.data) ? ct.data : ct.data.categories || []);
      } catch { setAll([]); }
      setLoading(false);
    })();
  }, []);

  const resetFilters = () => { setMin(''); setMax(''); setMaterial(''); setSort('featured'); setMinRating(0); setOnlySale(false); setOnlyStock(false); setLocalSearch(''); setParams({}); setPage(1); };

  // ★★★ FIXED FILTERED + SORTED - Category + Search + Price + Material + Rating + Sale + Stock ★★★
  const filtered = useMemo(() => {
    let list = all.filter(p => {
      const price = p.salePrice > 0 ? p.salePrice : p.price;

      // ★★★ CATEGORY - slug OR name dono se match karo (ring = Rings) ★★★
      if (category) {
        const q = category.toLowerCase().trim();
        const cName = (typeof p.category === 'string' ? p.category : p.category?.name || '').toLowerCase();
        const cSlug = (typeof p.category === 'string' ? p.category : p.category?.slug || '').toLowerCase();
        // Category list se bhi slug dhoondo - jaise Home se 'ring' aaye to 'Rings' se match ho
        const matchedCat = cats.find(c => c.slug?.toLowerCase() === q || c.name?.toLowerCase() === q);
        const matchedName = matchedCat ? matchedCat.name.toLowerCase() : q;
        const matchedSlug = matchedCat ? (matchedCat.slug || '').toLowerCase() : q;
        if (cName !== q && cSlug !== q && cName !== matchedName && cSlug !== matchedSlug) return false;
      }

      // ★★★ SEARCH - Name + Category + SKU + Material sab me dhoondo ★★★
      const effectiveSearch = (localSearch || search).trim();
      if (effectiveSearch) {
        const q = effectiveSearch.toLowerCase();
        const hay = [p.name, p.description, p.shortDescription, p.sku, p.material, p.category?.name || p.category].join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (min && price < Number(min)) return false;
      if (max && price > Number(max)) return false;
      if (material && (p.material || '') !== material) return false;
      if (minRating && (p.rating || 0) < minRating) return false;
      if (onlySale && !(p.salePrice > 0 && p.salePrice < p.price)) return false;
      if (onlyStock && (p.stock || 0) <= 0) return false;
      return true;
    });
    if (sort === 'low') list = [...list].sort((a, b) => (a.salePrice > 0 ? a.salePrice : a.price) - (b.salePrice > 0 ? b.salePrice : b.price));
    if (sort === 'high') list = [...list].sort((a, b) => (b.salePrice > 0 ? b.salePrice : b.price) - (a.salePrice > 0 ? a.salePrice : a.price));
    if (sort === 'new') list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === 'featured' || sort === 'newset' || !sort) list = [...list].sort((a, b) => {
      const fa = (a.isBestSeller ? 2 : 0) + (a.isNewArrival || a.isNew ? 1 : 0);
      const fb = (b.isBestSeller ? 2 : 0) + (b.isNewArrival || b.isNew ? 1 : 0);
      if (fb !== fa) return fb - fa;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return list;
  }, [all, cats, category, min, max, material, minRating, onlySale, onlyStock, sort, localSearch, search]);

  // ★★★ PAGINATION - 6 per page ★★★
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  const goPage = (n) => { const p = Math.max(1, Math.min(totalPages, n)); setPage(p); setParams(prev => { const o = Object.fromEntries(prev.entries()); if (p === 1) delete o.page; else o.page = String(p); return o; }); };

  // ★★★ FIXED: Category ko slug se save karo taake har jagah match ho ★★★
  const setCategory = (c) => {
    setParams(prev => {
      const o = Object.fromEntries(prev.entries());
      if (!c) delete o.category;
      else {
        const found = cats.find(x => x.name === c);
        o.category = found?.slug || c;
      }
      delete o.page; return o;
    }); setPage(1);
  };
  const activeCount = [min, max, material, minRating ? 'r' : '', onlySale ? 's' : '', onlyStock ? 'st' : '', category, search].filter(Boolean).length;

  // ★★★ FIXED: Title me slug ki jagah asli Category Name dikhao ★★★
  const catDisplayName = cats.find(c => c.slug === category || c.name === category)?.name || category;
  const title = catDisplayName || (search ? `Results for "${search}"` : 'All Jewellery');

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* HEADER */}
      <div className="flex flex-wrap justify-between items-end gap-3">
        <div><h1 className="text-3xl md:text-4xl font-bold">{title}</h1><p className="text-sm text-gray-500 mt-1">{filtered.length} products found {category && `in ${catDisplayName}`} • Page {safePage} of {totalPages}</p></div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 border px-4 py-2.5 rounded-full text-sm font-semibold"><SlidersHorizontal size={16} /> Filters {activeCount > 0 && <span className="bg-gold w-5 h-5 rounded-full flex items-center justify-center text-xs">{activeCount}</span>}</button>
          <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); setParams(prev => { const o = Object.fromEntries(prev.entries()); o.sort = e.target.value; return o; }); }} className="border rounded-full px-4 py-2.5 text-sm bg-white outline-none focus:border-gold"><option value="featured">Sort: Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="new">Newest First</option><option value="rating">Top Rated</option></select>
        </div>
      </div>

      {/* SEARCH BAR */}
      <form className="flex mt-5 shadow-sm rounded-full overflow-hidden border bg-white focus-within:border-gold transition" onSubmit={e => { e.preventDefault(); setParams(prev => { const o = Object.fromEntries(prev.entries()); if (!localSearch.trim()) delete o.search; else o.search = localSearch.trim(); delete o.page; return o; }); setPage(1); }}>
        <span className="pl-4 flex items-center text-gray-400"><Search size={18} /></span>
        <input value={localSearch} onChange={e => setLocalSearch(e.target.value)} placeholder="Search rings, earrings, gold, diamond..." className="flex-1 px-3 py-3 outline-none text-sm min-w-0" />
        {localSearch && <button type="button" onClick={() => { setLocalSearch(''); setParams(prev => { const o = Object.fromEntries(prev.entries()); delete o.search; return o; }); }} className="px-2 text-gray-400"><X size={18} /></button>}
        <button className="bg-black-lux hover:bg-gold hover:text-black text-white px-6 text-sm font-bold transition">Search</button>
      </form>

      {/* ★★★ ACTIVE FILTERS - Pyara sa badge ★★★ */}
      {(category || material || min || max || onlySale || onlyStock || minRating > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {category && <span className="bg-black-lux text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">💎 {catDisplayName} <button onClick={() => setCategory('')}>✕</button></span>}
          {material && <span className="bg-gold text-black text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">{material} <button onClick={() => setMaterial('')}>✕</button></span>}
          {(min || max) && <span className="bg-gray-100 text-xs font-bold px-3 py-1.5 rounded-full">Rs. {min || '0'} - {max || '∞'} <button onClick={() => { setMin(''); setMax(''); }} className="ml-1">✕</button></span>}
          {onlySale && <span className="bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-full">🔥 Sale Only <button onClick={() => setOnlySale(false)} className="ml-1">✕</button></span>}
          {onlyStock && <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full">✅ In Stock <button onClick={() => setOnlyStock(false)} className="ml-1">✕</button></span>}
          {minRating > 0 && <span className="bg-yellow-100 text-xs font-bold px-3 py-1.5 rounded-full">{minRating}⭐+ <button onClick={() => setMinRating(0)} className="ml-1">✕</button></span>}
          <button onClick={resetFilters} className="text-xs font-bold text-red-600 underline">Clear All</button>
        </div>
      )}

      <div className="flex gap-6 mt-6 items-start">
        {/* ★★★ SIDEBAR FILTERS - Desktop ★★★ */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-32">
          <div className="border rounded-3xl p-5 bg-white shadow-sm">
            <div className="flex justify-between items-center"><h3 className="font-bold">Filters</h3>{activeCount > 0 && <button onClick={resetFilters} className="text-xs text-red-600 font-bold">Clear All ({activeCount})</button>}</div>
            <div className="mt-4"><div className="font-semibold text-sm mb-2">Category</div>
            <div className="space-y-1 max-h-44 overflow-y-auto">{[{ name: '' }, ...cats].map(c => {
              const isActive = (c.name && (category === c.name || category === c.slug)) || (!category && !c.name);
              return <button key={c.name || 'all'} onClick={() => setCategory(c.name)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${isActive ? 'bg-black-lux text-white font-bold' : 'hover:bg-cream'}`}>
                {c.name || 'All Categories'}</button>
            })}</div></div>
            <div className="mt-4"><div className="font-semibold text-sm mb-2">Material</div><div className="flex flex-wrap gap-1.5">{['', ...MATERIALS].map(m => <button key={m || 'all'} onClick={() => setMaterial(m)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${material === m ? 'bg-gold text-black font-bold' : 'bg-gray-100 hover:bg-gray-200'}`}>{m || 'All'}</button>)}</div></div>
            <div className="mt-4"><div className="font-semibold text-sm mb-2">Price Range (Rs.)</div><div className="flex gap-2"><input type="number" placeholder="Min" value={min} onChange={e => setMin(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" /><input type="number" placeholder="Max" value={max} onChange={e => setMax(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-sm" /></div></div>
            <div className="mt-4"><div className="font-semibold text-sm mb-2">Rating</div><div className="flex gap-1.5">{[0, 3, 4, 5].map(r => <button key={r} onClick={() => setMinRating(r)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${minRating === r ? 'bg-black-lux text-white' : 'bg-gray-100'}`}>{r === 0 ? 'All' : `${r}⭐+`}</button>)}</div></div>
            <div className="mt-4 space-y-2 text-sm"><label className="flex gap-2 items-center cursor-pointer"><input type="checkbox" checked={onlySale} onChange={e => setOnlySale(e.target.checked)} className="accent-gold w-4 h-4" /> Only Sale Items 🔥</label><label className="flex gap-2 items-center cursor-pointer"><input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} className="accent-gold w-4 h-4" /> In Stock Only ✅</label></div>
          </div>
        </aside>

        {/* MOBILE FILTERS */}
        {showFilters && (
          <div className="fixed inset-0 z-60 bg-black/50 lg:hidden" onClick={() => setShowFilters(false)}>
            <div className="bg-white h-full w-[85%] max-w-sm p-5 overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between"><h3 className="font-bold text-lg">Filters</h3><button onClick={() => setShowFilters(false)}><X /></button></div>
              <div className="mt-4"><div className="font-semibold text-sm mb-2">Category</div><div className="flex flex-wrap gap-2">{[{ name: '' }, ...cats].map(c => <button key={c.name || 'all'} onClick={() => { setCategory(c.name); setShowFilters(false); }} className={`px-3 py-2 rounded-full text-xs ${category === c.name || category === c.slug ? 'bg-black text-white' : 'bg-gray-100'}`}>{c.name || 'All'}</button>)}</div></div>
              <div className="mt-4"><div className="font-semibold text-sm mb-2">Material</div><div className="flex flex-wrap gap-2">{MATERIALS.map(m => <button key={m} onClick={() => setMaterial(m)} className={`px-3 py-2 rounded-full text-xs ${material === m ? 'bg-gold' : 'bg-gray-100'}`}>{m}</button>)}</div></div>
              <div className="mt-4 flex gap-2"><input type="number" placeholder="Min Rs" value={min} onChange={e => setMin(e.target.value)} className="w-full border rounded-xl px-3 py-2" /><input type="number" placeholder="Max Rs" value={max} onChange={e => setMax(e.target.value)} className="w-full border rounded-xl px-3 py-2" /></div>
              <div className="mt-4 flex gap-2"><label className="flex gap-2 text-sm"><input type="checkbox" checked={onlySale} onChange={e => setOnlySale(e.target.checked)} /> Sale Only</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={onlyStock} onChange={e => setOnlyStock(e.target.checked)} /> In Stock</label></div>
              <button onClick={() => { resetFilters(); setShowFilters(false); }} className="w-full mt-5 border py-2.5 rounded-full text-sm">Clear All Filters</button>
              <button onClick={() => setShowFilters(false)} className="w-full mt-2 bg-black text-white py-2.5 rounded-full text-sm">Show {filtered.length} Products</button>
            </div>
          </div>
        )}

        {/* PRODUCTS GRID + PAGINATION */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="border rounded-3xl overflow-hidden animate-pulse"><div className="h-56 bg-gray-200" /><div className="p-3 space-y-2"><div className="h-4 bg-gray-200 rounded" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div></div>)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border rounded-3xl bg-white"><div className="text-6xl">🔍</div><h2 className="text-xl font-bold mt-3">No products found</h2><p className="text-gray-500 text-sm mt-1">Try changing filters or search with a different keyword.</p><button onClick={resetFilters} className="mt-4 bg-black-lux text-white px-6 py-2.5 rounded-full text-sm">Clear All Filters</button></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{paged.map(p => <Card key={p._id} p={p} />)}</div>
              {/* ★★★ PAGINATION ★★★ */}
              <div className="mt-8">
  <div className="text-center mb-3">
    <span className="bg-black-lux text-white text-xs font-bold px-4 py-2 rounded-full">
      📄 Page {safePage} of {totalPages} • Showing {(safePage - 1) * PER_PAGE + 1} - {Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} products • {PER_PAGE} per page
    </span>
  </div>
  <div className="flex justify-center items-center gap-2 flex-wrap">
    <button disabled={safePage === 1} onClick={() => goPage(safePage - 1)} className="flex items-center gap-1 border px-4 py-2.5 rounded-full bg-white font-bold text-sm disabled:opacity-40">← Prev</button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
      <button key={n} onClick={() => goPage(n)} className={`w-10 h-10 rounded-full font-bold text-sm ${n === safePage ? 'bg-black-lux text-white scale-110 shadow-lg' : 'bg-white border'}`}>{n}</button>
    ))}
    <button disabled={safePage === totalPages} onClick={() => goPage(safePage + 1)} className="flex items-center gap-1 border px-4 py-2.5 rounded-full bg-white font-bold text-sm disabled:opacity-40">Next →</button>
  </div>
  <p className="text-center text-xs text-gray-400 mt-3">One page has <b>{PER_PAGE} products</b> • Total <b>{filtered.length}</b> products • Total Pages <b>{totalPages}</b></p>
</div>
              <p className="text-center text-xs text-gray-400 mt-4">Showing {(safePage - 1) * PER_PAGE + 1} - {Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length} products</p>
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes fadeInUp { from { opacity:0; transform: translateY(15px);} to { opacity:1; transform: translateY(0);} }`}</style>
    </div>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { productAPI, categoryAPI } from '../../services/api';
import { Link } from 'react-router-dom';

// ★★★ BACKEND LOCK - Backend Product Model ko yehi chahiye ★★★
// images: [{ url, alt }] - string nahi | image: images[0].url | salePrice default = price | sku auto | category: ObjectId ya name
const EMPTY = { name: '', price: '', salePrice: '', stock: 10, category: '', description: '', shortDescription: '', material: 'Gold', images: [], image: '', sku: '', sizes: '', isActive: true, isFeatured: false, isNew: false, isOnSale: false };

const getCatName = (c) => { if (!c) return ''; if (typeof c === 'string') return c; return c.name || c.title || c.slug || ''; };
const getCatId = (c) => { if (!c) return ''; if (typeof c === 'string') return c; return c._id || c.name || ''; };
const getImg = (p) => {
  const raw = p?.images?.[0] || p?.image || '';
  if (!raw) return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400';
  if (typeof raw === 'string') return raw;
  return raw.url || raw.src || raw.secure_url || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400';
};
const toImgStrings = (p) => {
  const arr = Array.isArray(p?.images) && p.images.length > 0 ? p.images : (p?.image ? [p.image] : []);
  return arr.map(img => typeof img === 'string' ? img : (img?.url || img?.src || '')).filter(Boolean);
};

export default function Products() {
  const [list, setList] = useState([]);
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [compressing, setCompressing] = useState(false);

  const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "talha_shop");
  const res = await fetch("https://api.cloudinary.com/v1_1/jnvfqhbw/image/upload",
    { method: "POST", body: formData });
  const data = await res.json();
  return data.secure_url;
};

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([productAPI.list({ limit: 200 }), categoryAPI.list(true)]);
      const plist = Array.isArray(p.data) ? p.data : (p.data?.products || p.data?.data || []);
      setList(Array.isArray(plist) ? plist : []);
      const clist = Array.isArray(c.data) ? c.data : (c.data?.categories || c.data?.data || []);
      setCats(Array.isArray(clist) ? clist : []);
    } catch (e) { setMsg('❌ Load failed: ' + (e.response?.data?.message || e.message)); }
    setLoading(false);
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ★★★ SIRF YE ADD KIYA HAI - NO CLOUDINARY - Bina Cloudinary Ke Fast ★★★
  // 5 MB ki photo ko 80-100 KB ka kar dega, quality waisi hi rahegi
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 800;
          let w = img.width, h = img.height;
          if (w > MAX) { h = (h * MAX) / w; w = MAX; }
          if (h > MAX) { w = (w * MAX) / h; h = MAX; }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const pickImages = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  setCompressing(true);
  setMsg('⏳ Photo Cloudinary pe Upload ho rahi hai...');
  for (const file of files) {
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setForm(prev => ({ ...prev, images: [...(prev.images || []), url].slice(0, 5) }));
      }
    } catch (err) {
      setMsg('❌ Photo Upload Failed: ' + err.message);
    }
  }
  setCompressing(false);
  setMsg('✅ Photo Uploaded on Cloudinary!');
  e.target.value = '';
};
  const removeImg = (i) => setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
  const makeMain = (i) => { const n = [...form.images]; const [p] = n.splice(i, 1); n.unshift(p); setForm(prev => ({ ...prev, images: n })); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name?.trim() || !form.price) { setMsg('❌ Product Name + Price zaroori hai'); return; }
    if (!form.images?.length && !form.image) { setMsg('❌ Pick Atleast One Photo from gallary'); return; }
    // ★★★ SALE CHECK: Sale pe dikhana hai to Sale Price Price se kam hona chahiye ★★★
    if (form.isOnSale && Number(form.salePrice || form.price) >= Number(form.price)) { setMsg('❌ Sale ke liye Sale Price, Price se KAM likho. Example: Price 2500 → Sale Price 1500'); return; }
    setSaving(true); setMsg('');
    const cleanImages = (form.images?.length > 0 ? form.images : (form.image ? [form.image] : []))
      .map(img => { const url = typeof img === 'string' ? img : (img?.url || img?.src || ''); return url ? { url, alt: form.name || 'Product' } : null; })
      .filter(Boolean);
    const payload = {
      ...form,
      name: form.name.trim(),
      price: Number(form.price),
      salePrice: Number(form.salePrice || form.price),
      stock: Number(form.stock || 0),
      category: form.category,
      images: cleanImages,
      image: cleanImages[0]?.url || '',
      sku: form.sku?.trim() || `SKU-${Date.now()}`,
      sizes: typeof form.sizes === 'string' ? form.sizes.split(',').map(s => s.trim()).filter(Boolean) : form.sizes,
      // ★★★ SALE FLAGS - Sale Page isi se chalega ★★★
      isOnSale: !!form.isOnSale,
      isSale: !!form.isOnSale,
      showInSale: !!form.isOnSale,
    };
    delete payload._id; delete payload.createdAt; delete payload.updatedAt;
    try {
      if (editId) await productAPI.update(editId, payload);
      else await productAPI.create(payload);
      setForm(EMPTY); setEditId(null); setShow(false); setSelected(new Set());
      setMsg('✅ Product Save ho gaya! Home + Shop + About pe turant Live hai.');
      await load(); window.scrollTo(0, 0);
    } catch (er) { setMsg('❌ Save failed: ' + (er.response?.data?.message || er.message)); }
    setSaving(false);
  };

  const startEdit = (p) => {
    setForm({
      ...EMPTY, ...p,
      price: p.price ?? '', salePrice: p.salePrice ?? '',
      category: getCatId(p.category),
      images: toImgStrings(p), image: getImg(p) === 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400' ? '' : getImg(p),
      sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : (p.sizes || ''),
      isActive: p.isActive !== false, isFeatured: !!p.isFeatured, isNew: !!p.isNew,
      // ★★★ SALE - Purane products me koi bhi ek field tick ho to checkbox ON dikhega ★★★
      isOnSale: !!(p.isOnSale || p.isSale || p.showInSale || p.showOnSalePage || p.isSaleSelected || p.saleSelected),
    });
    setEditId(p._id); setShow(true); setMsg(''); window.scrollTo(0, 0);
  };

  const duplicate = (p) => {
    setForm({ ...EMPTY, ...p, name: p.name + ' - Copy', sku: '', images: toImgStrings(p), category: getCatId(p.category), sizes: Array.isArray(p.sizes) ? p.sizes.join(', ') : '', isOnSale: !!(p.isOnSale || p.isSale || p.showInSale) });
    setEditId(null); setShow(true); setMsg('📋 Copy ban gayi - Name badal ke Save karo'); window.scrollTo(0, 0);
  };

  const del = async (id, name) => {
  if (!confirm(`"${name}" Want to delete? Will Remove from Website.`)) return;
  try { 
    await productAPI.remove(id); 
    setMsg('🗑️ Deleted'); 
    await load(); 
  } catch (e) { 
    setMsg('❌ Delete failed: ' + (e.response?.data?.message || e.message)); 
  }
};

  const toggleField = async (p, field) => {
    try {
      const extra = field === 'isOnSale' ? { isSale: !p.isOnSale, showInSale: !p.isOnSale } : {};
      await productAPI.update(p._id, { ...p, [field]: !p[field], ...extra, images: Array.isArray(p.images) ? p.images : (p.image ? [{ url: p.image, alt: p.name }] : []) }); await load();
    } catch { setMsg('❌ Update failed'); }
  };

  // ★★★ FIXED BULK DELETE - Set ko Array me badal ke bhejo ★★★
    const bulkDelete = async () => {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    if (!window.confirm(`${ids.length} would you want to Delete products?`)) return;
    try {
      await productAPI.bulkDelete(ids);
      setSelected(new Set());
      setMsg(`🗑️ ${ids.length} products deleted`);
      await load();
    } catch (err) {
      setMsg('❌ Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const toggleSelect = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filtered = useMemo(() => {
    let arr = list.filter(p => {
      const okSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
      const okCat = filterCat === 'All' || getCatName(p.category) === filterCat || getCatId(p.category) === filterCat;
      const okStatus = filterStatus === 'All' ? true : filterStatus === 'Live' ? p.isActive !== false : filterStatus === 'Hidden' ? p.isActive === false : filterStatus === 'LowStock' ? (p.stock ?? 0) <= 5 : filterStatus === 'Featured' ? p.isFeatured : filterStatus === 'Sale' ? !!(p.isOnSale || p.isSale || p.showInSale) : true;
      return okSearch && okCat && okStatus;
    });
    if (sortBy === 'Price Low') arr = [...arr].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    if (sortBy === 'Price High') arr = [...arr].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    if (sortBy === 'Name') arr = [...arr].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'Stock Low') arr = [...arr].sort((a, b) => (a.stock || 0) - (b.stock || 0));
    return arr;
  }, [list, search, filterCat, filterStatus, sortBy]);

  const catNames = ['All', ...new Set([...cats.map(c => getCatName(c)), ...list.map(p => getCatName(p.category))].filter(Boolean))];
  const liveCount = list.filter(p => p.isActive !== false).length;
  const lowCount = list.filter(p => (p.stock ?? 0) <= 5).length;
  const saleCount = list.filter(p => p.isOnSale || p.isSale || p.showInSale).length;
  const inp = "border rounded-xl px-3 py-2.5 w-full outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 text-sm bg-white";
  const label = "text-xs font-bold text-gray-500 uppercase tracking-wide";

  return <div>
    <div className="flex justify-between items-center flex-wrap gap-3">
      <div><h1 className="text-2xl font-bold">Products <span className="text-gold">({list.length})</span></h1><p className="text-sm text-gray-500">Yahan add karo -Lived on About + Home+Shop</p></div>
      <div className="flex gap-2 flex-wrap">
        {selected.size > 0 && <button onClick={bulkDelete} className="bg-red-500 text-white px-4 py-2.5 rounded-full font-bold text-sm hover:bg-red-600">🗑️ Delete ({selected.size})</button>}
        <Link to="/shop" target="_blank" className="bg-white border px-4 py-2.5 rounded-full font-bold text-sm hover:border-gold">👀 See on Website</Link>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShow(!show); }} className="bg-black-lux hover:bg-gold hover:text-black text-white px-5 py-2.5 rounded-full font-bold text-sm transition hover:scale-105 active:scale-95">{show ? '✕ Close' : '➕ + Add Product'}</button>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-3 mt-4">
      {[['📦 Total', list.length, 'bg-white'], ['✅ Live on Website', liveCount, 'bg-green-50 border-green-200'], ['⚠️ Low Stock', lowCount, 'bg-orange-50 border-orange-200'], ['🔥 On Sale', saleCount, 'bg-red-50 border-red-200']].map(([t, n, cls]) => <div key={t} className={`border rounded-2xl p-3 text-center ${cls}`}><div className="font-bold text-xl">{n}</div><div className="text-[11px] text-gray-500 font-semibold">{t}</div></div>)}
    </div>

    {msg && <div className={`p-3 rounded-xl mt-4 text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : msg.startsWith('❌') ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>{msg}</div>}

    <div className="flex gap-2 mt-4 flex-wrap items-center">
      <input placeholder="🔍 Search by Name / SKU..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 min-w-45 border rounded-full px-4 py-2.5 outline-none focus:border-gold text-sm bg-white" />
      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border rounded-full px-3 py-2.5 text-sm bg-white outline-none"><option value="All">All Status</option><option value="Live">✅ Live</option><option value="Hidden">🙈 Hidden</option><option value="LowStock">⚠️ Low Stock</option><option value="Featured">⭐ Featured</option><option value="Sale">🔥 On Sale</option></select>
      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="border rounded-full px-3 py-2.5 text-sm bg-white outline-none"><option>Newest</option><option>Price Low</option><option>Price High</option><option>Name</option><option>Stock Low</option></select>
      <label className="flex items-center gap-1.5 text-xs font-bold bg-white border px-3 py-2.5 rounded-full cursor-pointer"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={() => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(p => p._id)))} /> Select All</label>
    </div>
    <div className="flex gap-1.5 mt-3 flex-wrap">{catNames.slice(0, 8).map(c => <button key={c} onClick={() => setFilterCat(c)} className={`px-4 py-2 rounded-full text-xs font-bold transition hover:scale-105 ${filterCat === c ? 'bg-black-lux text-white' : 'bg-white border hover:border-gold'}`}>{c}</button>)}</div>

    {show && (
      <form onSubmit={save} className="bg-white rounded-3xl p-5 mt-4 grid md:grid-cols-2 gap-4 shadow-xl border-2 border-gold/20 animate-[fadeUp_0.4s_ease]">
        <div className="md:col-span-2 flex items-center gap-2"><span className="text-2xl">{editId ? '✏️' : '✨'}</span><h2 className="font-bold text-lg">{editId ? 'Edit Product' : 'New Product'}</h2>{editId && <button type="button" onClick={() => { setForm(EMPTY); setEditId(null); }} className="ml-auto text-xs bg-gray-100 px-3 py-1.5 rounded-full">Clear → New</button>}</div>
        <div><label className={label}>Product Name *</label><input required placeholder="Bridal Gold Necklace Set" value={form.name} onChange={e => set('name', e.target.value)} className={inp} /></div>
        <div><label className={label}>Category *</label><select required value={form.category} onChange={e => set('category', e.target.value)} className={inp}><option value="">-- Chose Category --</option>{cats.map(c => <option key={c._id || c.name} value={c._id || c.name}>{getCatName(c)}</option>)}{cats.length === 0 && <option value="Earrings">Earrings</option>}<option value="Bridal Set">Bridal Set</option><option value="Necklace">Necklace</option><option value="Rings">Rings</option><option value="Bangles">Bangles</option></select></div>
        <div><label className={label}>Price (Rs) * - Customer can see</label><input required type="number" min="0" placeholder="2500" value={form.price} onChange={e => set('price', e.target.value)} className={inp} /></div>
        <div><label className={label}>Sale Price (Rs) - Khali = Price</label><input type="number" min="0" placeholder="Khali chhoro to Price hi lagega" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} className={inp} /></div>
        <div><label className={label}>Stock</label><input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} className={inp} /></div>
        <div><label className={label}>SKU - Empty = Auto</label><input placeholder="Auto" value={form.sku} onChange={e => set('sku', e.target.value)} className={inp} /></div>
        <div><label className={label}>Material</label><select value={form.material} onChange={e => set('material', e.target.value)} className={inp}><option>Gold</option><option>Silver</option><option>Kundan</option><option>Pearl</option><option>Artificial</option><option>Crystal</option></select></div>
        <div><label className={label}>Sizes - Comma se - 6, 7, 8</label><input placeholder="6, 7, 8" value={form.sizes} onChange={e => set('sizes', e.target.value)} className={inp} /></div>
        <div className="md:col-span-2"><label className={label}>Short Description - Shop pe dikhega</label><input placeholder="Elegant bridal set with kundan work..." value={form.shortDescription} onChange={e => set('shortDescription', e.target.value)} className={inp} /></div>
        <div className="md:col-span-2"><label className={label}>Full Description</label><textarea placeholder="Material, design, care..." value={form.description} onChange={e => set('description', e.target.value)} className={inp} rows={3} /></div>
        <div className="md:col-span-2 border-2 border-dashed border-pink-300 rounded-2xl p-4 bg-[#FFF5F8]">
          <label className={label}>📸 Product Photos - Gallery se (Max 5) *</label>
          <input id="productGalleryInput" type="file" accept="image/*" multiple className="hidden" onChange={pickImages} />
          <label htmlFor="productGalleryInput" className="block text-center bg-black-lux text-white py-3.5 rounded-2xl font-bold cursor-pointer hover:bg-pink-500 transition mt-2 text-sm">{compressing ? '⏳ Photo Generating...' : '🖼️ + Pich Image from Gallary'}</label>
          <p className="text-center text-[11px] text-gray-400 mt-1">Mobile pe Gallery / Camera khulega • Pehli photo ⭐ MAIN - Home + Shop pe wahi dikhegi</p>
          {form.images?.length > 0 ? (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img src={typeof img === 'string' ? img : img?.url} alt="" className="w-full h-20 object-cover rounded-xl border-2 border-white shadow" />
                  {i === 0 && <span className="absolute -top-2 left-1 bg-gold text-[9px] font-bold px-1.5 py-0.5 rounded-full">⭐ MAIN</span>}
                  <button type="button" onClick={() => removeImg(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]">✕</button>
                  {i !== 0 && <button type="button" onClick={() => makeMain(i)} className="absolute bottom-1 left-1 bg-white text-[9px] px-1.5 py-0.5 rounded-full font-bold shadow opacity-0 group-hover:opacity-100 transition">⭐ Main Banao</button>}
                </div>
              ))}
            </div>
          ) : <p className="text-center text-xs text-gray-400 bg-white p-3 rounded-xl mt-2">No any Photo - Pick Photo From Gallary</p>}
        </div>
        <div className="md:col-span-2 flex gap-2 flex-wrap">
          <label className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer hover:bg-green-50"><input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} /> ✅ Website pe Show karo</label>
          <label className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer hover:bg-yellow-50"><input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} /> ⭐ Featured - Home pe dikhao</label>
          <label className="flex items-center gap-2 bg-gray-50 px-4 py-2.5 rounded-full text-sm font-semibold cursor-pointer hover:bg-pink-50"><input type="checkbox" checked={form.isNew} onChange={e => set('isNew', e.target.checked)} /> ✨ New Arrival</label>
          <label className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold cursor-pointer border-2 transition ${form.isOnSale ? 'bg-red-500 text-white border-red-600 shadow-lg' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'}`}><input type="checkbox" checked={form.isOnSale} onChange={e => set('isOnSale', e.target.checked)} className="w-4 h-4 accent-red-600" /> 🔥 Show in Sale - Sale Page pe dikhao</label>
        </div>
        {form.isOnSale && (
          <div className="md:col-span-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
            🔥 <b>Will Show on sale!</b> Yaad rakho: <b>Sale Price, Price se KAM</b> hona chahiye. Now: Price Rs {form.price || 0} → Sale Price Rs {form.salePrice || form.price || 0} {Number(form.salePrice || form.price) < Number(form.price) ? `= -${Math.round((1 - Number(form.salePrice) / Number(form.price)) * 100)}% OFF ✅` : '= Sale nahi lagegi ❌'}
          </div>
        )}
        <button disabled={saving || compressing} className="md:col-span-2 bg-gold hover:bg-black-lux hover:text-white py-3.5 rounded-full font-bold transition hover:scale-[1.01] active:scale-95 disabled:opacity-60">{saving ? '⏳ Saving...' : compressing ? '⏳ Photo Compress Ho Rahi Hai...' : editId ? '💾 Update Product - Website Turant Update Hogi' : '➕ Add Product - Website pe Live Hoga'}</button>
      </form>
    )}

    {loading ? <div className="text-center py-14">⏳ Loading products...</div> : (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {filtered.map(p => {
          const price = Number(p.salePrice || p.price || 0);
          const old = Number(p.price || 0);
          const disc = old > price ? Math.round((1 - price / old) * 100) : 0;
          const isSale = !!(p.isOnSale || p.isSale || p.showInSale);
          return (
            <div key={p._id} className={`group bg-white border rounded-3xl overflow-hidden hover:shadow-2xl hover:-translate-y-2 hover:border-gold transition-all duration-500 ${selected.has(p._id) ? 'ring-2 ring-gold' : ''}`}>
              <div className="relative overflow-hidden h-42.5 md:h-50">
                <input type="checkbox" checked={selected.has(p._id)} onChange={() => toggleSelect(p._id)} className="absolute top-2 left-2 z-10 w-4 h-4 accent-gold" />
                <img src={getImg(p)} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition duration-700" loading="lazy" />
                {disc > 0 && <span className="absolute top-2 right-2 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">-{disc}% OFF</span>}
                {p.stock <= 0 && <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">Out of Stock</span>}
                {p.stock > 0 && p.stock <= 5 && <span className="absolute bottom-2 left-2 bg-orange-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">Only {p.stock} Left!</span>}
                {p.isFeatured && <span className="absolute bottom-2 right-2 bg-gold text-black text-[11px] font-bold px-2.5 py-1 rounded-full">⭐ Featured</span>}
                {isSale && <span className="absolute top-8 right-2 bg-red-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">🔥 SALE</span>}
                <span className={`absolute top-8 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${p.isActive === false ? 'bg-gray-500 text-white' : 'bg-green-500 text-white'}`}>{p.isActive === false ? 'Hidden 🙈' : 'Live ✅'}</span>
              </div>
              <div className="p-3.5">
                <div className="text-[11px] text-[#B8962E] font-bold uppercase">{getCatName(p.category) || 'Jewellery'}</div>
                <div className="font-bold text-sm line-clamp-2 min-h-10 leading-snug">{p.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.shortDescription || ''}</div>
                <div className="flex items-center gap-2 mt-1.5"><span className="font-bold">Rs {price.toLocaleString()}</span>{disc > 0 && <span className="text-xs text-gray-400 line-through">Rs {old.toLocaleString()}</span>}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">Stock: {p.stock ?? 0} • SKU: {p.sku || 'Auto'} • {p.images?.length || (p.image ? 1 : 0)} 📸</div>
                <button onClick={() => toggleField(p, 'isOnSale')} className={`w-full mt-2 py-1.5 rounded-full text-[11px] font-bold transition ${isSale ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}>{isSale ? '🔥 Sale ON - Click to OFF' : '🏷️ Sale pe Lagao'}</button>
                <div className="flex gap-1.5 mt-2">
                  <button onClick={() => startEdit(p)} className="flex-1 bg-black-lux text-white text-xs font-bold py-2 rounded-full hover:bg-gold hover:text-black transition active:scale-95">✏️ Edit</button>
                  <button onClick={() => duplicate(p)} className="px-2.5 py-2 rounded-full text-xs font-bold bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition" title="Duplicate">📋</button>
                  <button onClick={() => toggleField(p, 'isActive')} className="px-2.5 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-green-100 transition" title="Hide / Show">{p.isActive === false ? '👁️' : '🙈'}</button>
                  <button onClick={() => del(p._id, p.name)} className="px-2.5 py-2 rounded-full text-xs font-bold bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition">🗑️</button>
                </div>
                <Link to={`/product/${p._id}`} target="_blank" className="block text-center text-[11px] font-bold text-[#B8962E] mt-2 hover:underline">🔗 Website pe Dekho →</Link>
              </div>
            </div>
          );
        })}
      </div>
    )}
    {!loading && filtered.length === 0 && <div className="text-center py-14 bg-white rounded-4xl mt-5 border"><div className="text-5xl">💎</div><p className="font-bold mt-3">Could not find Product</p><p className="text-sm text-gray-500">{search ? 'Search saaf karo' : 'Upar + Add Product se pehla product add karo'}</p></div>}
    <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
  </div>;
}
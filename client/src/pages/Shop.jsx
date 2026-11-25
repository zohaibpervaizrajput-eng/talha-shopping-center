import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/layout/ProductCard'

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilter, setShowFilter] = useState(false);

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', material: '', colour: '', rating: '' });
  const [page, setPage] = useState(1);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([
        productAPI.getAll({ search, category, sort: sort==='low'?'price':sort==='high'?'-price':sort==='new'?'-createdAt':'', limit: 100 }),
        categoryAPI.getAll()
      ]);
      let list = p.data.products || p.data || [];
      // Frontend filters - Backend ke saath double safety
      if (filters.minPrice) list = list.filter(x => (x.salePrice||x.price) >= Number(filters.minPrice));
      if (filters.maxPrice) list = list.filter(x => (x.salePrice||x.price) <= Number(filters.maxPrice));
      if (filters.material) list = list.filter(x => x.material === filters.material);
      if (filters.colour) list = list.filter(x => (x.colour||'').toLowerCase().includes(filters.colour.toLowerCase()));
      if (filters.rating) list = list.filter(x => (x.rating||0) >= Number(filters.rating));
      if (sort==='discount') list = [...list].sort((a,b)=>((b.price-(b.salePrice||b.price))/b.price)-((a.price-(a.salePrice||a.price))/a.price));
      if (sort==='popular') list = [...list].sort((a,b)=>(b.soldCount||0)-(a.soldCount||0));
      setProducts(list);
      setCats(c.data.categories || c.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch(e){ setProducts([]); } finally{ setLoading(false); }
  };
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(()=>{ fetchData(); }, [search, category, sort]);
  const perPage = 12;
  const totalPages = Math.ceil(products.length / perPage) || 1;
  const paged = products.slice((page-1)*perPage, page*perPage);

  return <div className="max-w-7xl mx-auto px-4 py-6">
    <h1 className="font-serif text-3xl font-bold">All Jewellery <span className="text-gold text-lg">({products.length} Products)</span></h1>
    <p className="text-gray-500 text-sm mt-1">{search ? `Results for "${search}"` : category ? `Category: ${category}` : 'Premium Gold, Silver, Diamond & Artificial Jewellery'}</p>

    {/* Search + Sort Bar */}
    <div className="flex flex-col md:flex-row gap-3 mt-5">
      <form onSubmit={e=>{e.preventDefault(); const f=new FormData(e.target); params.set('search', f.get('q')); setParams(params);}} className="flex-1 flex border rounded-full overflow-hidden">
        <input name="q" defaultValue={search} placeholder="Search by name, SKU, material..." className="flex-1 px-4 py-2 outline-none text-sm" />
        <button className="bg-black text-white px-5"><Search size={18}/></button>
      </form>
      <select value={sort} onChange={e=>{params.set('sort', e.target.value); setParams(params);}} className="border rounded-full px-4 py-2 text-sm">
        <option value="">Sort: Featured</option><option value="low">Price: Low to High</option><option value="high">Price: High to Low</option><option value="new">Newest First</option><option value="popular">Most Popular</option><option value="discount">Biggest Discount</option>
      </select>
      <button onClick={()=>setShowFilter(!showFilter)} className="border rounded-full px-4 py-2 text-sm flex items-center gap-2 justify-center"><SlidersHorizontal size={16}/> Filters</button>
    </div>

    <div className="flex gap-6 mt-6">
      {/* FILTERS */}
      <aside className={`${showFilter?'block':'hidden'} md:block w-full md:w-56 shrink-0`}>
        <div className="border rounded-2xl p-4 space-y-4 sticky top-32 bg-white">
          <div><h3 className="font-bold text-sm mb-2">Category</h3><div className="space-y-1 text-sm">
            <button onClick={()=>{params.delete('category'); setParams(params);}} className={`block ${!category?'text-gold font-bold':''}`}>All Categories</button>
            {cats.map(c=><button key={c._id} onClick={()=>{params.set('category', c._id); setParams(params);}} className={`block truncate ${category===c._id?'text-gold font-bold':''}`}>{c.name}</button>)}
            {cats.length===0 && ['Gold Jewellery','Silver Jewellery','Diamond Jewellery','Artificial Jewellery','Rings','Earrings','Necklaces','Bracelets','Watches'].map(c=><button key={c} onClick={()=>{params.set('category', c); setParams(params);}} className="block">{c}</button>)}
          </div></div>
          <div><h3 className="font-bold text-sm mb-2">Price (PKR)</h3><div className="flex gap-2"><input type="number" placeholder="Min" value={filters.minPrice} onChange={e=>setFilters({...filters,minPrice:e.target.value})} className="w-full border rounded-lg px-2 py-1 text-sm"/><input type="number" placeholder="Max" value={filters.maxPrice} onChange={e=>setFilters({...filters,maxPrice:e.target.value})} className="w-full border rounded-lg px-2 py-1 text-sm"/></div><button onClick={fetchData} className="w-full bg-black text-white py-1.5 rounded-lg text-sm mt-2">Apply Price</button></div>
          <div><h3 className="font-bold text-sm mb-2">Material</h3><select value={filters.material} onChange={e=>setFilters({...filters,material:e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm"><option value="">All Materials</option><option>Gold</option><option>Silver</option><option>Diamond</option><option>Artificial</option><option>Platinum</option></select></div>
          <div><h3 className="font-bold text-sm mb-2">Rating</h3><select value={filters.rating} onChange={e=>setFilters({...filters,rating:e.target.value})} className="w-full border rounded-lg px-2 py-1.5 text-sm"><option value="">Any Rating</option><option value="4">4★ & Above</option><option value="3">3★ & Above</option></select></div>
          <button onClick={()=>{setFilters({minPrice:'',maxPrice:'',material:'',colour:'',rating:''}); params.delete('category'); params.delete('search'); setParams(params);}} className="w-full border py-1.5 rounded-lg text-sm">Clear All Filters</button>
        </div>
      </aside>

      {/* PRODUCTS */}
      <div className="flex-1">
        {loading ? <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3,4,5,6].map(i=><div key={i} className="animate-pulse bg-cream rounded-2xl aspect-square"></div>)}</div>
        : paged.length===0 ? <div className="text-center py-20 border rounded-2xl"><p className="text-5xl">🔍</p><h3 className="font-bold text-xl mt-3">No Products Found</h3><p className="text-gray-500 text-sm">Try different search or clear filters.</p><button onClick={()=>{setFilters({minPrice:'',maxPrice:'',material:'',colour:'',rating:''}); params.delete('search'); params.delete('category'); setParams(params);}} className="bg-black text-white px-5 py-2 rounded-full text-sm mt-4">Clear Filters</button></div>
        : <><div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">{paged.map(p=><ProductCard key={p._id} p={p}/>)}</div>
        <div className="flex justify-center gap-2 mt-8">{Array.from({length: totalPages}, (_,i)=>i+1).map(n=><button key={n} onClick={()=>setPage(n)} className={`w-9 h-9 rounded-full text-sm ${page===n?'bg-black text-white':'border'}`}>{n}</button>)}</div></>}
      </div>
    </div>
  </div>;
}
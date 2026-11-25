import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Truck, ShieldCheck, Minus, Plus } from 'lucide-react';
import { productAPI, reviewAPI } from '../services/api.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [img, setImg] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const { add, toggleWish, wishlist } = useCart();
  const { user } = useAuth();
  const { settings } = useSettings();
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await productAPI.get(id);
        setP(data); setImg(0); setSize(data.sizes?.[0] || '');
        const all = await productAPI.list({ category: data.category?.name });
        setRelated((Array.isArray(all.data) ? all.data : []).filter(x => x._id !== id).slice(0, 4));
        const rv = await reviewAPI.byProduct(id);
        setReviews(Array.isArray(rv.data) ? rv.data : rv.data.reviews || []);
      } catch {}
    })();
  }, [id]);

  if (!p) return <div className="p-10 text-center">Loading product...</div>;
  const price = p.salePrice > 0 ? p.salePrice : p.price;
  const off = p.salePrice > 0 ? Math.round((1 - p.salePrice / p.price) * 100) : 0;
  const imgs = p.images?.length ? p.images : [{ url: p.image || '' }];
  const wished = wishlist.some(w => w._id === p._id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="text-sm text-gray-500"><Link to="/">Home</Link> / <Link to="/products">Products</Link> / {p.name}</div>
      <div className="grid md:grid-cols-2 gap-8 mt-4">
        <div>
          <img src={imgs[img]?.url} alt={p.name} className="w-full h-[420px] object-cover rounded-3xl" />
          <div className="flex gap-2 mt-3">{imgs.map((im, i) => <img key={i} src={im.url} alt="" onClick={() => setImg(i)} className={`w-20 h-20 object-cover rounded-xl cursor-pointer border-2 ${i === img ? 'border-[#D4AF37]' : ''}`} />)}</div>
        </div>
        <div>
          <h1 className="text-3xl font-bold">{p.name}</h1>
          <div className="flex gap-1 mt-2"><Star className="fill-yellow-400 text-yellow-400" /> {p.rating || 0} • {p.numReviews || 0} reviews • SKU: {p.sku || 'N/A'}</div>
          <div className="flex gap-3 items-center mt-3"><span className="text-3xl font-bold">Rs. {price?.toLocaleString()}</span>{off > 0 && <><span className="line-through text-gray-400">Rs. {p.price?.toLocaleString()}</span><span className="bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs font-bold">-{off}% OFF</span></>}</div>
          <p className="text-gray-600 mt-3">{p.description || p.shortDescription || 'Premium quality jewellery from TALHA Shopin Center.'}</p>
          <div className="mt-4"><span className={`px-3 py-1 rounded-full text-sm ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{p.stock > 0 ? `In Stock (${p.stock} left)` : 'Out of Stock'}</span></div>
          {p.sizes?.length > 0 && <div className="mt-4"><div className="font-semibold mb-2">Size:</div><div className="flex gap-2 flex-wrap">{p.sizes.map(s => <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 border rounded-full ${size === s ? 'bg-[#111111] text-white' : ''}`}>{s}</button>)}</div></div>}
          <div className="flex items-center gap-3 mt-5"><span className="font-semibold">Qty:</span><button onClick={() => setQty(Math.max(1, qty - 1))} className="border p-2 rounded-full"><Minus size={16} /></button><span className="font-bold">{qty}</span><button onClick={() => setQty(Math.min(p.stock || 99, qty + 1))} className="border p-2 rounded-full"><Plus size={16} /></button></div>
          <div className="flex gap-3 mt-5">
            <button disabled={p.stock <= 0} onClick={() => add(p, qty, size)} className="flex-1 bg-[#111111] text-white py-3 rounded-full flex justify-center gap-2"><ShoppingCart /> Add to Cart</button>
            <button onClick={() => { add(p, qty, size); nav('/checkout'); }} className="flex-1 bg-[#D4AF37] py-3 rounded-full font-bold">Buy Now</button>
            <button onClick={() => toggleWish(p)} className="border p-3 rounded-full"><Heart className={wished ? 'fill-red-500 text-red-500' : ''} /></button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-5 text-sm"><span className="flex gap-2"><Truck size={18} /> Delivery: Rs. {settings.deliveryCharge} • Free over Rs. {settings.freeDeliveryAbove?.toLocaleString()}</span><span className="flex gap-2"><ShieldCheck size={18} /> {p.warranty || 'Quality Guaranteed'}</span></div>
          <div className="border rounded-2xl p-4 mt-5 text-sm grid grid-cols-2 gap-2">
            <span><b>Material:</b> {p.material || '-'}</span><span><b>Purity:</b> {p.purity || '-'}</span><span><b>Weight:</b> {p.weight || '-'}</span><span><b>Stone:</b> {p.stoneType || '-'}</span><span><b>Colour:</b> {p.colour || '-'}</span><span><b>Brand:</b> {p.brand || 'TALHA'}</span>
          </div>
          {p.careInstructions && <div className="mt-4 text-sm"><b>Care:</b> {p.careInstructions}</div>}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold">Customer Reviews ({reviews.length})</h2>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div>{reviews.length === 0 ? <p className="text-gray-500">No reviews yet. Be the first!</p> : reviews.map(r => (
            <div key={r._id} className="border rounded-2xl p-4 mb-3"><div className="flex gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />)} <span className="font-semibold ml-2">{r.user?.name || 'Customer'}</span></div><p className="text-sm mt-1">{r.comment}</p>{r.adminReply && <div className="bg-[#F8F6F1] p-3 rounded-xl mt-2 text-sm"><b>TALHA Reply:</b> {r.adminReply}</div>}</div>
          ))}</div>
          <form className="border rounded-2xl p-4 h-fit" onSubmit={async e => { e.preventDefault(); if (!user) return nav('/login'); try { await reviewAPI.create({ product: id, rating, comment }); alert('Review sent! It will show after Admin approval.'); setComment(''); } catch (err) { alert(err.response?.data?.message || 'Review failed'); } }}>
            <h3 className="font-bold">Write a Review</h3>
            <select value={rating} onChange={e => setRating(Number(e.target.value))} className="border rounded-full px-3 py-2 mt-3 w-full"><option value={5}>5 Stars</option><option value={4}>4 Stars</option><option value={3}>3 Stars</option><option value={2}>2 Stars</option><option value={1}>1 Star</option></select>
            <textarea value={comment} onChange={e => setComment(e.target.value)} required placeholder="Your review..." className="border rounded-xl w-full p-3 mt-3" rows={3} />
            <button className="bg-[#111111] text-white px-5 py-2 rounded-full mt-3">Submit Review</button>
          </form>
        </div>
      </div>

      {related.length > 0 && <div className="mt-12"><h2 className="text-2xl font-bold">Related Products</h2><div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">{related.map(r => <Link key={r._id} to={`/product/${r._id}`} className="border rounded-2xl overflow-hidden"><img src={r.images?.[0]?.url || ''} alt={r.name} className="w-full h-48 object-cover" /><div className="p-3"><div className="font-semibold line-clamp-1">{r.name}</div><div className="font-bold">Rs. {(r.salePrice > 0 ? r.salePrice : r.price)?.toLocaleString()}</div></div></Link>)}</div></div>}
    </div>
  );
}
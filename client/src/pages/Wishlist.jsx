import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function Wishlist() {
  const { wishlist, toggleWish, add } = useCart();
  if (!wishlist.length) return <div className="text-center py-20"><div className="text-6xl">❤️</div><h2 className="text-2xl font-bold mt-3">Wishlist is empty</h2><Link to="/products" className="inline-block mt-4 bg-[#111111] text-white px-6 py-2 rounded-full">Explore Jewellery</Link></div>;
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold">My Wishlist ({wishlist.length})</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">{wishlist.map(p => (
        <div key={p._id} className="border rounded-2xl overflow-hidden">
          <Link to={`/product/${p._id}`}><img src={p.images?.[0]?.url || p.image || ''} alt={p.name} className="w-full h-52 object-cover" /></Link>
          <div className="p-3"><div className="font-semibold line-clamp-1">{p.name}</div><div className="font-bold mt-1">Rs. {(p.salePrice > 0 ? p.salePrice : p.price)?.toLocaleString()}</div>
          <div className="flex gap-2 mt-3"><button onClick={() => add(p)} className="flex-1 bg-[#111111] text-white py-2 rounded-full text-sm flex justify-center gap-1"><ShoppingCart size={16} /> Move to Cart</button><button onClick={() => toggleWish(p)} className="border p-2 rounded-full"><Trash2 size={16} className="text-red-500" /></button></div></div>
        </div>
      ))}</div>
    </div>
  );
}
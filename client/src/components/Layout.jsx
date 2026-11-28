import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingBag, User, Phone, Menu, X, Flame, Sparkles, MapPin, Mail, Clock, Send, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import { categoryAPI, productAPI } from '../services/api';
import logo from '../assets/shopweb.png'
import { useAuth } from '../context/AuthContext.jsx';

export default function Layout() {
  const { cartCount } = useCart();
  const { user, logout } = useAuth();
const [showUserMenu, setShowUserMenu] = useState(false);
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const [cats, setCats] = useState([]);
  const [saleCount, setSaleCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [drop, setDrop] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // ★★★ ADMIN + BACKEND SE - Sab kuch Settings se ★★★
  const siteName = settings.siteName || 'Nisa';
  const siteSub = settings.siteTagline || 'Collection';
  const phone = settings.phone || settings.whatsapp || '0300-1234567';
  const emailAdmin = settings.email || 'talha@example.com';
  const address = settings.address || 'Main Bazar, pasrur, Pakistan';
  const hours = settings.workingHours || 'Mon - Sat: 10 AM - 10 PM';
  const aboutShort = settings.aboutShort || 'Premium handmade jewellery - Gold Plated, Long Lasting Shine. Shadi, Party ya Gift - har lamhe ke liye.';
  const waLink = `https://wa.me/92${String(phone).replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent('Assalam-o-Alaikum! Order karna hai.')}`;
  const fbLink = settings.facebook || 'https://facebook.com';
  const igLink = settings.instagram || 'https://instagram.com';
  const ytLink = settings.youtube || 'https://youtube.com';

  // ★★★ BACKEND SE CATEGORIES + SALE COUNT ★★★
  useEffect(() => {
    categoryAPI.list().then(r => setCats(r.data?.categories || r.data?.data || r.data || [])).catch(() => setCats([]));
    productAPI.list({ limit: 500 }).then(r => {
      const list = r.data?.products || r.data?.data || r.data || [];
      setSaleCount((Array.isArray(list) ? list : []).filter(p => Number(p.salePrice) > 0 && Number(p.salePrice) < Number(p.price)).length);
    }).catch(() => {});
  }, []);

  // ★★★ FIXED CART - Sirf ye hissa change kiya hai ★★★
  const [localCartCount, setLocalCartCount] = useState(0);
  useEffect(() => {
    const updateCount = () => {
      // CartContext wali key + localStorage wali dono keys check karo
      const keys = ['cart', 'talha_cart', 'cartItems'];
      let total = 0;
      for (const k of keys) {
        try {
          const arr = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(arr) && arr.length > 0) {
            total = arr.reduce((sum, item) => sum + (item.qty || item.quantity || item.count || 1), 0);
            break;
          }
        } catch { /* empty */ }
      }
      setLocalCartCount(total);
    };
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    window.addEventListener('storage', updateCount);
    // Har page change pe bhi check karo
    return () => {
      window.removeEventListener('cartUpdated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, [location.pathname]);
  // Context se aaye ya localStorage se - jo bara ho wahi dikhao
  const displayCartCount = Math.max(cartCount || 0, localCartCount || 0);

  // ★★★ WISHLIST COUNT ★★★
  useEffect(() => {
    const upd = () => { try { setWishlistCount(JSON.parse(localStorage.getItem('wishlist') || '[]').length); } catch { setWishlistCount(0); } };
    upd(); window.addEventListener('storage', upd); window.addEventListener('wishlist-updated', upd);
    return () => { window.removeEventListener('storage', upd); window.removeEventListener('wishlist-updated', upd); };
  }, [location.pathname]);

  // ★★★ PAGE CHANGE PE MENU BAND + TOP PE JAO ★★★
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); setDrop(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }, [location.pathname]);

  const linkCls = ({ isActive }) => `relative py-3 font-semibold text-[15px] transition hover:text-[#B8962E] ${isActive ? 'text-[#B8962E] after:absolute after:left-0 after:right-0 after:-bottom-[1px] after:h-[3px] after:bg-[#D4AF37] after:rounded-full' : 'text-[#222]'}`;
  const fallbackCats = [{ name: 'Rings', slug: 'ring' }, { name: 'Necklaces', slug: 'necklace' }, { name: 'Earrings', slug: 'earring' }, { name: 'Bracelets', slug: 'bracelet' }, { name: 'Bridal', slug: 'bridal' }];
  const showCats = cats.length ? cats : fallbackCats;

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return alert('Sahi Email likhen');
    const subs = JSON.parse(localStorage.getItem('subscribers') || '[]');
    if (!subs.includes(email)) localStorage.setItem('subscribers', JSON.stringify([...subs, email]));
    setSubscribed(true); setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return <div className="min-h-screen flex flex-col bg-white">

    {/* ============ ★★★ NAVBAR START ★★★ ============ */}
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur shadow-[0_2px_20px_rgba(0,0,0,0.08)]">
      <div className="bg-black-lux text-white text-center text-[12px] md:text-[13px] py-2 px-4">
        ✨ <span className="font-semibold text-gold">FREE DELIVERY</span> Rs. 3000+ Orders Pe &nbsp;|&nbsp; 💎 100% Original &nbsp;|&nbsp; 🚚 Cash on Delivery All Pakistan
      </div>

      {/* MAIN ROW - NO SEARCH BAR */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(!open)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">{open ? <X size={22} /> : <Menu size={22} />}</button>
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-gold shadow-md group-hover:scale-105 transition shrink-0 bg-black-lux">
                <img src={logo} alt={siteName} className="h-12 w-12 object-cover" onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gold font-black text-xl">T</div>'; }} />
              </div>
              <div className="leading-none">
                <div className="text-[22px] md:text-[24px] font-black tracking-[0.12em] text-black-lux">{siteName}</div>
                <div className="text-[10px] md:text-[11px] tracking-[0.35em] text-[#B8962E] font-bold mt-1">{siteSub}</div>
              </div>
            </Link>
          </div>

 {/* MENU BAR */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-8">
          <NavLink to="/" className={linkCls}>Home</NavLink>
          <NavLink to="/products" className={linkCls}>Products</NavLink>
          <NavLink to="/about" className={linkCls}>About</NavLink>
          <NavLink to="/contact" className={linkCls}>Contact</NavLink>
          <NavLink to="/new-arivals" className={linkCls}><span className="flex items-center gap-1"><Sparkles size={15} className="text-gold" /> New Arrivals</span></NavLink>
          <NavLink to="/sale" className="relative py-3 font-bold text-[15px] flex items-center gap-1 text-red-600 hover:text-red-700 transition"><Flame size={16} /> Sale {saleCount > 0 && <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">{saleCount}</span>}</NavLink>
        </div>
      </nav>
          <div className="flex items-center gap-1 md:gap-4">
            <a href={waLink} target="_blank" rel="noreferrer" className="hidden md:flex items-center gap-2 font-semibold hover:text-green-600 transition">
              <span className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600"><Phone size={18} /></span>
              <span className="leading-tight"><span className="block text-[11px] text-gray-400 font-normal">Call / WhatsApp</span>{phone}</span>
            </a>
            <Link to="/wishlist" className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full hover:bg-red-50 hover:text-red-500 transition" title="Wishlist">
              <Heart size={22} />
              {wishlistCount > 0 && <span className="absolute -top-1 -right-1 bg-gold text-black text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{wishlistCount}</span>}
            </Link>
            {/* ★★★ FIXED CART BADGE - Wishlist jesa style ★★★ */}
            <Link to="/cart" className="relative w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-full hover:bg-yellow-50 hover:text-[#B8962E] transition" title="Cart">
              <ShoppingBag size={22} />
              {displayCartCount > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{displayCartCount}</span>}
            </Link>
           {/* ★★★ MY ACCOUNT - Login hai to Naam, nahi to Login ★★★ */}
{user ? (
  <div className="relative">
    <button
      onClick={() => setShowUserMenu(!showUserMenu)}
      className="flex items-center gap-1.5 bg-black-lux text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gold hover:text-black transition shadow"
    >
      <span className="w-6 h-6 bg-[#D4AF37] text-black rounded-full flex items-center justify-center text-xs font-black">
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
      </span>
      <span className="hidden sm:inline max-w-[80px] truncate">{user.name?.split(' ')[0]}</span>
      <span className="text-[10px]">▼</span>
    </button>

    {showUserMenu && (
      <>
        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)}></div>
        <div className="absolute right-0 top-[48px] z-50 w-[220px] bg-white rounded-2xl shadow-2xl border p-2 animate-[fadeUp_0.2s_ease]">
          <div className="px-3 py-3 border-b">
            <p className="font-bold text-sm truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          <Link to="/my-account" onClick={() => setShowUserMenu(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-50">👤 My Account</Link>
          <Link to="/my-account" onClick={() => setShowUserMenu(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-50">🛍️ My Orders</Link>
          <Link to="/wishlist" onClick={() => setShowUserMenu(false)} className="block px-3 py-2.5 rounded-xl font-semibold text-sm hover:bg-yellow-50">❤️ My Wishlist</Link>
          <button
            onClick={async () => { setShowUserMenu(false); await logout(); navigate('/'); }}
            className="w-full text-left px-3 py-2.5 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50"
          >
            🚪 Logout
          </button>
        </div>
      </>
    )}
  </div>
) : (
  <Link to="/login" className="flex items-center gap-1.5 bg-black-lux text-white px-3 md:px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gold hover:text-black transition shadow"><User size={17} /> <span className="hidden sm:inline">Login</span></Link>
)}
          </div>
        </div>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="lg:hidden border-t bg-white px-4 py-3 space-y-1 shadow-xl animate-[fadeUp_0.2s_ease]">
          {[['Home', '/'], ['Products', '/products'], ['New Arrivals', '/products?sort=newest'], ['About', '/about'], ['Contact', '/contact']].map(([label, path]) => (
            <Link key={path} to={path} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-semibold hover:bg-yellow-50">{label}</Link>
          ))}
          {user ? (
  <>
    <Link to="/my-account" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-bold bg-black text-white">👤 {user.name} - My Account</Link>
    <Link to="/my-account" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-semibold bg-yellow-50">🛍️ My Orders</Link>
    <button onClick={async () => { setOpen(false); await logout(); navigate('/'); }} className="block w-full text-left px-4 py-3 rounded-xl font-bold text-red-500 bg-red-50">🚪 Logout</button>
  </>
) : (
  <Link to="/login" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-bold bg-black text-white text-center">👤 Login / Sign Up</Link>
)}
          <Link to="/sale" onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-bold text-red-600 bg-red-50">🔥 Sale {saleCount > 0 && `(${saleCount})`}</Link>
          <a href={waLink} target="_blank" rel="noreferrer" className="block px-4 py-3 rounded-xl font-bold text-green-600 bg-green-50">📞 {phone} - WhatsApp Order</a>
        </div>
      )}
    </header>
    {/* ============ ★★★ NAVBAR END ★★★ ============ */}

    {/* ============ ★★★ PAGE CONTENT ★★★ ============ */}
    <main className="flex-1"><Outlet /></main>

    {/* ============ ★★★ FOOTER START ★★★ ============ */}
    <footer className="bg-black-lux text-white mt-0">
      {/* TRUST BAR */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[[Truck, 'Fast Delivery', 'All Pakistan COD'], [ShieldCheck, '100% Original', 'Quality Guaranteed'], [RotateCcw, 'Easy Return', '7 Days Return'], [Phone, '24/7 Support', 'WhatsApp Pe Rabta']].map(([Icon, t, s], i) => (
            <div key={i} className="flex items-center gap-3"><div className="w-11 h-11 shrink-0 bg-gold/15 rounded-full flex items-center justify-center text-gold"><Icon size={20} /></div><div><div className="font-bold text-sm">{t}</div><div className="text-xs text-gray-400">{s}</div></div></div>
          ))}
        </div>
      </div>

      {/* MAIN FOOTER */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* 1 - LOGO + ABOUT */}
        <div>
          <Link to="/" className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-gold bg-white shrink-0"><img src={logo} alt={siteName} className="h-12 w-12 object-cover" /></div>
            <div className="leading-none"><div className="text-[22px] font-black tracking-[0.12em]">{siteName}</div><div className="text-[10px] tracking-[0.35em] text-gold font-bold mt-1">{siteSub}</div></div>
          </Link>
          <p className="text-gray-400 text-sm leading-relaxed mt-4">{aboutShort}</p>
          <div className="flex gap-2 mt-4">
            <a href={fbLink} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition"><Mail size={17} /></a>
            <a href={igLink} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition"><Mail size={17} /></a>
            <a href={ytLink} target="_blank" rel="noreferrer" className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-gold hover:text-black transition"><Mail size={17} /></a>
            <a href={waLink} target="_blank" rel="noreferrer" className="w-9 h-9 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition"><Phone size={17} /></a>
          </div>
        </div>

        {/* 2 - QUICK LINKS - WEBSITE SE CONNECTED */}
        <div>
          <h3 className="font-black text-lg">Quick Links</h3>
          <div className="w-10 h-0.75 bg-gold rounded-full mt-2 mb-4" />
          <ul className="space-y-2.5 text-sm text-gray-400">
            {[['Home', '/'], ['All Products', '/products'], ['New Arrivals', '/products?sort=newest'], ['Sale', '/sale'], ['About Us', '/about'], ['Contact Us', '/contact'], ['My Cart', '/cart'], ['Wishlist', '/wishlist']].map(([label, path]) => (
              <li key={path + label}><Link to={path} className="hover:text-gold hover:pl-1 transition-all">→ {label}</Link></li>
            ))}
          </ul>
        </div>

        {/* 3 - CATEGORIES - BACKEND SE */}
        <div>
          <h3 className="font-black text-lg">Categories</h3>
          <div className="w-10 h-0.75 bg-gold rounded-full mt-2 mb-4" />
          <ul className="space-y-2.5 text-sm text-gray-400">
            {showCats.slice(0, 6).map(c => (
              <li key={c.name}><Link to={`/products?category=${c.slug || c.name}`} className="hover:text-gold hover:pl-1 transition-all">💎 {c.name}</Link></li>
            ))}
            <li><Link to="/products" className="text-gold font-semibold hover:pl-1 transition-all">View All →</Link></li>
          </ul>
        </div>

        {/* 4 - CONTACT + NEWSLETTER - ADMIN SETTINGS SE */}
        <div>
          <h3 className="font-black text-lg">Contact Us</h3>
          <div className="w-10 h-0.75 bg-gold rounded-full mt-2 mb-4" />
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex gap-2.5"><MapPin size={17} className="text-gold shrink-0 mt-0.5" /> {address}</li>
            <li className="flex gap-2.5"><Phone size={17} className="text-gold shrink-0 mt-0.5" /> <a href={`tel:${phone}`} className="hover:text-gold">{phone}</a></li>
            <li className="flex gap-2.5"><Mail size={17} className="text-gold shrink-0 mt-0.5" /> <a href={`mailto:${emailAdmin}`} className="hover:text-gold break-all">{emailAdmin}</a></li>
            <li className="flex gap-2.5"><Clock size={17} className="text-gold shrink-0 mt-0.5" /> {hours}</li>
          </ul>
          <form onSubmit={subscribe} className="mt-4">
            <p className="text-sm font-semibold mb-2">🔔 Offers ke liye Subscribe:</p>
            <div className="flex bg-white/10 rounded-full p-1">
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Apna Email..." className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-gray-400 min-w-0" />
              <button className="bg-gold text-black px-4 py-2 rounded-full font-bold text-sm flex items-center gap-1 hover:bg-white transition shrink-0"><Send size={14} /> Join</button>
            </div>
            {subscribed && <p className="text-green-400 text-xs mt-2 font-semibold">✅ Shukriya! Aap subscribe ho gaye.</p>}
          </form>
        </div>
      </div>

      {/* BOTTOM BAR */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[13px] text-gray-400">
          <p>© {new Date().getFullYear()} <span className="text-white font-bold">{siteName} {siteSub}</span> • All Rights Reserved • Made with ❤️ in Pakistan</p>
          <div className="flex gap-4"><Link to="/about" className="hover:text-gold">Privacy Policy</Link><Link to="/about" className="hover:text-gold">Terms</Link><Link to="/contact" className="hover:text-gold">Help</Link></div>
        </div>
      </div>
    </footer>
    {/* ============ ★★★ FOOTER END ★★★ ============ */}

    {/* WHATSAPP FLOATING - ADMIN NUMBER SE */}
    <a href={waLink} target="_blank" rel="noreferrer" className="fixed bottom-5 right-5 z-50 w-13.5 h-13.5 bg-green-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition animate-bounce" title="WhatsApp Order">
      <span className="text-2xl">💬</span>
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">1</span>
    </a>

    <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
  </div>;
}

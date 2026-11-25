import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { couponAPI } from '../services/api';
import { useSettings } from './SettingsContext';

const Ctx = createContext(null);
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(Ctx);

export function CartProvider({ children }) {
  const { settings } = useSettings();
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem('talha_cart') || '[]'));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem('talha_wish') || '[]'));
  const [coupon, setCoupon] = useState(null);

  useEffect(() => { localStorage.setItem('talha_cart', JSON.stringify(items)); }, [items]);
  useEffect(() => { localStorage.setItem('talha_wish', JSON.stringify(wishlist)); }, [wishlist]);

  const add = (p, qty = 1, size = '') => {
    const price = p.salePrice > 0 ? p.salePrice : p.price;
    const id = p._id + '_' + (size || 'std');
    setItems(prev => {
      const ex = prev.find(i => i.key === id);
      if (ex) return prev.map(i => i.key === id ? { ...i, qty: Math.min(i.qty + qty, p.stock || 99) } : i);
      return [...prev, { key: id, productId: p._id, name: p.name, image: p.images?.[0]?.url || p.image || '', price, qty, size, stock: p.stock }];
    });
  };
  const updateQty = (key, qty) => {
    if (qty <= 0) return setItems(prev => prev.filter(i => i.key !== key));
    setItems(prev => prev.map(i => i.key === key ? { ...i, qty: Math.min(qty, i.stock || 99) } : i));
  };
  const remove = (key) => setItems(prev => prev.filter(i => i.key !== key));
  const clear = () => { setItems([]); setCoupon(null); };

  const toggleWish = (p) => {
    setWishlist(prev => prev.some(w => w._id === p._id) ? prev.filter(w => w._id !== p._id) : [...prev, p]);
  };

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const discount = coupon?.discount || 0;

  // ★★★ FIXED: cartCount ab yahan se banega ★★★
  const cartCount = useMemo(() => items.reduce((s, i) => s + (i.qty || 1), 0), [items]);
  const wishlistCount = wishlist.length;

 // ✅ NAYA - Admin ka checkbox bhi manega
const shipping = useMemo(() => {
  if (coupon?.type === 'free_shipping') return 0;
  if (subtotal === 0) return 0;
  const deliveryFee = Number(settings?.deliveryCharge ?? 250);
  const freeAbove = Number(settings?.freeDeliveryAbove ?? 5000);
  const freeEnabled = settings?.freeDeliveryEnabled ?? true;

  if (freeEnabled && subtotal >= freeAbove) return 0;
  return deliveryFee;
}, [subtotal, settings, coupon]);
  const total = Math.max(0, subtotal - discount + shipping);

  const applyCoupon = async (code) => {
    const { data } = await couponAPI.validate({ code, orderTotal: subtotal });
    if (data.valid) { setCoupon({ code, discount: data.discount, type: data.type }); return data; }
    throw new Error(data.message || 'Invalid coupon');
  };

  return <Ctx.Provider value={{ items, add, updateQty, remove, clear, wishlist, toggleWish, subtotal, discount, shipping, total, coupon, applyCoupon, setCoupon, cartCount, wishlistCount }}>{children}</Ctx.Provider>;
}
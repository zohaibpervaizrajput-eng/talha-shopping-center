import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  // ★ FIX 1: Pehle localStorage se user uthao taake Refresh pe Login na dikhe
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('talha_admin') || '{}');
      // Agar saved me naam/email hai to wahi user hai
      if (saved && saved.email) return saved;
      return null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await authAPI.me();
      const freshUser = data.user || data || null;
      if (freshUser && freshUser.email) {
        setUser(freshUser);
        // ★ FIX 2: Fresh user ko bhi save karo taake agle Refresh pe kaam aaye
        try {
          const old = JSON.parse(localStorage.getItem('talha_admin') || '{}');
          const token = localStorage.getItem('token') || old.token || '';
          localStorage.setItem('talha_admin', JSON.stringify({ ...old, ...freshUser, token }));
        } catch {}
      } else {
        // Backend ne user nahi diya, lekin purana user mat urao agar token hai
        const token = localStorage.getItem('token');
        if (!token) setUser(null);
      }
    } catch {
      // ★ FIX 3: Net error / 401 pe foran logout MAT karo, agar token hai to user rehne do
      const token = localStorage.getItem('token');
      if (!token) setUser(null);
      // Agar token hai to purana user hi rehne do, warna bar bar login mangega
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const login = async (d) => {
    const { data } = await authAPI.login(d);
    // ★★★ TOKEN FIX - Tumhara Wala Same Rakha Hai ★★★
    const token = data.token || data.accessToken || data.user?.token || '';
    const loggedUser = data.user || data;
    if (token) {
      localStorage.setItem('token', token);
      // talha_admin me bhi Token daalo taake Products.jsx ko bhi mile
      try {
        const old = JSON.parse(localStorage.getItem('talha_admin') || '{}');
        localStorage.setItem('talha_admin', JSON.stringify({ ...old, ...loggedUser, token }));
      } catch {}
    }
    setUser(loggedUser);
    return data;
  };
  const register = async (d) => {
    const { data } = await authAPI.register(d);
    const token = data.token || data.accessToken || data.user?.token || '';
    const newUser = data.user || data;
    if (token) {
      localStorage.setItem('token', token);
      try {
        const old = JSON.parse(localStorage.getItem('talha_admin') || '{}');
        localStorage.setItem('talha_admin', JSON.stringify({ ...old, ...newUser, token }));
      } catch {}
    }
    setUser(newUser);
    return data;
  };
  const logout = async () => { 
    try { await authAPI.logout(); } catch {} 
    setUser(null); 
    localStorage.removeItem('token');
    localStorage.removeItem('talha_admin');
  };

  // LOCK: adminOnly bug se bachne ke liye role check - TUMHARA WALA SAME
  const isAdmin = user && ['admin','super_admin','product_manager','order_manager','inventory_manager','support','delivery_manager'].includes(user.role);
  const isSuperAdmin = user?.role === 'super_admin';

  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh: load, isAdmin, isSuperAdmin }}>{children}</Ctx.Provider>;
}
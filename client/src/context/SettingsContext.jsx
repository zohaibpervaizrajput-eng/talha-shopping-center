import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsAPI } from '../services/api';

const Ctx = createContext(null);
export const useSettings = () => useContext(Ctx);

const FALLBACK = {
  storeName: 'TALHA Shopin Center',
  phone: '0300-1234567',
  whatsapp: '0300-1234567',
  email: 'info@talha.com',
  announcement: '🔥 EID SALE - 50% OFF on All Jewellery! Free Delivery over Rs. 5000',
  deliveryCharge: 250,
  freeDeliveryAbove: 5000,
  cod: true, jazzCash: true, easypaisa: true, bankTransfer: false,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await settingsAPI.get();
      // LOCK: backend flat + site/shipping/payment dono bhejta hai
      const flat = { ...FALLBACK, ...data, ...(data.site || {}), ...(data.shipping || {}), ...(data.payment || {}) };
      setSettings(flat);
    } catch { setSettings(FALLBACK); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  // Admin save kare to ye call hoga, poori site turant update
  const refresh = async () => { await load(); };

  return <Ctx.Provider value={{ settings, loading, refresh, setSettings }}>{children}</Ctx.Provider>;
}
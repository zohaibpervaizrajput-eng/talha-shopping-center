import { useState, useEffect } from 'react';
import api from '../services/api';

export function useSettings() {
  const [settings, setSettings] = useState(() => {
    // Pehle localStorage se dikhao taake website khali na lage
    const saved = JSON.parse(localStorage.getItem('talha_settings') || 'null');
    return saved || {
      storeName: 'TALHA Shopin Center',
      phone: '0300-1234567',
      whatsapp: '0300-1234567',
      email: 'info@talha.com',
      announcement: '🔥 EID SALE - 50% OFF on All Jewellery! Free Delivery over Rs. 5000',
      deliveryCharge: 250,
      freeDeliveryAbove: 5000,
    };
  });

  useEffect(() => {
    // ✅ AB BACKEND (MongoDB) SE SETTINGS LAYEGA
    api.get('/settings')
      .then((res) => {
        if (res.data) {
          setSettings(res.data);
          // Backup ke liye localStorage me bhi rakh lo
          localStorage.setItem('talha_settings', JSON.stringify(res.data));
        }
      })
      .catch((err) => {
        console.log('Backend se settings nahi mili, local wali dikha raha hun:', err.message);
      });
  }, []);

  return settings;
}
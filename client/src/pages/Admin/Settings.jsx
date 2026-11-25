import { useEffect, useState } from 'react';
import { settingsAPI } from '../../services/api';
import { useSettings } from '../../context/SettingsContext.jsx';
import AdminBackup from './AdminBackup.jsx';

export default function Settings() {
  const { settings, refresh } = useSettings();
  const [form, setForm] = useState({
    storeName: '', phone: '', whatsapp: '', email: '', announcement: '',
    deliveryCharge: 250, freeDeliveryAbove: 5000, freeDeliveryEnabled: true,
    cod: true, jazzCash: true, easypaisa: true, bankTransfer: false,
    jazzCashNumber: '', easypaisaNumber: '', bankAccount: '',
    locationAddress: '', locationCity: '', storeTiming: '', mapEmbedUrl: '',
    shopImages: [], aboutImage: '', heroImage: '', heroImages: [], logoImage: '',
    heroTitle: '', heroSubtitle: '', heroButtonText: '',
    instagram: '', facebook: '', tiktok: '', youtube: '',
    returnPolicyDays: 7, minOrder: 0,
  });
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ★★★ GMAIL - INSTEAD OF TELEGRAM NOW GMAIL ★★★
  const [gmail, setGmail] = useState({ adminEmail: '' });
  const [gmailLoading, setGmailLoading] = useState(false);
  const [gmailSaving, setGmailSaving] = useState(false);
  const [gmailTesting, setGmailTesting] = useState(false);
  const [gmailMsg, setGmailMsg] = useState('');
  const setGmailField = (k, v) => setGmail(p => ({ ...p, [k]: v }));

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  };

  const loadGmail = async () => {
    setGmailLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/gmail-config`, {
        credentials: 'include',
        headers: { ...getAuthHeaders() }
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        setGmailMsg('❌ Login expired - Please Login Again After Logout, then try saving again.');
        return;
      }
      if (res.ok) setGmail({ adminEmail: data.adminEmail || '' });
    } catch {}
    setGmailLoading(false);
  };

  useEffect(() => { loadGmail(); }, []);

  const saveGmail = async (silent = false) => {
    setGmailSaving(true);
    if (!silent) setGmailMsg('');
    try {
      const payload = {
        adminEmail: String(gmail.adminEmail || '').trim(),
      };
      if (!payload.adminEmail) throw new Error('Gmail..?');
      if (!payload.adminEmail.includes('@')) throw new Error('Valid Gmail - e.g. abc@gmail.com');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/gmail-config`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Login expired - Please Login Again');
      if (!res.ok) throw new Error(data.message || 'Save failed');
      if (!silent) setGmailMsg('✅ Gmail Saved.');
      return true;
    } catch (e) {
      if (!silent) setGmailMsg('❌ ' + e.message);
      return false;
    } finally {
      setGmailSaving(false);
    }
  };

  const testGmail = async () => {
    // Save first then test so it goes to the new Gmail
    const saved = await saveGmail(true);
    if (!saved) return;
    setGmailTesting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders/telegram-test`, {
        method: 'POST',
        credentials: 'include',
        headers: { ...getAuthHeaders() }
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) throw new Error('Login expired - Please Login Again');
      if (!res.ok) throw new Error(data.message || 'Test failed - check Backend Logs');
      setGmailMsg('✅ Test Email sent! Open Gmail app and check - should arrive in 5 sec.');
    } catch (e) { setGmailMsg('❌ ' + e.message); }
    setGmailTesting(false);
  };

  // ★★★ LOAD FROM BACKEND - Same Backend ★★★
  useEffect(() => {
    setForm({
      storeName: settings.storeName || '',
      phone: settings.phone || '',
      whatsapp: settings.whatsapp || '',
      email: settings.email || '',
      announcement: settings.announcement || '',
      deliveryCharge: settings.deliveryCharge ?? 250,
      freeDeliveryAbove: settings.freeDeliveryAbove ?? 5000,
      freeDeliveryEnabled: settings.freeDeliveryEnabled ?? true,
      cod: settings.cod ?? true,
      jazzCash: settings.jazzCash ?? true,
      easypaisa: settings.easypaisa ?? true,
      bankTransfer: settings.bankTransfer ?? false,
      jazzCashNumber: settings.jazzCashNumber || '',
      easypaisaNumber: settings.easypaisaNumber || '',
      bankAccount: settings.bankAccount || '',
      locationAddress: settings.locationAddress || settings.address || '',
      locationCity: settings.locationCity || settings.city || '',
      storeTiming: settings.storeTiming || '',
      mapEmbedUrl: settings.mapEmbedUrl || '',
      shopImages: Array.isArray(settings.shopImages) ? settings.shopImages : (settings.shopImages ? [settings.shopImages] : []),
      aboutImage: settings.aboutImage || '',
      heroImage: settings.heroImage || '',
      heroImages: Array.isArray(settings.heroImages) && settings.heroImages.length > 0
        ? settings.heroImages
        : (settings.heroImage ? [settings.heroImage] : []),
      logoImage: settings.logoImage || '',
      heroTitle: settings.heroTitle || '',
      heroSubtitle: settings.heroSubtitle || '',
      heroButtonText: settings.heroButtonText || '',
      instagram: settings.instagram || '',
      facebook: settings.facebook || '',
      tiktok: settings.tiktok || '',
      youtube: settings.youtube || '',
      returnPolicyDays: settings.returnPolicyDays ?? 7,
      minOrder: settings.minOrder ?? 0,
    });
  }, [settings]);

  // ★★★ PICK PHOTO FROM GALLERY ★★★
  const pickImage = (key, multiple = false) => (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        if (multiple) {
          const limit = key === 'heroImages' ? 3 : 6;
          setForm(prev => ({ ...prev, [key]: [...(prev[key] || []), reader.result].slice(0, limit) }));
        }
        else set(key, reader.result);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // ★★★ SAVE - Same Backend API: PUT /api/settings ★★★
  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg('');
    try {
      const safeHeroImages = form.heroImages || [];
      const payload = { ...form, heroImages: safeHeroImages, heroImage: safeHeroImages[0] || form.heroImage };
      await settingsAPI.update(payload);
      await refresh();
      setMsg('✅ Settings Saved! Updated on website.');
      window.scrollTo(0, 0);
    } catch (er) { setMsg('❌ Save failed: ' + (er.response?.data?.message || er.message)); }
    setSaving(false);
  };

  const inp = "border rounded-xl px-3 py-2 w-full outline-none focus:border-[#D4AF37]";
  const label = "text-sm font-medium text-gray-700";

  return (
  <div className="max-w-4xl">
    <h1 className="text-2xl font-bold">Website Settings - LIVE SYNC</h1>
    <p className="text-sm text-gray-500 mt-1">Whatever you change here will instantly show on the customer website. No code change needed.</p>
    {msg && <div className={`p-3 rounded-xl mt-4 text-sm font-medium ${msg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{msg}</div>}

    <form onSubmit={save} className="space-y-6 mt-4">

      {/* ============ 1. STORE INFO ============ */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-bold text-lg">🏪 Store Info</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div><label className={label}>Store Name *</label><input placeholder="TAHA Shopping Center" value={form.storeName} onChange={e => set('storeName', e.target.value)} className={inp} /></div>
          <div><label className={label}>Phone</label><input placeholder="0307-6128103" value={form.phone} onChange={e => set('phone', e.target.value)} className={inp} /></div>
          <div><label className={label}>WhatsApp Number</label><input placeholder="0307-6128103" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} className={inp} /></div>
          <div><label className={label}>Email</label><input placeholder="info@talha.com" value={form.email} onChange={e => set('email', e.target.value)} className={inp} /></div>
          <div className="md:col-span-2"><label className={label}>🔥 Announcement Bar - Will show at the top of website</label><textarea placeholder="EID SALE - 50% OFF on All Jewellery! Free Delivery over Rs. 5000" value={form.announcement} onChange={e => set('announcement', e.target.value)} className={inp} rows={2} /></div>
        </div>
      </section>

      {/* ★★★ GMAIL NOTIFICATION - NEW SECTION - Gmail Will Change From Here ★★★ */}
      <section className="border-2 border-dashed border-red-400 rounded-2xl p-5 bg-red-50/50">
        <h2 className="font-bold text-lg">📧 Order Notification - Gmail</h2>
        <p className="text-xs text-gray-500 mt-1">Whenever an order comes, the Order Email will come on this Gmail. To use another mobile's Gmail, change it from here.</p>
        {gmailLoading ? <p className="text-sm text-gray-500 mt-3">⏳ Gmail setting is loading...</p> : (
          <div className="space-y-3 mt-3">
            <div><label className={label}>On which Gmail should the Order Email come? - This Gmail will change</label><input placeholder="othermobile@gmail.com" value={gmail.adminEmail} onChange={e => setGmailField('adminEmail', e.target.value)} className={inp} />
              <p className="text-[11px] text-gray-500 mt-1">Want to connect another mobile? Write that mobile's Gmail here and Save. Done! From now all Orders will come on that Gmail.</p>
            </div>
            {gmailMsg && <div className={`p-3 rounded-xl text-sm font-medium ${gmailMsg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-600'}`}>{gmailMsg}</div>}
            <div className="flex gap-2 flex-wrap">
              <button type="button" onClick={() => saveGmail(false)} disabled={gmailSaving} className="bg-red-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-red-700 disabled:opacity-60">{gmailSaving ? '⏳ Saving...' : '💾 Save Gmail'}</button>
              <button type="button" onClick={testGmail} disabled={gmailTesting || gmailSaving || !gmail.adminEmail} className="bg-green-600 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-green-700 disabled:opacity-60">{gmailTesting ? '⏳ Sending...' : '📩 Send Test Email'}</button>
            </div>
            <p className="text-[11px] text-gray-500">Note: The sender Gmail will remain the same as in .env. Only this changes - on which Gmail the Email should come.</p>
          </div>
        )}
      </section>

      {/* ============ 2. LOGO + HERO BANNER ============ */}
      <section className="bg-white rounded-2xl p-5 border-2 border-dashed border-gold">
        <h2 className="font-bold text-lg">🎨 Logo + Home Banner - From Gallery</h2>
        <div className="grid md:grid-cols-2 gap-4 mt-3">
          <div>
            <label className={label}>Shop Logo</label>
            <input id="logoPick" type="file" accept="image/*" className="hidden" onChange={pickImage('logoImage')} />
            <label htmlFor="logoPick" className="block text-center border-2 border-dashed rounded-xl py-6 cursor-pointer hover:border-gold hover:bg-[#FFFDF5] mt-1 font-semibold text-sm">🖼️ Pick Logo From Gallery</label>
            {form.logoImage && <div className="relative mt-2"><img src={form.logoImage} className="w-full h-28 object-contain bg-gray-50 rounded-xl border" alt="Logo" /><button type="button" onClick={() => set('logoImage', '')} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full">✕</button></div>}
          </div>
          <div>
            <label className={label}>Home Hero Banner Image (Old - Backup)</label>
            <input id="heroPick" type="file" accept="image/*" className="hidden" onChange={pickImage('heroImage')} />
            <label htmlFor="heroPick" className="block text-center border-2 border-dashed rounded-xl py-6 cursor-pointer hover:border-gold hover:bg-[#FFFDF5] mt-1 font-semibold text-sm">🌟 Pick Banner From Gallery</label>
            {form.heroImage && <div className="relative mt-2"><img src={form.heroImage} className="w-full h-28 object-cover rounded-xl" alt="Hero" /><button type="button" onClick={() => set('heroImage', '')} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full">✕</button></div>}
          </div>

          {/* ★★★ HERO SWIPER - 3 IMAGES - FROM GALLERY ★★★ */}
          <div className="md:col-span-2 border-2 border-dashed border-gold rounded-2xl p-4 bg-[#FFFDF5]">
            <label className={label}>🎠 Hero Swiper Images - Will Slide on Home (Max 3)</label>
            <p className="text-xs text-gray-500 mt-1">Pick 3 photos from Gallery. First photo will show first. These will run in the Home Swiper.</p>
            <input id="heroSwiperPick" type="file" accept="image/*" multiple className="hidden" onChange={pickImage('heroImages', true)} />
            <label htmlFor="heroSwiperPick" className="block text-center bg-black text-white py-3.5 rounded-xl font-bold cursor-pointer hover:bg-[#B8962E] transition mt-3">🖼️ + Pick Swiper Images From Gallery (Up to 3)</label>
            {(form.heroImages || []).length === 0 ? (
              <p className="text-xs text-gray-400 bg-white p-3 rounded-xl mt-3 text-center">No Swiper image yet - pick from Gallery with the button above.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {(form.heroImages || []).map((url, i) => (
                  <div key={i} className="relative">
                    <img src={url} alt={`Hero ${i + 1}`} className="w-full h-28 object-cover rounded-xl border" />
                    <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">{i === 0 ? '⭐ Slide 1' : `Slide ${i + 1}`}</span>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, heroImages: (prev.heroImages || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs">✕</button>
                    {i !== 0 && <button type="button" onClick={() => { const n = [...(form.heroImages || [])]; const [p] = n.splice(i, 1); n.unshift(p); setForm(prev => ({ ...prev, heroImages: n })); }} className="absolute bottom-1 left-1 bg-white text-[10px] px-2 py-1 rounded-full font-bold shadow">⭐ Make First</button>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div><label className={label}>Hero Title - Big text on Home</label><input placeholder="Elegance That Defines You" value={form.heroTitle} onChange={e => set('heroTitle', e.target.value)} className={inp} /></div>
          <div><label className={label}>Hero Button Text</label><input placeholder="Shop Now" value={form.heroButtonText} onChange={e => set('heroButtonText', e.target.value)} className={inp} /></div>
          <div className="md:col-span-2"><label className={label}>Hero Subtitle</label><textarea placeholder="Premium Artificial Jewellery..." value={form.heroSubtitle} onChange={e => set('heroSubtitle', e.target.value)} className={inp} rows={2} /></div>
        </div>
      </section>

      {/* ============ 3. SHIPPING ============ */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-bold text-lg">🚚 Shipping - Will show on Checkout</h2>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <div><label className={label}>Delivery Charge Rs</label><input type="number" value={form.deliveryCharge} onChange={e => set('deliveryCharge', Number(e.target.value))} className={inp} /></div>
          <div><label className={label}>Free Delivery Above Rs</label><input type="number" value={form.freeDeliveryAbove} onChange={e => set('freeDeliveryAbove', Number(e.target.value))} className={inp} /></div>
          <div><label className={label}>Min Order Rs</label><input type="number" value={form.minOrder} onChange={e => set('minOrder', Number(e.target.value))} className={inp} /></div>
        </div>
        <label className="flex gap-2 items-center text-sm mt-3"><input type="checkbox" checked={form.freeDeliveryEnabled} onChange={e => set('freeDeliveryEnabled', e.target.checked)} /> Free Delivery Offer is ON</label>
      </section>

      {/* ============ 4. PAYMENT ============ */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-bold text-lg">💳 Payment Methods - Will show on Checkout</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          {[['cod', 'Cash on Delivery'], ['jazzCash', 'JazzCash'], ['easypaisa', 'Easypaisa'], ['bankTransfer', 'Bank Transfer']].map(([k, l]) => (
            <label key={k} className="flex gap-2 items-center text-sm bg-gray-50 p-3 rounded-xl"><input type="checkbox" checked={form[k]} onChange={e => set(k, e.target.checked)} /> {l}</label>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <div><label className={label}>JazzCash Number</label><input placeholder="0307-6128103" value={form.jazzCashNumber} onChange={e => set('jazzCashNumber', e.target.value)} className={inp} /></div>
          <div><label className={label}>Easypaisa Number</label><input placeholder="0307-6128103" value={form.easypaisaNumber} onChange={e => set('easypaisaNumber', e.target.value)} className={inp} /></div>
          <div><label className={label}>Bank Account / IBAN</label><input placeholder="PKxx..." value={form.bankAccount} onChange={e => set('bankAccount', e.target.value)} className={inp} /></div>
        </div>
        <div className="mt-3"><label className={label}>Return Policy - Days</label><input type="number" value={form.returnPolicyDays} onChange={e => set('returnPolicyDays', Number(e.target.value))} className={inp} /></div>
      </section>

      {/* ============ 5. LOCATION + MAP ============ */}
      <section className="border-2 border-dashed border-gold rounded-2xl p-5 bg-[#FFFDF5]">
        <h2 className="font-bold text-lg">📍 Store Location + Map - Will show on About + Contact</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div className="md:col-span-2"><label className={label}>Full Address</label><input placeholder="Main Bazaar, Gujranwala" value={form.locationAddress} onChange={e => set('locationAddress', e.target.value)} className={inp} /></div>
          <div><label className={label}>City</label><input placeholder="Gujranwala" value={form.locationCity} onChange={e => set('locationCity', e.target.value)} className={inp} /></div>
          <div><label className={label}>Store Timing</label><input placeholder="9 AM - 10 PM (Mon - Sat)" value={form.storeTiming} onChange={e => set('storeTiming', e.target.value)} className={inp} /></div>
          <div className="md:col-span-2"><label className={label}>Google Maps Embed Link</label><textarea placeholder="https://www.google.com/maps/embed?..." value={form.mapEmbedUrl} onChange={e => set('mapEmbedUrl', e.target.value)} className={inp} rows={2} /></div>
        </div>
        {form.mapEmbedUrl && <iframe title="Map Preview" src={form.mapEmbedUrl} className="w-full h-55 rounded-xl border mt-3" loading="lazy" />}
      </section>

      {/* ============ 6. SHOP IMAGES ============ */}
      <section className="border-2 border-dashed border-pink-400 rounded-2xl p-5 bg-[#FFF5F8]">
        <h2 className="font-bold text-lg">📸 Shop Images - About + Contact Gallery</h2>
        <p className="text-xs text-gray-500 mt-1">Pick from Gallery. Max 6 photos. First photo will be the Main Photo.</p>
        <input id="shopGalleryInput" type="file" accept="image/*" multiple className="hidden" onChange={pickImage('shopImages', true)} />
        <label htmlFor="shopGalleryInput" className="block text-center bg-black text-white py-4 rounded-2xl font-bold cursor-pointer hover:bg-pink-500 transition mt-3">🖼️ + Pick Photos From Gallery</label>
        <p className="text-center text-[11px] text-gray-400 mt-1">On Mobile Gallery / Camera will open • On Computer Files will open</p>
        {(form.shopImages || []).length === 0 ? (
          <p className="text-xs text-gray-400 bg-white p-3 rounded-xl mt-3 text-center">No photo yet - pick from Gallery with the button above.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {(form.shopImages || []).map((url, i) => (
              <div key={i} className="relative">
                <img src={url} alt={`Shop ${i + 1}`} className="w-full h-28 object-cover rounded-xl border" />
                <span className="absolute top-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full">{i === 0 ? '🏪 Main' : `Photo ${i + 1}`}</span>
                <button type="button" onClick={() => setForm(prev => ({ ...prev, shopImages: (prev.shopImages || []).filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-xs">✕</button>
                {i !== 0 && <button type="button" onClick={() => { const n = [...(form.shopImages || [])]; const [p] = n.splice(i, 1); n.unshift(p); setForm(prev => ({ ...prev, shopImages: n })); }} className="absolute bottom-1 left-1 bg-white text-[10px] px-2 py-1 rounded-full font-bold shadow">⭐ Make Main</button>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ============ 7. ABOUT MAIN PHOTO ============ */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-bold text-lg">🖼️ About Page - Main Photo</h2>
        <input id="aboutGalleryInput" type="file" accept="image/*" className="hidden" onChange={pickImage('aboutImage')} />
        <label htmlFor="aboutGalleryInput" className="block text-center border-2 border-dashed rounded-xl py-4 cursor-pointer hover:border-gold hover:bg-[#FFFDF5] transition mt-2 font-semibold text-sm">🖼️ Pick About Photo From Gallery</label>
        {form.aboutImage && <div className="relative mt-2"><img src={form.aboutImage} className="w-full h-48 object-cover rounded-xl" alt="About" /><button type="button" onClick={() => set('aboutImage', '')} className="absolute top-2 right-2 bg-red-500 text-white w-7 h-7 rounded-full">✕</button></div>}
      </section>

      {/* ============ 8. SOCIAL LINKS ============ */}
      <section className="bg-white rounded-2xl p-5">
        <h2 className="font-bold text-lg">📱 Social Links - Will show in Footer</h2>
        <div className="grid md:grid-cols-2 gap-3 mt-3">
          <div><label className={label}>Instagram</label><input placeholder="https://instagram.com/..." value={form.instagram} onChange={e => set('instagram', e.target.value)} className={inp} /></div>
          <div><label className={label}>Facebook</label><input placeholder="https://facebook.com/..." value={form.facebook} onChange={e => set('facebook', e.target.value)} className={inp} /></div>
          <div><label className={label}>TikTok</label><input placeholder="https://tiktok.com/..." value={form.tiktok} onChange={e => set('tiktok', e.target.value)} className={inp} /></div>
          <div><label className={label}>YouTube</label><input placeholder="https://youtube.com/..." value={form.youtube} onChange={e => set('youtube', e.target.value)} className={inp} /></div>
        </div>
      </section>

      <button disabled={saving} className="bg-gold px-8 py-3.5 rounded-full font-bold w-full hover:scale-[1.01] transition disabled:opacity-60 text-lg">
        {saving ? '⏳ Saving...' : '💾 Save Settings - Website Will Update Instantly'}
      </button>
      <p className="text-center text-xs text-gray-400">As soon as you press Save, Home / About / Contact / Footer / Checkout - all will update.</p>
        </form>
          {/* ★★★ BACKUP BUTTON - Will Show Here ★★★ */}
<div className="mt-6">
  <AdminBackup />
</div>
  </div>
  );
}
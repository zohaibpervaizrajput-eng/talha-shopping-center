import { useEffect, useState } from 'react';
import { categoryAPI, productAPI } from '../../services/api';

export default function Categories() {
  const [list, setList] = useState([]);
  const [counts, setCounts] = useState({});
  const [form, setForm] = useState({ name: '', description: '', image: '' });
  const [editId, setEditId] = useState(null);

  const load = async () => {
    const c = await categoryAPI.list(true);
    const arr = Array.isArray(c.data) ? c.data : c.data.categories || [];
    setList(arr);
    const p = await productAPI.list();
    const prods = Array.isArray(p.data) ? p.data : [];
    const m = {};
    prods.forEach(x => {
      const k = x.category?._id || x.category;
      if (k) m[k] = (m[k] || 0) + 1;
    });
    setCounts(m);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  // ★★★ FIXED: Gallery se photo pick karo - URL likhne ki zaroorat nahi ★★★
  const pickImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setForm(prev => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Dobara same photo pick karne ke liye
  };

  const removeImage = () => {
    setForm(prev => ({ ...prev, image: '' }));
  };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editId) await categoryAPI.update(editId, form);
      else await categoryAPI.create(form);
      setForm({ name: '', description: '', image: '' });
      setEditId(null);
      load();
      alert('Category saved!');
    } catch (er) {
      alert(er.response?.data?.message || 'Failed');
    }
  };

  const startEdit = (c) => {
    setEditId(c._id);
    setForm({ name: c.name, description: c.description || '', image: c.image || '' });
    window.scrollTo(0, 0);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({ name: '', description: '', image: '' });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold">Categories ({list.length})</h1>

      {/* ★★★ FORM - IMAGE URL KHATAM, GALLERY BUTTON AA GAYA ★★★ */}
      <form onSubmit={save} className="bg-white rounded-2xl p-4 mt-4 flex flex-col gap-3">
        <div className="flex flex-wrap gap-3">
          <input
            required
            placeholder="Category Name *"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            className="border rounded-xl px-3 py-2 flex-1 min-w-37.5"
          />
          <input
            placeholder="Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="border rounded-xl px-3 py-2 flex-1 min-w-37.5"
          />
        </div>

        {/* GALLERY PICKER */}
        <div className="flex items-center gap-3 border-2 border-dashed border-gold/40 rounded-xl p-3 bg-[#FFF9E6]">
          {/* Preview */}
          {form.image ? (
            <div className="relative shrink-0">
              <img src={form.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-white shadow" />
              <button type="button" onClick={removeImage} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white w-5 h-5 rounded-full text-[10px]">✕</button>
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-xl flex items-center justify-center text-[10px] text-gray-400 font-bold text-center shrink-0">No<br/>Photo</div>
          )}

          <div className="flex-1">
            <input id="catGalleryInput" type="file" accept="image/*" className="hidden" onChange={pickImage} />
            <label htmlFor="catGalleryInput" className="inline-block bg-black-lux text-white px-4 py-2.5 rounded-full font-bold text-sm cursor-pointer hover:bg-gold hover:text-black transition">
              🖼️ Gallery se Photo Pick Karo
            </label>
            <p className="text-[11px] text-gray-400 mt-1">Mobile pe Gallery / Camera khulega • Necklace, Ring, Earrings ki photo yahan se lagao</p>
          </div>

          <button className="bg-black-lux text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gold hover:text-black transition shrink-0">
            {editId ? 'Update' : '+ Add'}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="border px-4 py-2.5 rounded-full text-sm font-bold shrink-0">
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* LIST */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {list.map(c => (
          <div key={c._id} className="bg-white rounded-2xl p-4 hover:shadow-xl transition">
            <img
              src={c.image || 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'}
              className="w-full h-32 object-cover rounded-xl"
              alt={c.name}
            />
            <div className="font-bold mt-2">{c.name}</div>
            <div className="text-xs text-gray-500">{c.description || ''} • {counts[c._id] || 0} products • Slug: {c.slug}</div>
            <div className="flex gap-3 mt-3 text-sm">
              <button onClick={() => startEdit(c)} className="text-blue-600 font-bold">Edit</button>
              <button
                onClick={async () => {
                  if (!confirm('Delete category?')) return;
                  try { await categoryAPI.remove(c._id); load(); }
                  catch (er) { alert(er.response?.data?.message || 'Category me products hain, pehle unko move/delete karo'); }
                }}
                className="text-red-600 font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
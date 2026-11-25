import { useState } from 'react';
import { backupAPI } from '../../services/api'; // ★★★ Settings wali line ★★★

export default function AdminBackup() {
  const [msg, setMsg] = useState('');
  const [restoring, setRestoring] = useState(false);

  const downloadBackup = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await backupAPI.exportBackup();
      const blob = new Blob([res.data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TSC-Backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      setMsg('✅ Backup Download Hogaya - Ise safe jagah save kar lo');
    } catch (err) {
      setMsg('❌ Backup fail - ' + (err.response?.data?.message || err.message));
    }
  };

  const restoreBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!confirm('Kya tum Backup Restore karna chahte ho?')) return;
    setRestoring(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const res = await backupAPI.restoreBackup(backup);
      setMsg(res.data.message || '✅ Backup Restored');
    } catch (err) {
      setMsg('❌ ' + (err.response?.data?.message || 'wrong file'));
    }
    setRestoring(false);
    e.target.value = '';
  };

  return (
    <div className="border rounded-2xl p-5 bg-white">
      <h2 className="font-bold text-lg">💾 Database Backup</h2>
      <p className="text-sm text-gray-500 mt-1">Download backup every week.</p>
      {msg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-3 py-2 rounded-xl mt-3">{msg}</div>}
      <div className="flex flex-wrap gap-3 mt-4">
        <button type="button" onClick={downloadBackup} className="bg-black text-white px-5 py-2 rounded-full text-sm">⬇️ Download Backup</button>
        <label className="border px-5 py-2 rounded-full text-sm cursor-pointer">
          {restoring ? '⏳ Restoring...' : '♻️ Backup Restore Karo'}
          <input type="file" accept=".json" onChange={restoreBackup} className="hidden" />
        </label>
      </div>
    </div>
  );
}
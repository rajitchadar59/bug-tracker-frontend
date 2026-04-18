import { useState } from 'react';
import fetchApi from '../fetchApi';
import { X, UserPlus } from 'lucide-react';

const InviteMemberModal = ({ closeModal, projectId }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Developer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi('/notifications/invite', { method: 'POST', body: JSON.stringify({ email, projectId, role }) });
      alert(`Invite sent successfully!`);
      closeModal();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border dark:border-slate-800">
        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-emerald-600">
            <UserPlus size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Invite Member</h2>
          </div>
          <button onClick={closeModal} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">User Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all" placeholder="teammate@company.com" />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Access Level</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white outline-none cursor-pointer">
              <option value="Admin">Admin (Full Access)</option>
              <option value="Developer">Developer (Edit Access)</option>
              <option value="Viewer">Viewer (Read Only)</option>
            </select>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-[0.2em]">{loading ? 'Sending...' : 'Send Invitation'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMemberModal;
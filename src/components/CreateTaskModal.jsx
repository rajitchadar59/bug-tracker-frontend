import { useState, useEffect } from 'react';
import fetchApi from '../fetchApi';
import { X, FileEdit } from 'lucide-react';

const CreateTaskModal = ({ closeModal, projectId, refreshBoard }) => {
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', assignee: '' });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await fetchApi(`/projects/${projectId}`);
        setMembers(data.project.members || []);
      } catch (err) { console.error(err); }
    };
    fetchMembers();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 🔥 FIX: Convert empty string assignee to null or remove it completely.
    const payload = { 
      ...formData, 
      project: projectId,
      assignee: formData.assignee === "" ? null : formData.assignee 
    };

    try {
      await fetchApi('/tasks', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
      });
      refreshBoard();
      closeModal();
    } catch (err) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in zoom-in-95 duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-indigo-600">
            <FileEdit size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Create Issue</h2>
          </div>
          <button onClick={closeModal} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Task Summary</label>
            <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-3 py-2.5 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-all" placeholder="What needs to be done?" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Priority</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white outline-none cursor-pointer" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Assignee</label>
              <select className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 dark:text-white outline-none cursor-pointer" value={formData.assignee} onChange={(e) => setFormData({...formData, assignee: e.target.value})}>
                <option value="">Unassigned</option>
                {members.filter(m => m.role !== 'Viewer').map(m => (
                  <option key={m.user?._id || m._id} value={m.user?._id || m._id}>{m.user?.name || m.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={closeModal} className="px-4 py-2 text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 uppercase transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-lg transition-all active:scale-95 uppercase tracking-widest">
              {loading ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
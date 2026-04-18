import { useState, useEffect } from 'react';
import fetchApi from '../fetchApi';
import { X, Users, ShieldCheck } from 'lucide-react';

const ProjectMembersModal = ({ closeModal, projectId, projectOwnerId }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await fetchApi(`/projects/${projectId}`);
        setMembers(data.project.members || []);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchMembers();
  }, [projectId]);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border dark:border-slate-800">
        <div className="p-5 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-blue-600">
            <Users size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-100">Team Roster</h2>
          </div>
          <button onClick={closeModal} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md transition-colors"><X size={18} className="text-slate-400" /></button>
        </div>

        <div className="max-h-80 overflow-y-auto p-4 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="space-y-2">
              {members.map((member, index) => {
                const memberName = member.user?.name || member.name;
                const memberEmail = member.user?.email || member.email;
                const memberId = member.user?._id || member._id;
                const isAdmin = memberId === projectOwnerId;
                const role = member.role || 'Developer';

                if (!memberName) return null;

                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-900/40 rounded-xl border border-transparent hover:border-blue-200 dark:hover:border-blue-900 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-inner ${isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                        {memberName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">{memberName}</p>
                          {isAdmin && <ShieldCheck size={12} className="text-purple-500" />}
                        </div>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{memberEmail}</p>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${isAdmin ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-900' : role === 'Viewer' ? 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700' : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-900'}`}>
                      {isAdmin ? 'Owner' : role}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t dark:border-slate-800 text-center">
          <button onClick={closeModal} className="text-[11px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 uppercase tracking-widest transition-colors">Close View</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectMembersModal;
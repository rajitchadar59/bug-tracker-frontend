import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import fetchApi from '../fetchApi';
import CreateProjectModal from '../components/CreateProjectModal';
import CreateTaskModal from '../components/CreateTaskModal';
import InviteMemberModal from '../components/InviteMemberModal'; 
import ProjectMembersModal from '../components/ProjectMembersModal';
import KanbanBoard from '../components/KanbanBoard';
import Navbar from '../components/Navbar';
import { Plus, FolderKanban, UserPlus, FilePlus2, Menu, X, Info, Trash2 } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [showDescPopup, setShowDescPopup] = useState(false);
  
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [boardRefreshTrigger, setBoardRefreshTrigger] = useState(0);

  const fetchProjects = async () => {
    try {
      const data = await fetchApi('/projects');
      setProjects(data.projects);
      if (data.projects.length > 0 && !activeProjectId) {
        setActiveProjectId(data.projects[0]._id);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const activeProject = projects.find(p => p._id === activeProjectId);

  // 🔥 RBAC MASTER FIX: Ultra-safe check for user._id vs owner._id
  const userRole = useMemo(() => {
    // Agar project ya user data fully load nahi hua hai, to safe return karo
    if (!activeProject || !user || (!user._id && !user.id)) return 'Viewer';
    
    // Safely extract current user ID (kabhi-kabhi backend se 'id' aata hai, kabhi '_id')
    const currentUserId = String(user._id || user.id);
    
    // Safely extract owner ID
    const ownerId = String(activeProject.owner?._id || activeProject.owner);

    // LOGIC 1: Agar user hi owner hai, seedha Admin
    if (ownerId === currentUserId) return 'Admin';

    // LOGIC 2: Agar owner nahi hai, to members array me check karo
    const memberMatch = activeProject.members?.find(m => {
      const mId = String(m.user?._id || m.user || m._id);
      return mId === currentUserId;
    });

    return memberMatch?.role || 'Viewer';
  }, [activeProject, user, projects]);

  const canInvite = userRole === 'Admin';
  const canModify = userRole === 'Admin' || userRole === 'Developer';

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Delete project permanently?")) {
      try {
        await fetchApi(`/projects/${projectId}`, { method: 'DELETE' });
        if (activeProjectId === projectId) setActiveProjectId(null);
        fetchProjects();
      } catch (err) { alert(err.message); }
    }
  };

  // Jab tak basic user session ya projects load ho rahe hain, loader dikhao
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0b1120] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen h-screen flex flex-col bg-[#F9FAFB] dark:bg-[#0b1120] font-sans transition-colors duration-300 overflow-hidden">
      <Navbar refreshProjects={fetchProjects} />

      {/* Mobile Nav */}
      <div className="lg:hidden bg-white dark:bg-[#0f172a] border-b dark:border-slate-800 p-3 flex items-center justify-between sticky top-16 z-20 shadow-sm">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md">
          {isSidebarOpen ? <X size={18} className="dark:text-white" /> : <Menu size={18} className="dark:text-white" />}
        </button>
        <span className="text-xs font-bold dark:text-white truncate max-w-[150px]">{activeProject?.name || 'SyncBoard'}</span>
        <button onClick={() => setIsProjectModalOpen(true)} className="bg-blue-600 p-1.5 rounded text-white shadow-lg"><Plus size={16} /></button>
      </div>

      <main className="flex-1 flex overflow-hidden">
        {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/60 z-20 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)}></div>}

        {/* Sidebar */}
        <aside className={`absolute lg:relative z-30 w-56 bg-white dark:bg-[#0f172a] border-r dark:border-slate-800 flex flex-col h-full transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 flex justify-between items-center opacity-80 border-b dark:border-slate-800/50">
            <h2 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em]">Projects</h2>
            <button onClick={() => setIsProjectModalOpen(true)} className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-all"><Plus size={14} /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
            {projects.map(p => (
              <button
                key={p._id}
                onClick={() => { setActiveProjectId(p._id); setIsSidebarOpen(false); }}
                className={`w-full group flex items-center justify-between px-3 py-2 rounded-md text-[13px] font-medium transition-all ${activeProjectId === p._id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800/50'}`}
              >
                <span className="truncate pr-2">{p.name}</span>
                {( (p.owner?._id || p.owner) === user?._id ) && (
                  <Trash2 size={12} onClick={(e) => { e.stopPropagation(); handleDeleteProject(p._id); }} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity" />
                )}
              </button>
            ))}
          </div>
          <div className="p-4 border-t dark:border-slate-800/50"></div>
        </aside>

        {/* Workspace */}
        <section className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-slate-50 dark:bg-[#0b1120]">
          {activeProjectId ? (
            <div className="max-w-[1600px] mx-auto flex flex-col h-full">
              
              {/* COMPACT PROJECT HEADER */}
              <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-slate-700/50 p-4 rounded-xl shadow-sm transition-all">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-lg md:text-xl font-extrabold text-gray-900 dark:text-white tracking-tight truncate">{activeProject?.name}</h2>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black border ${userRole === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:border-purple-500/30 dark:text-purple-300' : 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:border-green-500/30 dark:text-green-300'}`}>
                      {userRole}
                    </span>
                    <button onClick={() => setShowDescPopup(!showDescPopup)} className="p-1 text-gray-400 hover:text-blue-500 relative transition-colors">
                      <Info size={16} />
                      {showDescPopup && (
                        <div className="absolute top-full left-0 mt-2 w-72 p-4 bg-white dark:bg-[#1e293b] border dark:border-slate-600 shadow-2xl rounded-lg z-50 text-[12px] font-medium text-gray-600 dark:text-slate-200 ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1">
                          <p className="font-bold text-gray-900 dark:text-white mb-2 border-b dark:border-slate-700 pb-1 uppercase tracking-tighter">Project Details</p>
                          <p className="leading-relaxed whitespace-pre-wrap">{activeProject?.description || "No description provided."}</p>
                        </div>
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2" onClick={() => setIsMembersModalOpen(true)}>
                    <div className="flex -space-x-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                      {activeProject?.members?.slice(0, 3).map((m, i) => (
                        <div key={i} className="w-5 h-5 rounded-full border border-white dark:border-slate-800 bg-blue-500 text-white text-[8px] flex items-center justify-center font-bold">{(m.user?.name || m.name || 'U').charAt(0)}</div>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 hover:text-blue-500 uppercase cursor-pointer tracking-wider">Team Activity</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {canInvite && (
                    <button onClick={() => setIsInviteModalOpen(true)} className="px-3 py-1.5 text-[10px] font-bold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-all uppercase tracking-tighter shadow-sm active:scale-95"><UserPlus size={13}/> Invite</button>
                  )}
                  {canModify && (
                    <button onClick={() => setIsTaskModalOpen(true)} className="px-4 py-1.5 text-[10px] font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-1.5 transition-all uppercase tracking-tighter active:scale-95"><FilePlus2 size={13}/> New Issue</button>
                  )}
                </div>
              </div>

              <div className="flex-1 rounded-xl overflow-hidden bg-white/40 dark:bg-slate-900/20 border dark:border-slate-800/50 min-h-0">
                <KanbanBoard projectId={activeProjectId} refreshTrigger={boardRefreshTrigger} userRole={userRole} />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600">
              <FolderKanban size={48} strokeWidth={1.5} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-[0.2em]">Select a project to start working</p>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
      {isProjectModalOpen && <CreateProjectModal closeModal={() => setIsProjectModalOpen(false)} refreshProjects={fetchProjects} />}
      {isTaskModalOpen && <CreateTaskModal closeModal={() => setIsTaskModalOpen(false)} projectId={activeProjectId} refreshBoard={() => setBoardRefreshTrigger(p => p + 1)} />}
      {isInviteModalOpen && <InviteMemberModal closeModal={() => setIsInviteModalOpen(false)} projectId={activeProjectId} />}
      {isMembersModalOpen && <ProjectMembersModal closeModal={() => setIsMembersModalOpen(false)} projectId={activeProjectId} projectOwnerId={activeProject?.owner?._id || activeProject?.owner} />}
    </div>
  );
};

export default Dashboard;
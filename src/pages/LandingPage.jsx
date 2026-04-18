import { useState } from 'react';
import { Link } from 'react-router-dom';
import PublicNavbar from '../components/PublicNavbar';
import { Kanban, ShieldCheck, Filter, Zap, Users, Activity, Lock, Layers, Rocket } from 'lucide-react';

const LandingPage = () => {
  // Demo State for Interactive Board
  const [draggedId, setDraggedId] = useState(null);
  const [demoTasks, setDemoTasks] = useState([
    { id: 1, title: 'Fix Auth Middleware', status: 'To-Do', tag: 'todo' },
    { id: 2, title: 'Design System Update', status: 'In Progress', tag: 'progress' },
    { id: 3, title: 'Code Peer Review', status: 'Review', tag: 'Reviewing' },
    { id: 4, title: 'Database Migration', status: 'Done', tag: 'Done' },
  ]);

  const columns = [
    { id: 'To-Do', label: 'TO DO' },
    { id: 'In Progress', label: 'IN PROGRESS' },
    { id: 'Review', label: 'IN REVIEW' },
    { id: 'Done', label: 'DONE' }
  ];

  const getTagStyles = (status) => {
    if (status === 'To-Do') return 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    if (status === 'In Progress') return 'bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    if (status === 'Review') return 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800';
    return 'bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
  };

  const handleDragStart = (e, id) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => e.target.classList.add('opacity-40'), 0);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedId !== null) {
      setDemoTasks(prev => prev.map(task => {
        if (task.id === draggedId) {
          const newTag = newStatus === 'Done' ? 'Done' : (newStatus === 'Review' ? 'Reviewing' : (newStatus === 'In Progress' ? 'progress' : 'todo'));
          return { ...task, status: newStatus, tag: newTag };
        }
        return task;
      }));
    }
    setDraggedId(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors selection:bg-blue-100 overflow-x-hidden font-sans">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-20 md:pt-24 pb-8 md:pb-12 px-4 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-4 md:mb-5 border dark:border-gray-700">
          <Zap size={12} className="text-blue-500" /> Powered by Project Management App
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3 md:mb-4 tracking-tight leading-tight">
          Ship software with &nbsp;
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Visual Workflows.</span>
        </h1>
        
        <p className="text-[12px] sm:text-[13px] md:text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-6 md:mb-10 leading-relaxed font-medium">
          Manage projects, track bugs, and collaborate in a unified workspace. Professional tools built specifically for agile teams who want to build the future.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-10 md:mb-16">
          <Link to="/auth" className="px-5 md:px-6 py-2.5 bg-blue-600 text-white text-[11px] font-bold rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 w-full sm:w-auto">
            Get Started for Free
          </Link>
          <a href="#demo" className="px-5 md:px-6 py-2.5 bg-white dark:bg-gray-800 border dark:border-gray-700 text-gray-700 dark:text-gray-200 text-[11px] font-bold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-all w-full sm:w-auto">
            Try Interactive Demo
          </a>
        </div>

        {/* 🚀 COMPACT 3D INTERACTIVE BOARD */}
        <div id="demo" className="relative mx-auto max-w-5xl [perspective:1500px] group px-1 sm:px-0">
          <div className="bg-gray-50/80 dark:bg-gray-800/60 backdrop-blur-xl border border-gray-200 dark:border-gray-700/60 rounded-xl md:rounded-2xl p-3 md:p-6 shadow-xl transition-all duration-700 [transform:rotateX(5deg)_rotateY(-1deg)] md:[transform:rotateX(10deg)_rotateY(-2deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)]">
            
            <div className="flex items-center justify-between mb-4 md:mb-5 px-1 md:px-2">
              <div className="flex gap-1 md:gap-1.5">
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-green-400"></div>
              </div>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">Interactive Preview</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 text-left">
              {columns.map(col => (
                <div 
                  key={col.id}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="bg-white/50 dark:bg-gray-900/50 rounded-lg md:rounded-xl p-2.5 md:p-3 min-h-[120px] md:min-h-[220px] border-2 border-transparent border-dashed hover:border-blue-400/50 transition-colors flex flex-col gap-2 md:gap-3"
                >
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] md:text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {col.label}
                    </h3>
                    <span className="text-[9px] md:text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded font-bold">
                      {demoTasks.filter(t => t.status === col.id).length}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {demoTasks.filter(t => t.status === col.id).map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onDragEnd={(e) => { e.target.classList.remove('opacity-40'); setDraggedId(null); }}
                        className="bg-white dark:bg-gray-800 p-2.5 md:p-3 rounded-md md:rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 cursor-grab active:cursor-grabbing hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all group"
                      >
                        <p className="text-[11px] md:text-xs font-semibold text-gray-800 dark:text-gray-100 mb-2 md:mb-3 group-hover:text-blue-600 transition-colors">
                          {task.title}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${getTagStyles(task.status)}`}>
                            {task.tag}
                          </span>
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[7px] md:text-[8px] font-bold shadow-sm">U</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Expanded Features Grid */}
      <section className="py-12 md:py-20 px-4 max-w-5xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-1.5 md:mb-2">Everything your team needs</h2>
          <p className="text-[12px] md:text-[13px] text-gray-500 dark:text-gray-400">A complete toolset designed for modern software teams.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Feature icon={<Kanban size={14}/>} title="Agile Boards" desc="Drag tickets effortlessly across customizable columns. Visualize your entire sprint." />
          <Feature icon={<ShieldCheck size={14}/>} title="RBAC Security" desc="Granular permissions for Admins and Viewers. Control who edits your projects." />
          <Feature icon={<Filter size={14}/>} title="Smart Filters" desc="Instantly filter thousands of issues by priority, assignee, or keyword search." />
          <Feature icon={<Users size={14}/>} title="Collaboration" desc="Invite team members and discuss tasks using real-time threaded comments." />
          <Feature icon={<Activity size={14}/>} title="Real-time Tracking" desc="Monitor sprint progress and identify workflow bottlenecks instantly." />
          <Feature icon={<Lock size={14}/>} title="Secure Auth" desc="Protected APIs and JWT-based authentication to keep your data completely safe." />
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-8 md:py-16 text-center px-4 mb-4 md:mb-8">
        <div className="max-w-2xl mx-auto bg-blue-50 dark:bg-gray-800 border border-blue-100 dark:border-gray-700 rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm">
          <h2 className="text-base md:text-lg font-bold text-gray-900 dark:text-white mb-2">Ready to upgrade your workflow?</h2>
          <p className="text-[11px] md:text-[13px] text-gray-500 dark:text-gray-400 mb-5 md:mb-6">Join developers building better software with our intuitive project management tools.</p>
          <Link to="/auth" className="inline-block px-5 md:px-6 py-2 md:py-2.5 bg-blue-600 text-white text-[10px] md:text-[11px] font-bold rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all active:scale-95 w-full sm:w-auto">
            Start Building Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 md:py-12 text-center bg-gray-50 dark:bg-gray-950 border-t dark:border-gray-800">
        <div className="flex justify-center gap-4 md:gap-5 mb-4 md:mb-5 text-gray-400 opacity-60">
          <Layers size={14}/> <Rocket size={14}/> <ShieldCheck size={14}/>
        </div>
        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] md:tracking-[0.25em]">Project Management App • Built with MERN</p>
      </footer>
    </div>
  );
};

// Adjusted Feature Component
const Feature = ({ icon, title, desc }) => (
  <div className="p-4 md:p-5 bg-white dark:bg-gray-800 rounded-lg md:rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group">
    <div className="w-8 h-8 md:w-9 md:h-9 rounded-md md:rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-[11px] md:text-xs font-bold text-gray-900 dark:text-white mb-1.5">{title}</h3>
    <p className="text-[10px] md:text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
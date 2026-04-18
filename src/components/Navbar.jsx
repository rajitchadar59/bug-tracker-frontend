import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, LogOut, Bell, Layout } from 'lucide-react';
import fetchApi from '../fetchApi';

const Navbar = ({ refreshProjects }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const fetchNotifications = async () => {
    try {
      const data = await fetchApi('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleInviteAction = async (id, action) => {
    try {
      await fetchApi(`/notifications/${id}/handle`, {
        method: 'PUT',
        body: JSON.stringify({ action })
      });
      fetchNotifications();
      if (action === 'ACCEPTED' && refreshProjects) refreshProjects();
    } catch (err) {
      alert("Fail: " + err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetchApi('/notifications/mark-read', { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingCount = notifications.filter(n => n.status === 'PENDING').length;

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/90 dark:bg-gray-950/90 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* 🔥 FULL WIDTH: max-w hata diya aur px-4 md:px-6 laga diya */}
      <div className="w-full px-4 md:px-6 h-16 flex justify-between items-center">
        
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md">
            <Layout size={16} />
          </div>
          <h1 className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            Project Management App
          </h1>
        </div>
        
        {/* Actions Section */}
        <div className="flex items-center gap-2 sm:gap-4 relative">
          
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme} 
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl dark:text-gray-400 transition-all active:scale-95"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)} 
              className={`p-2 rounded-xl transition-all active:scale-95 ${showDropdown ? 'bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'}`}
              title="Notifications"
            >
              <Bell size={18} />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white dark:border-gray-950"></span>
                </span>
              )}
            </button>

            {/* Notification Dropdown - Mobile width fixed */}
            {showDropdown && (
              <div className="absolute top-14 right-[-40px] sm:right-0 w-[calc(100vw-32px)] sm:w-[380px] max-w-[380px] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 shadow-2xl rounded-2xl overflow-hidden z-50 animate-in fade-in duration-200">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                  <span className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2">
                    Notifications
                    {pendingCount > 0 && <span className="bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400 py-0.5 px-2 rounded-full text-[10px] font-black">{pendingCount} New</span>}
                  </span>
                  <div className="flex items-center gap-3">
                    {pendingCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline">Mark all read</button>
                    )}
                  </div>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center flex flex-col items-center gap-2 text-gray-400 dark:text-gray-500">
                      <Bell size={24} className="opacity-20" />
                      <p className="text-xs font-medium">You're all caught up!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                      {notifications.map(notif => (
                        <div key={notif._id} className={`p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60 ${notif.status === 'PENDING' ? 'bg-blue-50/40 dark:bg-blue-900/20' : ''}`}>
                          <p className="text-[13px] text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-bold text-gray-900 dark:text-white mr-1">{notif.sender?.name}</span> 
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 block">Recent</span>
                          
                          {notif.type === 'INVITE' && notif.status === 'PENDING' && (
                            <div className="mt-3 flex gap-2">
                              <button onClick={() => handleInviteAction(notif._id, 'ACCEPTED')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors shadow-sm">Accept</button>
                              <button onClick={() => handleInviteAction(notif._id, 'REJECTED')} className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-transparent dark:border-gray-600 text-gray-700 dark:text-gray-200 px-4 py-1.5 rounded-lg text-[11px] font-bold transition-colors">Decline</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 mx-1 sm:mx-2 hidden sm:block"></div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-0">
            <div className="flex items-center gap-2 cursor-pointer p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-xs font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{user?.name}</p>
              </div>
            </div>
            
            <button 
              onClick={logout} 
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" 
              title="Logout"
            >
              <LogOut size={16} strokeWidth={2.5} />
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
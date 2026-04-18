import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun, Layout } from 'lucide-react';

const PublicNavbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed w-full z-50 top-0 backdrop-blur-md bg-white/80 dark:bg-gray-900/90 border-b border-gray-100 dark:border-gray-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 h-14 flex justify-between items-center">
        
        <div className="flex items-center gap-2">
          <Layout className="text-blue-600" size={18} />
          <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
            <Link 
            to="/" 
            >
            Project Management App
          </Link>
            
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme} 
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          
          <Link 
            to="/auth" 
            className="text-[11px] font-bold px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-sm"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { HardHat, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <HardHat className="h-8 w-8 text-yellow-400" />
              <span className="font-bold text-xl tracking-tight">BuildTracker</span>
            </Link>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden md:block text-sm text-slate-300">
              Welcome, <span className="font-semibold text-white">{user?.name}</span> ({user?.role})
            </div>
            <Link to="/" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
               <LayoutDashboard className="h-5 w-5" />
               <span className="hidden sm:block">Dashboard</span>
            </Link>
            <Link to="/reports" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
               <span className="hidden sm:block">Reports</span>
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

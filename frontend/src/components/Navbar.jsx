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

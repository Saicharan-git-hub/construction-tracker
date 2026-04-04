import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { HardHat } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Worker' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(formData.name, formData.email, formData.password, formData.role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-xl">
        <div className="flex flex-col items-center">
          <HardHat className="h-12 w-12 text-yellow-500 mb-2" />
          <h2 className="text-center text-3xl font-extrabold text-slate-900">Create an Account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">{error}</div>}
          <div className="space-y-4">
            <input
              type="text" required placeholder="Full Name"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
              value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input
              type="email" required placeholder="Email address"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
              value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              type="password" required placeholder="Password"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-slate-500 focus:border-slate-500 bg-white"
              value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="Worker">Worker</option>
              <option value="Engineer">Engineer</option>
              <option value="Manager">Manager</option>
            </select>
          </div>
          <button type="submit" className="w-full py-2 px-4 text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors font-medium">
            Register
          </button>
        </form>
        <div className="text-center text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-slate-900 font-semibold hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

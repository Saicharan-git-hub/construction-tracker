import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Plus, Briefcase, Activity } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ projectName: '', description: '', startDate: '', endDate: '', budget: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      fetchProjects();
      setNewProject({ projectName: '', description: '', startDate: '', endDate: '', budget: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const chartData = projects.map(p => ({
    name: p.projectName,
    budget: p.budget,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Project Dashboard</h1>
          <p className="text-slate-500">Overview of active construction sites</p>
        </div>
        {user?.role === 'Manager' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-4 py-2 rounded-md font-semibold hover:bg-yellow-400 transition-colors">
            <Plus className="h-5 w-5" /> New Project
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500 font-medium">Total Projects</p><p className="text-3xl font-bold text-slate-900">{projects.length}</p></div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Briefcase /></div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div><p className="text-sm text-slate-500 font-medium">Active Sites</p><p className="text-3xl font-bold text-slate-900">{projects.filter(p => p.status === 'In Progress').length}</p></div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Activity /></div>
        </div>
      </div>

      {projects.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-8">
           <h2 className="text-lg font-bold text-slate-900 mb-6">Budget Overview</h2>
           <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Legend />
                  <Bar dataKey="budget" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-slate-900 mb-4">All Projects</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(project => (
          <Link to={`/projects/${project._id}`} key={project._id} className="block bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-slate-300 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-yellow-600 transition-colors">{project.projectName}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium shadow-sm ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                {project.status}
              </span>
            </div>
            <p className="text-slate-500 text-sm mb-4 line-clamp-2">{project.description}</p>
            <div className="flex justify-between text-sm text-slate-600 font-medium bg-slate-50 p-3 rounded-lg">
               <span>Budget:</span>
               <span className="text-slate-900">${project.budget.toLocaleString()}</span>
            </div>
          </Link>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <input type="text" placeholder="Project Name" required className="w-full border rounded p-2" value={newProject.projectName} onChange={e => setNewProject({...newProject, projectName: e.target.value})} />
              <textarea placeholder="Description" className="w-full border rounded p-2" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              <div className="flex gap-4">
                 <input type="date" required className="w-full border rounded p-2 text-slate-600" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                 <input type="date" required className="w-full border rounded p-2 text-slate-600" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
              </div>
              <input type="number" placeholder="Budget ($)" required className="w-full border rounded p-2" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} />
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-800">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

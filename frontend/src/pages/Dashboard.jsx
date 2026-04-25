import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Cell, PieChart, Pie } from 'recharts';
import { Plus, Briefcase, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ projectName: '', description: '', startDate: '', endDate: '', budget: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      if (Array.isArray(data)) {
        setProjects(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  const chartData = projects.map(p => ({
    name: p.projectName.length > 15 ? p.projectName.substring(0, 15) + '...' : p.projectName,
    Budget: p.budget,
    Spent: p.totalExpense || 0,
  }));

  const pieData = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.keys(pieData).map(k => ({ name: k, value: pieData[k] }));
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#64748b'];

  const getAlerts = () => {
    const alerts = [];
    projects.forEach(p => {
      // Budget Alert
      if (p.totalExpense > p.budget) {
        alerts.push({ id: p._id, type: 'danger', message: `Hold up! "${p.projectName}" is OVER budget by $${(p.totalExpense - p.budget).toLocaleString()}` });
      } else if (p.budget > 0 && p.totalExpense / p.budget > 0.9) {
        alerts.push({ id: `${p._id}-warning`, type: 'warning', message: `Careful! "${p.projectName}" is at ${((p.totalExpense/p.budget)*100).toFixed(1)}% of its budget.` });
      }
      
      // Deadline Alert (less than 7 days)
      const daysLeft = (new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24);
      if (p.status !== 'Completed' && daysLeft > 0 && daysLeft < 7) {
        alerts.push({ id: `${p._id}-deadline`, type: 'warning', message: `Deadline approaching! "${p.projectName}" is due in ${Math.ceil(daysLeft)} days.` });
      } else if (p.status !== 'Completed' && daysLeft < 0) {
        alerts.push({ id: `${p._id}-overdue`, type: 'danger', message: `Alert! "${p.projectName}" is overdue by ${Math.abs(Math.floor(daysLeft))} days.` });
      }
    });
    return alerts;
  };

  const alerts = getAlerts();

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading Dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white/70 backdrop-blur border border-slate-200/60 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Project Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of active construction sites and financials</p>
        </div>
        {user?.role === 'Manager' && (
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-slate-900/10 hover:bg-slate-800 transition-all hover:scale-[1.02]">
            <Plus className="h-5 w-5" /> New Project
          </button>
        )}
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3 mb-8">
          {alerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-xl flex items-center gap-3 border shadow-sm ${alert.type === 'danger' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p className="font-medium text-sm">{alert.message}</p>
            </div>
          ))}
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Projects</p><p className="text-3xl font-black text-slate-900 mt-1">{projects.length}</p></div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Briefcase className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Sites</p><p className="text-3xl font-black text-slate-900 mt-1">{projects.filter(p => p.status === 'In Progress').length}</p></div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Activity className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Completed</p><p className="text-3xl font-black text-slate-900 mt-1">{projects.filter(p => p.status === 'Completed').length}</p></div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle className="w-6 h-6"/></div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div><p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Budget Used</p>
          <p className="text-2xl font-black text-slate-900 mt-1">
             ${projects.reduce((acc, p) => acc + (p.totalExpense || 0), 0).toLocaleString()}
          </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {projects.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">Budget vs Spent Insight</h2>
               <div className="h-72">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} tickFormatter={(val) => `$${val/1000}k`} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" />
                      <Bar dataKey="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Spent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
               <h2 className="text-lg font-bold text-slate-900 mb-6">Status Breakdown</h2>
               <div className="flex-1 min-h-[250px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie data={pieChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                       {pieChartData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                     <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                     <Legend iconType="circle" />
                   </PieChart>
                 </ResponsiveContainer>
               </div>
            </div>
        </div>
      )}

      {/* Projects List */}
      <h2 className="text-xl font-extrabold text-slate-900 mb-6">Active Projects Directory</h2>
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <p className="text-slate-500 font-medium">No projects found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link to={`/projects/${project._id}`} key={project._id} className="block bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                 <div className={`h-full ${project.completionPercentage === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${project.completionPercentage || 0}%` }} />
              </div>
              <div className="flex justify-between items-start mb-4 mt-2">
                <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{project.projectName}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-bold shadow-sm whitespace-nowrap ${project.status === 'Completed' ? 'bg-green-100 text-green-700' : project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}`}>
                  {project.status}
                </span>
              </div>
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{project.description}</p>
              
              <div className="space-y-4">
                 <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>{project.completionPercentage ? project.completionPercentage.toFixed(0) : 0}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                       <div className="bg-slate-800 h-1.5 rounded-full" style={{ width: `${project.completionPercentage || 0}%` }}></div>
                    </div>
                 </div>

                 <div className="flex justify-between items-center text-sm font-medium bg-slate-50 p-3 rounded-xl border border-slate-100/50">
                    <span className="text-slate-500">Budget</span>
                    <span className="text-slate-900 font-bold">${project.budget.toLocaleString()}</span>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-slate-100">
            <h2 className="text-2xl font-black text-slate-900 mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
                <input type="text" required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all" value={newProject.projectName} onChange={e => setNewProject({...newProject, projectName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-slate-900 outline-none transition-all" rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
                   <input type="date" required className="w-full border border-slate-300 rounded-xl p-3 text-slate-600 focus:ring-2 focus:ring-slate-900 outline-none" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                 </div>
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
                   <input type="date" required className="w-full border border-slate-300 rounded-xl p-3 text-slate-600 focus:ring-2 focus:ring-slate-900 outline-none" value={newProject.endDate} onChange={e => setNewProject({...newProject, endDate: e.target.value})} />
                 </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Total Budget ($)</label>
                <input type="number" required className="w-full border border-slate-300 rounded-xl p-3 focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={newProject.budget} onChange={e => setNewProject({...newProject, budget: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:shadow-lg shadow-slate-900/20 transition-all">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

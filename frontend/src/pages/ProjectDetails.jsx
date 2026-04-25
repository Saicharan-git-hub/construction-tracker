import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle2, Circle, Clock, DollarSign, Calendar, Trash2, Edit3, Save, X } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [taskForm, setTaskForm] = useState({ taskName: '', deadline: '', priority: 'Medium' });
  const [expenseForm, setExpenseForm] = useState({ amount: '', description: '' });
  
  // Editing state for Task Progress
  const [editingTask, setEditingTask] = useState(null);
  const [editProgress, setEditProgress] = useState(0);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      setTaskForm({ taskName: '', deadline: '', priority: 'Medium' });
      fetchProject();
    } catch (err) { console.error(err); }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { ...expenseForm, project: id });
      setExpenseForm({ amount: '', description: '' });
      fetchProject();
    } catch (err) { console.error(err); }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'In Progress' : currentStatus === 'In Progress' ? 'Completed' : 'Pending';
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus, progressPercentage: newStatus === 'Completed' ? 100 : undefined });
      fetchProject();
    } catch (err) { console.error(err); alert(err.response?.data?.message || 'Error updating task'); }
  };

  const saveTaskProgress = async (taskId) => {
    try {
      await api.put(`/tasks/${taskId}`, { progressPercentage: editProgress, status: editProgress === 100 ? 'Completed' : undefined });
      setEditingTask(null);
      fetchProject();
    } catch(err) { console.error(err); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      fetchProject();
    } catch(err) { console.error(err); }
  };

  const handleDeleteExpense = async (expId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await api.delete(`/expenses/${expId}`);
      fetchProject();
    } catch(err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 font-medium">Loading project data...</div>;
  if (!data?.project) return <div className="text-center py-20 text-red-500 font-medium">Project not found</div>;

  const { project, tasks, expenses, totalExpense, budgetUtilized, completionPercentage } = data;

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'bg-red-100 text-red-700 border-red-200';
    if (priority === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
            <div className={`h-full ${completionPercentage === 100 ? 'bg-green-500' : 'bg-slate-900'}`} style={{ width: `${completionPercentage || 0}%` }} />
        </div>
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6 mt-2">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{project.projectName}</h1>
            <p className="text-slate-500 mt-2 max-w-3xl">{project.description}</p>
          </div>
          <span className="px-5 py-2 text-sm font-bold tracking-wide rounded-full bg-slate-100 text-slate-700 border shadow-sm">
            {project.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-50 p-5 rounded-2xl flex flex-col gap-2 border border-slate-200/60 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><DollarSign className="w-4 h-4"/> Total Budget</span>
            <span className="text-2xl font-black text-slate-900">${project.budget.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl flex flex-col gap-2 border border-slate-200/60 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><DollarSign className="w-4 h-4 text-rose-500"/> Spent Budget</span>
            <span className="text-2xl font-black text-rose-600">${totalExpense.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl flex flex-col gap-2 border border-slate-200/60 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">Budget Utilized</span>
            <span className={`text-2xl font-black ${budgetUtilized > 100 ? 'text-red-600' : 'text-slate-900'}`}>{budgetUtilized.toFixed(1)}%</span>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
               <div className={`h-1.5 rounded-full ${budgetUtilized > 100 ? 'bg-red-500' : budgetUtilized > 85 ? 'bg-amber-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(budgetUtilized, 100)}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-50 p-5 rounded-2xl flex flex-col gap-2 border border-slate-200/60 shadow-sm">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2"><Calendar className="w-4 h-4"/> Deadline</span>
            <span className="text-xl font-bold text-slate-900">{new Date(project.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Project Tasks ({tasks.length})</h2>
          
          { (user?.role === 'Manager' || user?.role === 'Engineer') && (
            <form onSubmit={handleCreateTask} className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
              <input type="text" placeholder="What needs to be done?" required className="w-full border-slate-300 rounded-lg p-2.5 text-sm focus:ring-slate-900 outline-none border" value={taskForm.taskName} onChange={e => setTaskForm({...taskForm, taskName: e.target.value})} />
              <div className="flex gap-2">
                 <input type="date" required className="flex-1 border-slate-300 rounded-lg p-2.5 text-sm text-slate-600 border" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
                 <select className="flex-1 border-slate-300 rounded-lg p-2.5 text-sm border bg-white" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                 </select>
              </div>
              <button type="submit" className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors">Add Task</button>
            </form>
          )}

          <div className="space-y-3 flex-1">
            {tasks.map(task => (
              <div key={task._id} className="flex flex-col p-4 border border-slate-200/60 rounded-xl bg-white hover:border-slate-300 transition-colors shadow-sm group">
                <div className="flex items-start justify-between gap-3">
                   <div className="flex items-start gap-3">
                     { (user?.role === 'Manager' || user?.role === 'Engineer') ? (
                       <button 
                         onClick={() => updateTaskStatus(task._id, task.status)}
                         className="mt-0.5 focus:outline-none cursor-pointer hover:scale-110 transition-transform"
                       >
                         {task.status === 'Completed' ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : task.status === 'In Progress' ? <Clock className="text-blue-500 w-6 h-6" /> : <Circle className="text-slate-300 w-6 h-6" />}
                       </button>
                     ) : (
                       <div className="mt-0.5">
                         {task.status === 'Completed' ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : task.status === 'In Progress' ? <Clock className="text-blue-500 w-6 h-6" /> : <Circle className="text-slate-300 w-6 h-6" />}
                       </div>
                     )}
                     <div>
                       <p className={`font-bold leading-tight ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.taskName}</p>
                       <p className="text-xs font-semibold text-slate-500 mt-1">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                      { (user?.role === 'Manager' || user?.role === 'Engineer') && (
                         <button onClick={() => handleDeleteTask(task._id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-4 h-4"/>
                         </button>
                      )}
                   </div>
                </div>

                {/* Progress Bar & Editor */}
                <div className="mt-4 pl-9 pr-2">
                   {editingTask === task._id ? (
                      <div className="flex items-center gap-3">
                         <input type="range" min="0" max="100" value={editProgress} onChange={(e)=>setEditProgress(Number(e.target.value))} className="flex-1 accent-slate-900" />
                         <span className="text-xs font-bold w-8">{editProgress}%</span>
                         <button onClick={() => saveTaskProgress(task._id)} className="text-green-600 hover:text-green-700 bg-green-50 p-1 rounded"><Save className="w-4 h-4"/></button>
                         <button onClick={() => setEditingTask(null)} className="text-slate-500 hover:text-slate-700 bg-slate-100 p-1 rounded"><X className="w-4 h-4"/></button>
                      </div>
                   ) : (
                      <div className="flex items-center gap-3 group/progress">
                         <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div className="bg-slate-800 h-2 rounded-full transition-all duration-500" style={{ width: `${task.progressPercentage || 0}%` }}></div>
                         </div>
                         <span className="text-xs font-bold text-slate-600 w-8">{task.progressPercentage || 0}%</span>
                         {(user?.role === 'Manager' || user?.role === 'Engineer') && (
                            <button onClick={() => { setEditingTask(task._id); setEditProgress(task.progressPercentage || 0); }} className="text-slate-400 hover:text-slate-800 opacity-0 group-hover/progress:opacity-100 transition-opacity">
                               <Edit3 className="w-3.5 h-3.5"/>
                            </button>
                         )}
                      </div>
                   )}
                </div>
              </div>
            ))}
            {tasks.length === 0 && (
               <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium">No tasks found. Add one above.</p>
               </div>
            )}
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Financial Entries ({expenses.length})</h2>

          { (user?.role === 'Manager' || user?.role === 'Engineer') && (
            <form onSubmit={handleCreateExpense} className="mb-6 bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 space-y-3">
              <input type="text" placeholder="Item or Service Description" required className="w-full border-slate-300 rounded-lg p-2.5 text-sm outline-none border focus:ring-amber-500" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
              <div className="flex gap-2">
                 <div className="relative flex-1">
                   <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                   <input type="number" placeholder="Cost" required className="w-full border-slate-300 rounded-lg p-2.5 pl-7 text-sm outline-none border focus:ring-amber-500" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
                 </div>
                 <button type="submit" className="bg-amber-500 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-amber-400 hover:shadow-md transition-all">Record</button>
              </div>
            </form>
          )}

          <div className="space-y-3 flex-1 overflow-y-auto pr-2 max-h-[500px]">
            {expenses.map(exp => (
              <div key={exp._id} className="flex items-center justify-between p-4 border border-slate-200/60 rounded-xl bg-white hover:border-slate-300 transition-colors shadow-sm group">
                <div className="flex items-center justify-center bg-rose-50 rounded-lg w-10 h-10 shrink-0 mr-3 border border-rose-100 text-rose-500">
                   <DollarSign className="w-5 h-5"/>
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900 leading-tight">{exp.description}</p>
                  <p className="text-xs font-semibold text-slate-400 mt-1">{new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="font-black text-lg text-slate-900">${exp.amount.toLocaleString()}</span>
                   { (user?.role === 'Manager' || user?.role === 'Engineer') && (
                       <button onClick={() => handleDeleteExpense(exp._id)} className="text-xs text-rose-500 hover:text-rose-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Delete</button>
                   )}
                </div>
              </div>
            ))}
            {expenses.length === 0 && (
               <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-500 font-medium">No expenses recorded yet.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

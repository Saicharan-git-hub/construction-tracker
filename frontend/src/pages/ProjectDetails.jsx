import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { CheckCircle2, Circle, Clock, DollarSign, Calendar } from 'lucide-react';

export default function ProjectDetails() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [taskForm, setTaskForm] = useState({ taskName: '', deadline: '' });
  const [expenseForm, setExpenseForm] = useState({ amount: '', description: '' });

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setData(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', { ...taskForm, project: id });
      setTaskForm({ taskName: '', deadline: '' });
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
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      fetchProject();
    } catch (err) { console.error(err); }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading project data...</div>;
  if (!data?.project) return <div className="text-center py-20 text-red-500">Project not found</div>;

  const { project, tasks, expenses, totalExpense, budgetUtilized, completionPercentage } = data;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Info */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">{project.projectName}</h1>
            <p className="text-slate-500 mt-2 max-w-2xl">{project.description}</p>
          </div>
          <span className="px-4 py-2 text-sm font-semibold rounded-full bg-slate-900 text-white self-start">
            {project.status}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Budget</span>
            <span className="text-xl font-bold text-slate-900">${project.budget.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><DollarSign className="w-4 h-4 text-red-500"/> Spent</span>
            <span className="text-xl font-bold text-red-600">${totalExpense.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Completion</span>
            <span className="text-xl font-bold text-slate-900">{completionPercentage.toFixed(1)}%</span>
            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
               <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg flex flex-col gap-2 border border-slate-100">
            <span className="text-sm font-medium text-slate-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> End Date</span>
            <span className="text-lg font-bold text-slate-900">{new Date(project.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Project Tasks</h2>
          
          {user?.role === 'Manager' && (
            <form onSubmit={handleCreateTask} className="mb-6 flex gap-2">
              <input type="text" placeholder="New task name" required className="flex-1 border rounded-md p-2 text-sm" value={taskForm.taskName} onChange={e => setTaskForm({...taskForm, taskName: e.target.value})} />
              <input type="date" required className=" border rounded-md p-2 text-sm text-slate-600" value={taskForm.deadline} onChange={e => setTaskForm({...taskForm, deadline: e.target.value})} />
              <button type="submit" className="bg-slate-900 text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-slate-800">Add</button>
            </form>
          )}

          <div className="space-y-3">
            {tasks.map(task => (
              <div key={task._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-3">
                   <button 
                     onClick={() => (user?.role === 'Manager' || user?.role === 'Engineer') && updateTaskStatus(task._id, task.status)}
                     className={`focus:outline-none ${(user?.role === 'Manager' || user?.role === 'Engineer') ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
                   >
                     {task.status === 'Completed' ? <CheckCircle2 className="text-green-500 w-6 h-6" /> : task.status === 'In Progress' ? <Clock className="text-blue-500 w-6 h-6" /> : <Circle className="text-slate-300 w-6 h-6" />}
                   </button>
                   <div>
                     <p className={`font-medium ${task.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>{task.taskName}</p>
                     <p className="text-xs text-slate-500">Due: {new Date(task.deadline).toLocaleDateString()}</p>
                   </div>
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded bg-white border border-slate-200 text-slate-600">{task.status}</span>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No tasks found.</p>}
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Project Expenses</h2>

          {user?.role === 'Manager' && (
            <form onSubmit={handleCreateExpense} className="mb-6 flex gap-2">
              <input type="text" placeholder="Item/Service" required className="flex-1 border rounded-md p-2 text-sm" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} />
              <input type="number" placeholder="Cost $" required className="w-24 border rounded-md p-2 text-sm" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} />
              <button type="submit" className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-md font-medium text-sm hover:bg-yellow-400">Add</button>
            </form>
          )}

          <div className="space-y-3">
            {expenses.map(exp => (
              <div key={exp._id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-white">
                <div>
                  <p className="font-medium text-slate-900">{exp.description}</p>
                  <p className="text-xs text-slate-500">{new Date(exp.date).toLocaleDateString()}</p>
                </div>
                <span className="font-bold text-red-600">-${exp.amount.toLocaleString()}</span>
              </div>
            ))}
            {expenses.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No expenses recorded.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

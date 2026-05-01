import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Clock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

const Tasks = () => {
  const { api } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setTasks(res.data.recentTasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Tasks Dashboard</h3>
          <p className="text-slate-500 text-sm mt-1">Overview of all tasks assigned to you across projects.</p>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {tasks.length > 0 ? tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-6 p-6 hover:bg-slate-50 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                task.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
                task.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
              }`}>
                {task.status === 'COMPLETED' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h4 className={`font-bold ${task.status === 'COMPLETED' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    task.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 
                    task.status === 'IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {task.project.name}
                  </span>
                  <span className={`text-xs font-semibold ${
                    task.priority === 'HIGH' ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {task.priority} Priority
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center justify-end gap-2 text-xs font-medium text-slate-500 mb-1">
                  <Clock size={14} />
                  {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'No due date'}
                </div>
                {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED' && (
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider bg-rose-50 px-2 py-0.5 rounded">
                    Overdue
                  </span>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-20">
              <CheckSquare size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-500">No tasks assigned to you yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tasks;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="card flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard = () => {
  const { api } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [api]);

  if (loading) return <div className="flex items-center justify-center h-full">Loading...</div>;

  const stats = [
    { title: 'Total Tasks', value: data?.stats.total || 0, icon: Briefcase, color: 'bg-indigo-500' },
    { title: 'In Progress', value: data?.stats.inProgress || 0, icon: Clock, color: 'bg-blue-500' },
    { title: 'Completed', value: data?.stats.completed || 0, icon: CheckCircle2, color: 'bg-emerald-500' },
    { title: 'Overdue', value: data?.stats.overdue || 0, icon: AlertCircle, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Recent Tasks</h3>
            <button 
              onClick={() => navigate('/tasks')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {data?.recentTasks.length > 0 ? data.recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  task.status === 'COMPLETED' ? 'bg-emerald-500' : 
                  task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-slate-300'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-500">{task.project.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Due</p>
                  <p className="text-xs font-medium text-slate-600">
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-8">No recent tasks</p>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800">Active Projects</h3>
            <button 
              onClick={() => navigate('/projects')}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View all <ArrowRight size={16} />
            </button>
          </div>
          <div className="space-y-4">
            {data?.recentProjects.length > 0 ? data.recentProjects.map((project) => (
              <div key={project.id} className="group flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{project.name}</p>
                    <p className="text-xs text-slate-500">Updated {format(new Date(project.updatedAt), 'MMM d')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="p-2 rounded-full text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-100 transition-all"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            )) : (
              <p className="text-center text-slate-400 py-8">No active projects</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

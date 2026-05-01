import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ChevronLeft, Save, Loader2 } from 'lucide-react';

const CreateTask = () => {
  const { projectId } = useParams();
  const { api } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newTask, setNewTask] = useState({ 
    title: '', 
    description: '', 
    priority: 'MEDIUM', 
    assigneeId: '', 
    dueDate: '' 
  });

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${projectId}`);
      setProject(res.data);
    } catch (err) {
      console.error(err);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post(`/tasks/${projectId}`, newTask);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      alert('Error creating task');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>;

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Link 
        to={`/projects/${projectId}`} 
        className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-8 font-medium text-sm"
      >
        <ChevronLeft size={16} />
        Back to {project.name}
      </Link>

      <div className="card p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
          <p className="text-slate-500 mt-1">Fill in the details to assign a new task to your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Task Title</label>
            <input 
              className="w-full" 
              placeholder="What needs to be done?"
              required 
              value={newTask.title} 
              onChange={e => setNewTask({...newTask, title: e.target.value})} 
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Description</label>
            <textarea 
              className="w-full h-32" 
              placeholder="Add more context to this task..."
              value={newTask.description} 
              onChange={e => setNewTask({...newTask, description: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">Priority Level</label>
              <select 
                className="w-full" 
                value={newTask.priority} 
                onChange={e => setNewTask({...newTask, priority: e.target.value})}
              >
                <option value="LOW">Low Priority</option>
                <option value="MEDIUM">Medium Priority</option>
                <option value="HIGH">High Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-slate-700">Assign To</label>
              <select 
                className="w-full" 
                value={newTask.assigneeId} 
                onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}
              >
                <option value="">Unassigned</option>
                {project.members.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700">Due Date</label>
            <input 
              type="date" 
              className="w-full" 
              value={newTask.dueDate} 
              onChange={e => setNewTask({...newTask, dueDate: e.target.value})} 
            />
          </div>

          <div className="flex gap-4 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => navigate(`/projects/${projectId}`)} 
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;

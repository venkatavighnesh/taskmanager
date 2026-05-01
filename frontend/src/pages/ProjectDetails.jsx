import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  Users, 
  ListTodo, 
  Clock, 
  CheckCircle2, 
  MoreVertical,
  UserPlus,
  Loader2,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const { api, user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMember, setNewMember] = useState({ email: '', role: 'MEMBER' });

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

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${projectId}/members`, newMember);
      setShowMemberModal(false);
      setNewMember({ email: '', role: 'MEMBER' });
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status });
      fetchProject();
    } catch (err) {
      console.error("TASK UPDATE FAILED:", err);
      if (!err.response) {
        alert("Network Error: Could not reach the server. Please check if the backend is running.");
      } else {
        const status = err.response?.status;
        const message = err.response?.data?.message || err.response?.data?.error || 'Error updating task';
        alert(`[${status}] ${message}`);
      }
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" size={32} /></div>;

  const isAdmin = project.members.find(m => m.userId === user.id)?.role === 'ADMIN';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold mb-2">
            <Link to="/projects" className="hover:underline">Projects</Link>
            <span>/</span>
            <span>Detail</span>
            <span className={`ml-4 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              isAdmin ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {isAdmin ? 'Admin' : 'Member'}
            </span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{project.name}</h2>
          <p className="text-slate-500 mt-2 max-w-2xl">{project.description}</p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button 
              onClick={() => setShowMemberModal(true)}
              className="btn-secondary py-2 px-4 flex items-center gap-2"
            >
              <UserPlus size={18} />
              Invite Team
            </button>
          )}
          {isAdmin && (
            <button 
              onClick={() => navigate(`/projects/${projectId}/tasks/new`)}
              className="btn-primary py-2 px-4 flex items-center gap-2"
            >
              <Plus size={18} />
              New Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('tasks')}
          className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${
            activeTab === 'tasks' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Tasks
          {activeTab === 'tasks' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('team')}
          className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${
            activeTab === 'team' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Team Members
          {activeTab === 'team' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />}
        </button>
      </div>

      {activeTab === 'tasks' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['TODO', 'IN_PROGRESS', 'COMPLETED'].map(status => (
            <div key={status} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {status.replace('_', ' ')} • {project.tasks.filter(t => t.status === status).length}
                </h4>
              </div>
              <div className="space-y-4">
                {project.tasks.filter(t => t.status === status).map(task => (
                  <div key={task.id} className="card p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <span className={`badge ${
                        task.priority === 'HIGH' ? 'bg-rose-50 text-rose-600' : 
                        task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {task.priority}
                      </span>
                      <select 
                        className={`text-xs border-none bg-transparent font-semibold cursor-pointer ${
                          (isAdmin || task.assigneeId === user.id || task.creatorId === user.id) 
                          ? 'text-slate-500' 
                          : 'text-slate-300 pointer-events-none'
                        }`}
                        value={task.status}
                        disabled={!(isAdmin || task.assigneeId === user.id || task.creatorId === user.id)}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                    <h5 className="font-bold text-slate-800">{task.title}</h5>
                    <p className="text-sm text-slate-500">{task.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock size={14} />
                        {task.dueDate ? format(new Date(task.dueDate), 'MMM d') : 'No date'}
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600" title={task.assignee?.name || 'Unassigned'}>
                        {task.assignee?.name ? task.assignee.name[0].toUpperCase() : '?'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card max-w-3xl overflow-hidden p-0">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {project.members.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        {member.user.name ? member.user.name[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{member.user.name}</p>
                        <p className="text-xs text-slate-500">{member.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      member.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-600'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">
                    {format(new Date(member.user.createdAt), 'MMM d, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Invite Team Member</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Email Address</label>
                <input type="email" required className="w-full" placeholder="user@example.com" value={newMember.email} onChange={e => setNewMember({...newMember, email: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Role</label>
                <select className="w-full" value={newMember.role} onChange={e => setNewMember({...newMember, role: e.target.value})}>
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowMemberModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;

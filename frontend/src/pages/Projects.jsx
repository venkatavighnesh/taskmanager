import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Folder, Users, ListTodo, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Projects = () => {
  const { api } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      alert('Error creating project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Your Projects</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary py-2 px-4 flex items-center gap-2"
        >
          <Plus size={18} />
          Create Project
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-600" size={32} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link key={project.id} to={`/projects/${project.id}`} className="card hover:border-indigo-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Folder size={24} />
                </div>
                <ChevronRight size={20} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
              </div>
              <h4 className="font-bold text-slate-900 mb-2">{project.name}</h4>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">{project.description || 'No description provided.'}</p>
              
              <div className="flex items-center gap-4 border-t border-slate-50 pt-4">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <ListTodo size={14} />
                  {project._count.tasks} Tasks
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Users size={14} />
                  {project._count.members} Members
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
              <Folder size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">No projects found. Create your first one!</p>
            </div>
          )}
        </div>
      )}

      {/* Simple Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-6">Create New Project</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Project Name</label>
                <input 
                  className="w-full"
                  required
                  placeholder="e.g. Website Redesign"
                  value={newProject.name}
                  onChange={e => setNewProject({...newProject, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea 
                  className="w-full h-24"
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={e => setNewProject({...newProject, description: e.target.value})}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { getErrorMessage } from '../services/api';
import ProjectForm from '../components/projects/ProjectForm';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    userService
      .getAll()
      .then((res) => setUsers(res.users || []))
      .catch(() => {});
  }, []);

  const handleCreate = async (payload) => {
    setLoading(true);
    try {
      const res = await projectService.create(payload);
      toast.success('Project created successfully!');
      navigate(`/projects/${res.project._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to create project'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          Create New Project
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Define project timelines, assign a project manager, and assemble your delivery team.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-8">
        <ProjectForm
          users={users}
          onSubmit={handleCreate}
          onCancel={() => navigate('/projects')}
          loading={loading}
          submitLabel="Create Project"
        />
      </div>
    </div>
  );
}

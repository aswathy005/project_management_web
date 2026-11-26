import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FolderKanban, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { canManageProject, isManagerOrAdmin } from '../utils/permissions';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectForm from '../components/projects/ProjectForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [editingProject, setEditingProject] = useState(null);
  const [saving, setSaving] = useState(false);

  const [deletingProject, setDeletingProject] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await projectService.getAll({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
      });
      setProjects(data.projects || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load projects'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    userService
      .getAll()
      .then((res) => setUsers(res.users || []))
      .catch(() => {});
  }, []);

  const handleUpdate = async (payload) => {
    if (!editingProject) return;
    setSaving(true);
    try {
      await projectService.update(editingProject._id, payload);
      toast.success('Project updated successfully');
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;
    setDeleting(true);
    try {
      await projectService.remove(deletingProject._id);
      toast.success('Project deleted');
      setDeletingProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track milestones, deadlines, and team assignments across active initiatives.
          </p>
        </div>
        {isManagerOrAdmin(user) && (
          <Link to="/projects/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name, description, or tag..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <Filter className="h-3.5 w-3.5" />
            Filter:
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner label="Loading projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try adjusting your search criteria or launch a new project for your team."
          action={
            isManagerOrAdmin(user) && (
              <Link to="/projects/new">
                <Button>
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              canEdit={canManageProject(user, project)}
              onEdit={setEditingProject}
              onDelete={setDeletingProject}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal
        isOpen={Boolean(editingProject)}
        onClose={() => setEditingProject(null)}
        title="Edit Project"
        subtitle="Modify project scope, dates, status, or assigned team"
        size="lg"
      >
        <ProjectForm
          initialData={editingProject}
          users={users}
          onSubmit={handleUpdate}
          onCancel={() => setEditingProject(null)}
          loading={saving}
          submitLabel="Update Project"
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingProject)}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.name}"? All associated tasks and comments will be permanently removed.`}
        loading={deleting}
      />
    </div>
  );
}

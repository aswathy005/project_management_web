import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Pencil,
  Trash2,
  Plus,
  Users,
  Activity as ActivityIcon,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { projectService } from '../services/projectService';
import { taskService } from '../services/taskService';
import { userService } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canManageProject } from '../utils/permissions';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProjectForm from '../components/projects/ProjectForm';
import TaskTable from '../components/tasks/TaskTable';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editOpen, setEditOpen] = useState(false);
  const [savingProject, setSavingProject] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProject, setDeletingProject] = useState(false);

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [savingTask, setSavingTask] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const loadDetails = useCallback(async () => {
    try {
      const [projRes, usersRes] = await Promise.all([
        projectService.getById(id),
        userService.getAll(),
      ]);
      setProject(projRes.project);
      setTasks(projRes.tasks || []);
      setActivities(projRes.activities || []);
      setUsers(usersRes.users || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load project details'));
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  const handleUpdateProject = async (payload) => {
    setSavingProject(true);
    try {
      await projectService.update(id, payload);
      toast.success('Project updated');
      setEditOpen(false);
      loadDetails();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingProject(false);
    }
  };

  const handleDeleteProject = async () => {
    setDeletingProject(true);
    try {
      await projectService.remove(id);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setDeletingProject(false);
    }
  };

  const handleSaveTask = async (payload) => {
    setSavingTask(true);
    try {
      if (editingTask) {
        await taskService.update(editingTask._id, payload);
        toast.success('Task updated');
      } else {
        await taskService.create({ ...payload, project: id });
        toast.success('Task created');
      }
      setTaskModalOpen(false);
      setEditingTask(null);
      loadDetails();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingTask(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateStatus(taskId, status);
      toast.success(`Task moved to ${status}`);
      loadDetails();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await taskService.remove(deletingTask._id);
      toast.success('Task deleted');
      setDeletingTask(null);
      loadDetails();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading || !project) {
    return <LoadingSpinner fullPage label="Loading project workspace..." />;
  }

  const canEdit = canManageProject(user, project);
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            All Projects
          </Link>
          <div className="mt-2 flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {project.name}
            </h1>
            <Badge variant={project.status}>{project.status}</Badge>
            <Badge variant={project.priority}>{project.priority}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            {project.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
          {canEdit && (
            <>
              <Button variant="secondary" onClick={() => setEditOpen(true)}>
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="danger" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Progress & Timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Delivery Progress</h2>
            <span className="text-lg font-bold text-indigo-600">{project.progress || 0}%</span>
          </div>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                project.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Start Date</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(project.startDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Deadline</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formatDate(project.deadline)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Tasks Done</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {completedTasks} / {tasks.length}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Project Manager</p>
              <div className="mt-1 flex items-center gap-2">
                <Avatar
                  name={project.projectManager?.name}
                  color={project.projectManager?.avatarColor}
                  size="xs"
                />
                <span className="truncate text-sm font-semibold text-slate-800">
                  {project.projectManager?.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Users className="h-4 w-4 text-indigo-600" />
              Team Members ({project.teamMembers?.length || 0})
            </h2>
          </div>
          <div className="max-h-40 space-y-2.5 overflow-y-auto pr-1">
            {(project.teamMembers || []).map((member) => (
              <div key={member._id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Avatar name={member.name} color={member.avatarColor} size="xs" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{member.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{member.jobTitle}</p>
                  </div>
                </div>
                <Badge variant={member.role}>{member.role}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Project Tasks ({tasks.length})
          </h2>
          <Link
            to="/kanban"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View on Kanban Board →
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-10 text-center text-sm text-slate-500">
            No tasks in this project yet. Click &quot;Add Task&quot; to create one.
          </div>
        ) : (
          <TaskTable
            tasks={tasks}
            showProject={false}
            onView={(t) => setViewingTaskId(t._id)}
            onEdit={(t) => {
              setEditingTask(t);
              setTaskModalOpen(true);
            }}
            onDelete={setDeletingTask}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      {/* Project Activity Timeline */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
        <div className="mb-4 flex items-center gap-2">
          <ActivityIcon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Project Activity History</h2>
        </div>

        {activities.length === 0 ? (
          <p className="text-sm text-slate-500">No activity logged for this project yet.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act._id} className="flex items-start gap-3">
                <Avatar name={act.actor?.name} color={act.actor?.avatarColor} size="xs" />
                <div>
                  <p className="text-sm text-slate-700">{act.description}</p>
                  <p className="text-xs text-slate-400">{formatRelativeTime(act.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Project"
        size="lg"
      >
        <ProjectForm
          initialData={project}
          users={users}
          onSubmit={handleUpdateProject}
          onCancel={() => setEditOpen(false)}
          loading={savingProject}
          submitLabel="Save Changes"
        />
      </Modal>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message={`Delete "${project.name}" and all ${tasks.length} associated tasks? This action cannot be undone.`}
        loading={deletingProject}
      />

      <TaskFormModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        projects={[project]}
        users={users}
        defaultProjectId={project._id}
        loading={savingTask}
      />

      <TaskDetailModal
        taskId={viewingTaskId}
        isOpen={Boolean(viewingTaskId)}
        onClose={() => setViewingTaskId(null)}
        onTaskUpdated={loadDetails}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message={`Delete task "${deletingTask?.title}"?`}
      />
    </div>
  );
}

import { useEffect, useState, useCallback } from 'react';
import { Plus, Search, CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfirmDialog from '../components/common/ConfirmDialog';
import TaskTable from '../components/tasks/TaskTable';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  const [formOpen, setFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getAll({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
        project: projectFilter,
      });
      setTasks(res.tasks || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load tasks'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter, projectFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    Promise.all([projectService.getAll(), userService.getAll()])
      .then(([pRes, uRes]) => {
        setProjects(pRes.projects || []);
        setUsers(uRes.users || []);
      })
      .catch(() => {});
  }, []);

  const handleSaveTask = async (payload) => {
    setSaving(true);
    try {
      if (editingTask) {
        await taskService.update(editingTask._id, payload);
        toast.success('Task updated successfully');
      } else {
        await taskService.create(payload);
        toast.success('Task created successfully');
      }
      setFormOpen(false);
      setEditingTask(null);
      fetchTasks();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateStatus(taskId, status);
      toast.success(`Moved to ${status}`);
      fetchTasks();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setDeleting(true);
    try {
      await taskService.remove(deletingTask._id);
      toast.success('Task deleted');
      setDeletingTask(null);
      fetchTasks();
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage deliverables, priorities, deadlines, and team assignments.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTask(null);
            setFormOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks by title or description..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex flex-wrap gap-2.5">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="In Review">In Review</option>
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

      {loading ? (
        <LoadingSpinner label="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks match your filters"
          description="Create a new task or adjust your filter criteria."
          action={
            <Button
              onClick={() => {
                setEditingTask(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          }
        />
      ) : (
        <TaskTable
          tasks={tasks}
          onView={(t) => setViewingTaskId(t._id)}
          onEdit={(t) => {
            setEditingTask(t);
            setFormOpen(true);
          }}
          onDelete={setDeletingTask}
          onStatusChange={handleStatusChange}
        />
      )}

      <TaskFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        initialData={editingTask}
        projects={projects}
        users={users}
        loading={saving}
      />

      <TaskDetailModal
        taskId={viewingTaskId}
        isOpen={Boolean(viewingTaskId)}
        onClose={() => setViewingTaskId(null)}
        onTaskUpdated={fetchTasks}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"?`}
        loading={deleting}
      />
    </div>
  );
}

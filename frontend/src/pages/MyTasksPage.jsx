import { useEffect, useState, useCallback } from 'react';
import { ListTodo, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import { getErrorMessage } from '../services/api';
import { useDebounce } from '../hooks/useDebounce';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import TaskTable from '../components/tasks/TaskTable';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewingTaskId, setViewingTaskId] = useState(null);

  const loadMyTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getMyTasks({
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter,
      });
      setTasks(res.tasks || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load your tasks'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, priorityFilter]);

  useEffect(() => {
    loadMyTasks();
  }, [loadMyTasks]);

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskService.updateStatus(taskId, status);
      toast.success(`Task marked as ${status}`);
      loadMyTasks();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          Focused view of deliverables assigned directly to you.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your assigned tasks..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex gap-2.5">
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
        <LoadingSpinner label="Loading your tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No assigned tasks found"
          description="Tasks assigned to you across workspace projects will appear here."
        />
      ) : (
        <TaskTable
          tasks={tasks}
          onView={(t) => setViewingTaskId(t._id)}
          onStatusChange={handleStatusChange}
        />
      )}

      <TaskDetailModal
        taskId={viewingTaskId}
        isOpen={Boolean(viewingTaskId)}
        onClose={() => setViewingTaskId(null)}
        onTaskUpdated={loadMyTasks}
      />
    </div>
  );
}

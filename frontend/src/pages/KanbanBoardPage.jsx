import { useEffect, useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Calendar, Filter, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService } from '../services/taskService';
import { projectService } from '../services/projectService';
import { userService } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { formatDate, isOverdue } from '../utils/formatters';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import TaskFormModal from '../components/tasks/TaskFormModal';
import TaskDetailModal from '../components/tasks/TaskDetailModal';

const COLUMNS = [
  {
    id: 'To Do',
    title: 'To Do',
    dot: 'bg-slate-400',
    topBar: 'bg-slate-400',
    bg: 'bg-slate-100/75',
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    dot: 'bg-indigo-500',
    topBar: 'bg-indigo-500',
    bg: 'bg-indigo-50/50',
  },
  {
    id: 'In Review',
    title: 'In Review',
    dot: 'bg-amber-500',
    topBar: 'bg-amber-500',
    bg: 'bg-amber-50/50',
  },
  {
    id: 'Completed',
    title: 'Completed',
    dot: 'bg-emerald-500',
    topBar: 'bg-emerald-500',
    bg: 'bg-emerald-50/50',
  },
];

const PRIORITY_BORDER = {
  Urgent: 'border-l-rose-500',
  High: 'border-l-orange-500',
  Medium: 'border-l-indigo-500',
  Low: 'border-l-slate-300',
};

export default function KanbanBoardPage() {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  const [addOpen, setAddOpen] = useState(false);
  const [defaultStatus, setDefaultStatus] = useState('To Do');
  const [savingTask, setSavingTask] = useState(false);
  const [viewingTaskId, setViewingTaskId] = useState(null);

  const fetchBoardData = useCallback(async () => {
    try {
      const [tRes, pRes, uRes] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        userService.getAll(),
      ]);
      setTasks(tRes.tasks || []);
      setProjects(pRes.projects || []);
      setUsers(uRes.users || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load Kanban board'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoardData();
  }, [fetchBoardData]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (assigneeFilter !== 'All' && (t.assignedTo?._id || 'unassigned') !== assigneeFilter) {
        return false;
      }
      if (projectFilter !== 'All' && t.project?._id !== projectFilter) return false;
      return true;
    });
  }, [tasks, priorityFilter, assigneeFilter, projectFilter]);

  const groupedColumns = useMemo(() => {
    const map = {};
    COLUMNS.forEach((col) => {
      map[col.id] = [];
    });
    filteredTasks.forEach((task) => {
      if (map[task.status]) {
        map[task.status].push(task);
      } else {
        map['To Do'].push(task);
      }
    });
    return map;
  }, [filteredTasks]);

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const nextStatus = destination.droppableId;
    const previousTasks = tasks;

    setTasks((prev) =>
      prev.map((t) =>
        t._id === draggableId ? { ...t, status: nextStatus, order: destination.index } : t
      )
    );

    try {
      await taskService.updateStatus(draggableId, nextStatus, destination.index);
      toast.success(`Moved task to ${nextStatus}`);
    } catch (error) {
      setTasks(previousTasks);
      toast.error(getErrorMessage(error, 'Could not update task status'));
    }
  };

  const handleCreateTask = async (payload) => {
    setSavingTask(true);
    try {
      const res = await taskService.create(payload);
      setTasks((prev) => [res.task, ...prev]);
      toast.success('Task added to board');
      setAddOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingTask(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage label="Loading Kanban board..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kanban Board</h1>
          <p className="mt-1 text-sm text-slate-500">
            Drag and drop tasks across stages to update project progress in real time.
          </p>
        </div>
        <Button
          onClick={() => {
            setDefaultStatus('To Do');
            setAddOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          Filters:
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Projects</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Assignees</option>
          <option value="unassigned">Unassigned</option>
          {users.map((u) => (
            <option key={u._id} value={u._id}>
              {u.name}
            </option>
          ))}
        </select>

        {(priorityFilter !== 'All' || assigneeFilter !== 'All' || projectFilter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setPriorityFilter('All');
              setAssigneeFilter('All');
              setProjectFilter('All');
            }}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Board Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          {COLUMNS.map((col) => {
            const colTasks = groupedColumns[col.id] || [];
            return (
              <div
                key={col.id}
                className={`relative flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 ${col.bg} p-3.5`}
              >
                <div className={`absolute inset-x-0 top-0 h-1 ${col.topBar}`} />
                <div className="mb-3 flex items-center justify-between px-1 pt-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <h3 className="text-sm font-semibold text-slate-800">{col.title}</h3>
                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 shadow-xs tabular-nums">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDefaultStatus(col.id);
                      setAddOpen(true);
                    }}
                    className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-white hover:text-indigo-600"
                    title={`Add task to ${col.title}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <Droppable droppableId={col.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-3 rounded-xl transition-colors ${
                        snapshot.isDraggingOver ? 'bg-indigo-100/50 ring-2 ring-indigo-300/70 p-1.5' : ''
                      }`}
                    >
                      {colTasks.map((task, index) => {
                        const overdue = isOverdue(task.dueDate, task.status);
                        return (
                          <Draggable key={task._id} draggableId={task._id} index={index}>
                            {(dragProvided, dragSnapshot) => (
                              <div
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                onClick={() => setViewingTaskId(task._id)}
                                className={`group cursor-pointer rounded-xl border border-slate-200/90 border-l-[3px] ${
                                  PRIORITY_BORDER[task.priority] || PRIORITY_BORDER.Medium
                                } bg-white p-3.5 shadow-card transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-card-hover ${
                                  dragSnapshot.isDragging ? 'rotate-1 shadow-2xl ring-2 ring-indigo-500' : ''
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <Badge variant={task.priority}>{task.priority}</Badge>
                                  <span
                                    {...dragProvided.dragHandleProps}
                                    onClick={(e) => e.stopPropagation()}
                                    className="rounded p-0.5 text-slate-300 hover:text-slate-600"
                                    title="Drag card"
                                  >
                                    <GripVertical className="h-4 w-4" />
                                  </span>
                                </div>

                                <h4 className="mt-2.5 text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                  {task.title}
                                </h4>

                                {task.project?.name && (
                                  <p className="mt-1 truncate text-[11px] font-medium text-slate-400">
                                    {task.project.name}
                                  </p>
                                )}

                                <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5">
                                  {task.assignedTo ? (
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <Avatar
                                        name={task.assignedTo.name}
                                        color={task.assignedTo.avatarColor}
                                        size="xs"
                                      />
                                      <span className="truncate text-xs text-slate-600">
                                        {task.assignedTo.name.split(' ')[0]}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-[11px] text-slate-400">Unassigned</span>
                                  )}

                                  <span
                                    className={`inline-flex items-center gap-1 text-[11px] font-medium tabular-nums ${
                                      overdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
                                    }`}
                                  >
                                    <Calendar className="h-3 w-3" />
                                    {formatDate(task.dueDate)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      <TaskFormModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreateTask}
        projects={projects}
        users={users}
        defaultStatus={defaultStatus}
        loading={savingTask}
      />

      <TaskDetailModal
        taskId={viewingTaskId}
        isOpen={Boolean(viewingTaskId)}
        onClose={() => setViewingTaskId(null)}
        onTaskUpdated={fetchBoardData}
      />
    </div>
  );
}

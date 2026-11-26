import { Eye, Pencil, Trash2, Calendar } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate, isOverdue } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { canDeleteTask } from '../../utils/permissions';

export default function TaskTable({
  tasks = [],
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  showProject = true,
}) {
  const { user } = useAuth();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200/80 text-left">
          <thead className="bg-slate-50/80">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Task
              </th>
              {showProject && (
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Project
                </th>
              )}
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Assignee
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Priority
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Due Date
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status);
              return (
                <tr
                  key={task._id}
                  className="transition-colors hover:bg-slate-50/70"
                >
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => onView(task)}
                      className="text-left font-medium text-slate-900 hover:text-indigo-600 transition-colors"
                    >
                      {task.title}
                    </button>
                    {task.description && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">
                        {task.description}
                      </p>
                    )}
                  </td>
                  {showProject && (
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {task.project?.name || '—'}
                    </td>
                  )}
                  <td className="px-5 py-4">
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar
                          name={task.assignedTo.name}
                          color={task.assignedTo.avatarColor}
                          size="xs"
                        />
                        <span className="text-sm text-slate-700">{task.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={task.priority}>{task.priority}</Badge>
                  </td>
                  <td className="px-5 py-4">
                    {onStatusChange ? (
                      <select
                        value={task.status}
                        onChange={(e) => onStatusChange(task._id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="To Do">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="In Review">In Review</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <Badge variant={task.status}>{task.status}</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        overdue ? 'text-rose-600 font-semibold' : 'text-slate-600'
                      }`}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(task.dueDate)}
                      {overdue && ' (Overdue)'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onView(task)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                        title="View task & comments"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(task)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                          title="Edit task"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {onDelete && canDeleteTask(user, task) && (
                        <button
                          type="button"
                          onClick={() => onDelete(task)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          title="Delete task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

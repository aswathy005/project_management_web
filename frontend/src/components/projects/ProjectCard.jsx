import { Link } from 'react-router-dom';
import { Calendar, CheckCircle2, Users, ArrowUpRight, Pencil, Trash2 } from 'lucide-react';
import Badge from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate } from '../../utils/formatters';

const PRIORITY_STRIP = {
  Urgent: 'from-rose-500 to-pink-500',
  High: 'from-orange-500 to-amber-500',
  Medium: 'from-indigo-500 to-sky-500',
  Low: 'from-slate-300 to-slate-400',
};

export default function ProjectCard({ project, canEdit, onEdit, onDelete }) {
  const members = project.teamMembers || [];
  const totalTasks = project.taskStats?.total ?? 0;
  const completedTasks = project.taskStats?.completed ?? 0;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-card-hover animate-fade-in-up">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${
          PRIORITY_STRIP[project.priority] || PRIORITY_STRIP.Medium
        }`}
      />
      <div>
        <div className="flex items-start justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={project.status}>{project.status}</Badge>
            <Badge variant={project.priority}>{project.priority}</Badge>
          </div>

          {canEdit && (
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
                title="Edit project"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <Link
          to={`/projects/${project._id}`}
          className="mt-3.5 flex items-center justify-between gap-2 group/link"
        >
          <h3 className="text-base font-semibold text-slate-900 group-hover/link:text-indigo-600 transition-colors line-clamp-1">
            {project.name}
          </h3>
          <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 group-hover/link:text-indigo-600 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </Link>

        <p className="mt-1.5 text-sm text-slate-500 line-clamp-2 min-h-[40px]">
          {project.description}
        </p>

        {project.tags?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100/90 px-2 py-0.5 text-[11px] font-medium text-slate-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium text-slate-600">Progress</span>
            <span className="font-bold text-slate-900 tabular-nums">
              {project.progress || 0}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                project.progress === 100
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600'
              }`}
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center -space-x-2">
          {members.slice(0, 4).map((m) => (
            <Avatar key={m._id} name={m.name} color={m.avatarColor} size="xs" />
          ))}
          {members.length > 4 && (
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-600 ring-2 ring-white">
              +{members.length - 4}
            </span>
          )}
          {members.length === 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="h-3.5 w-3.5" /> Unassigned
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
          <span className="flex items-center gap-1" title="Completed / Total Tasks">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {completedTasks}/{totalTasks}
          </span>
          <span className="flex items-center gap-1" title="Deadline">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            {formatDate(project.deadline)}
          </span>
        </div>
      </div>
    </div>
  );
}

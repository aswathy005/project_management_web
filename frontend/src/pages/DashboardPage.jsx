import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderKanban,
  Activity as ActivityIcon,
  CheckCircle2,
  ListChecks,
  Clock,
  AlertCircle,
  TrendingUp,
  Layers,
  Calendar,
  ArrowRight,
  Plus,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { dashboardService } from '../services/dashboardService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { isManagerOrAdmin } from '../utils/permissions';
import { formatDate, formatRelativeTime, isOverdue } from '../utils/formatters';
import StatCard from '../components/common/StatCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import ProjectProgressChart from '../components/dashboard/ProjectProgressChart';
import TaskStatusChart from '../components/dashboard/TaskStatusChart';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await dashboardService.getStats();
        setData(res);
      } catch (error) {
        toast.error(getErrorMessage(error, 'Failed to load dashboard metrics'));
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return <LoadingSpinner fullPage label="Loading workspace analytics..." />;
  }

  const {
    stats,
    charts,
    recentActivities,
    upcomingDeadlines,
    myAssignedTasks,
    teamProductivity,
  } = data;

  return (
    <div className="space-y-6">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#be2f2e]/20 bg-gradient-to-r from-[#be2f2e] via-[#c75144] to-[#e6b794] p-6 text-white shadow-lg">
        <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-[#e6b794]/30 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-[11px] font-semibold text-white ring-1 ring-white/25">
              <Sparkles className="h-3 w-3 text-[#e6b794]" /> {user?.role} Workspace
            </span>
            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="mt-1 text-sm text-white/90">
              {stats.activeProjects} active projects • {stats.pendingTasks} open tasks •{' '}
              <span className="font-semibold text-white underline decoration-[#e6b794] underline-offset-4">
                {stats.overallProgress}% average progress
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/kanban">
              <Button className="bg-white/20 text-white hover:bg-white/30 ring-1 ring-white/35 shadow-none backdrop-blur-sm">
                Open Kanban
              </Button>
            </Link>
            {isManagerOrAdmin(user) && (
              <Link to="/projects/new">
                <Button className="bg-white text-[#be2f2e] hover:bg-[#fdf3ec] shadow-md font-semibold">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 8 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          subtitle={`${stats.activeProjects} active right now`}
          icon={FolderKanban}
          accent="indigo"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          subtitle="Currently in progress"
          icon={Layers}
          accent="sky"
        />
        <StatCard
          title="Completed Projects"
          value={stats.completedProjects}
          subtitle="Delivered milestones"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Overall Progress"
          value={`${stats.overallProgress}%`}
          subtitle="Average completion rate"
          icon={TrendingUp}
          accent="violet"
          trend={stats.overallProgress}
        />

        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          subtitle="Across workspace projects"
          icon={ListChecks}
          accent="indigo"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingTasks}
          subtitle="To Do, In Progress & Review"
          icon={Clock}
          accent="amber"
        />
        <StatCard
          title="Completed Tasks"
          value={stats.completedTasks}
          subtitle="Finished deliverables"
          icon={CheckCircle2}
          accent="emerald"
        />
        <StatCard
          title="Overdue Tasks"
          value={stats.overdueTasks}
          subtitle="Requires immediate attention"
          icon={AlertCircle}
          accent="rose"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Project Progress</h2>
              <p className="text-xs text-slate-500">Completion percentage across projects</p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ProjectProgressChart data={charts.projectProgress} />
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">Task Status Breakdown</h2>
            <p className="text-xs text-slate-500">Distribution by workflow stage</p>
          </div>
          <TaskStatusChart data={charts.taskStatus} />
        </div>
      </div>

      {/* My Assigned Tasks & Upcoming Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* My Assigned Tasks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">My Assigned Tasks</h2>
              <p className="text-xs text-slate-500">Your personal priority queue</p>
            </div>
            <Link
              to="/my-tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              All my tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {myAssignedTasks.length === 0 ? (
            <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
              No tasks currently assigned to you.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {myAssignedTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <Link
                      to={task.project?._id ? `/projects/${task.project._id}` : '/my-tasks'}
                      className="block truncate text-sm font-medium text-slate-900 hover:text-indigo-600"
                    >
                      {task.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {task.project?.name} • Due {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={task.priority}>{task.priority}</Badge>
                    <Badge variant={task.status}>{task.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Upcoming Deadlines</h2>
              <p className="text-xs text-slate-500">Nearest incomplete deliverables</p>
            </div>
            <Link
              to="/tasks"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View tasks <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {upcomingDeadlines.length === 0 ? (
            <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
              No pending deadlines!
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcomingDeadlines.map((task) => {
                const overdue = isOverdue(task.dueDate, task.status);
                return (
                  <div
                    key={task._id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          overdue
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {task.title}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {task.assignedTo?.name || 'Unassigned'} • {task.project?.name}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        className={`text-xs font-semibold ${
                          overdue ? 'text-rose-600' : 'text-slate-700'
                        }`}
                      >
                        {formatDate(task.dueDate)}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {overdue ? 'Overdue' : task.status}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Team Productivity & Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Team Productivity Overview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Team Productivity Overview</h2>
              <p className="text-xs text-slate-500">Completed vs total tasks per member</p>
            </div>
            <Link
              to="/team"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              Manage team <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {teamProductivity.map((member) => (
              <div key={member._id} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={member.name} color={member.avatarColor} size="xs" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{member.name}</p>
                      <p className="text-[11px] text-slate-500">{member.jobTitle}</p>
                    </div>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="text-xs font-semibold text-slate-900">
                      {member.completedTasks}/{member.totalTasks} tasks
                    </span>
                    <span className="ml-2 text-xs text-indigo-600 font-semibold">
                      ({member.completionRate}%)
                    </span>
                  </div>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
                    style={{ width: `${member.completionRate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
              <p className="text-xs text-slate-500">Latest workspace actions &amp; updates</p>
            </div>
            <ActivityIcon className="h-4 w-4 text-slate-400" />
          </div>

          {recentActivities.length === 0 ? (
            <p className="rounded-xl bg-slate-50 py-8 text-center text-sm text-slate-500">
              No workspace activities recorded yet.
            </p>
          ) : (
            <div className="space-y-4">
              {recentActivities.slice(0, 6).map((act) => (
                <div key={act._id} className="flex items-start gap-3">
                  <Avatar name={act.actor?.name} color={act.actor?.avatarColor} size="xs" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-slate-700 leading-snug">{act.description}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {formatRelativeTime(act.createdAt)}
                      {act.project?.name ? ` • ${act.project.name}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

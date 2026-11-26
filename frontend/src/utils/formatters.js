export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const toDateInputValue = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0];
};

export const formatRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateStr);
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'Completed') return false;
  return new Date(dueDate) < new Date();
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const STATUS_STYLES = {
  Planning: 'bg-slate-100 text-slate-700 ring-slate-200',
  'In Progress': 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'On Hold': 'bg-amber-50 text-amber-700 ring-amber-200',
  Completed: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  'To Do': 'bg-slate-100 text-slate-700 ring-slate-200',
  'In Review': 'bg-amber-50 text-amber-700 ring-amber-200',
};

export const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
  Medium: 'bg-sky-50 text-sky-700 ring-sky-200',
  High: 'bg-orange-50 text-orange-700 ring-orange-200',
  Urgent: 'bg-rose-50 text-rose-700 ring-rose-200',
};

export const ROLE_STYLES = {
  Admin: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'Project Manager': 'bg-violet-50 text-violet-700 ring-violet-200',
  'Team Member': 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

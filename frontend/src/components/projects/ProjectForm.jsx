import { useState, useEffect } from 'react';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { toDateInputValue } from '../../utils/formatters';

export default function ProjectForm({
  initialData = null,
  users = [],
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Save Project',
}) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    deadline: '',
    status: 'Planning',
    priority: 'Medium',
    projectManager: '',
    teamMembers: [],
    tags: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        startDate: toDateInputValue(initialData.startDate),
        deadline: toDateInputValue(initialData.deadline),
        status: initialData.status || 'Planning',
        priority: initialData.priority || 'Medium',
        projectManager: initialData.projectManager?._id || initialData.projectManager || '',
        teamMembers: (initialData.teamMembers || []).map((m) => m._id || m),
        tags: (initialData.tags || []).join(', '),
      });
    }
  }, [initialData]);

  const managers = users.filter(
    (u) => u.role === 'Project Manager' || u.role === 'Admin'
  );

  const toggleMember = (userId) => {
    setForm((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.includes(userId)
        ? prev.teamMembers.filter((id) => id !== userId)
        : [...prev.teamMembers, userId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (form.name.trim().length < 3) {
      setError('Project name must be at least 3 characters.');
      return;
    }
    if (!form.description.trim()) {
      setError('Project description is required.');
      return;
    }
    if (!form.startDate || !form.deadline) {
      setError('Start date and deadline are required.');
      return;
    }
    if (new Date(form.deadline) < new Date(form.startDate)) {
      setError('Deadline cannot be earlier than start date.');
      return;
    }

    onSubmit({
      ...form,
      tags: form.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Project Name <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Customer Portal Redesign"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          required
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe project objectives, deliverables, and scope..."
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Start Date <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Deadline <span className="text-rose-500">*</span>
          </label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Project Manager
          </label>
          <select
            value={form.projectManager}
            onChange={(e) => setForm({ ...form, projectManager: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Select manager (default: you)</option>
            {managers.map((m) => (
              <option key={m._id} value={m._id}>
                {m.name} ({m.role})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Tags (comma-separated)
        </label>
        <input
          type="text"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="e.g., SaaS, React, Security"
          className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Team Members ({form.teamMembers.length} selected)
        </label>
        <div className="grid max-h-48 grid-cols-1 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3 sm:grid-cols-2">
          {users.map((member) => {
            const selected = form.teamMembers.includes(member._id);
            return (
              <button
                key={member._id}
                type="button"
                onClick={() => toggleMember(member._id)}
                className={`flex items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-all ${
                  selected
                    ? 'border-indigo-500 bg-indigo-50/70 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <Avatar name={member.name} color={member.avatarColor} size="xs" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-slate-800">{member.name}</p>
                  <p className="truncate text-[11px] text-slate-500">{member.role}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

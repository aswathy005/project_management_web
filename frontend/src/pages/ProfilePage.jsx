import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const AVATAR_SWATCHES = [
  '#4F46E5',
  '#0EA5E9',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#8B5CF6',
  '#14B8A6',
  '#EF4444',
];

export default function ProfilePage() {
  const { user, updateUserState } = useAuth();

  const [form, setForm] = useState({
    name: user?.name || '',
    jobTitle: user?.jobTitle || '',
    department: user?.department || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatarColor: user?.avatarColor || '#4F46E5',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUserState(res.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your public profile details and workspace identity.
        </p>
      </div>

      {/* Header Card */}
      <div className="flex flex-col items-start gap-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:flex-row sm:items-center">
        <Avatar name={form.name} color={form.avatarColor} size="xl" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <Badge variant={user?.role}>{user?.role}</Badge>
          </div>
          <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Avatar Accent:</span>
            {AVATAR_SWATCHES.map((hex) => (
              <button
                key={hex}
                type="button"
                onClick={() => setForm({ ...form, avatarColor: hex })}
                style={{ backgroundColor: hex }}
                className={`h-5 w-5 rounded-full transition-transform ${
                  form.avatarColor === hex ? 'scale-125 ring-2 ring-slate-900 ring-offset-1' : ''
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Job Title</label>
            <input
              type="text"
              value={form.jobTitle}
              onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
            <input
              type="text"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            placeholder="Tell your team about your focus areas..."
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="submit" loading={saving}>
            Save Profile
          </Button>
        </div>
      </form>
    </div>
  );
}

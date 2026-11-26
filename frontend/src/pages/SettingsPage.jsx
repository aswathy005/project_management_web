import { useState } from 'react';
import { Lock, BellRing, Sliders } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { authService } from '../services/authService';
import { getErrorMessage } from '../services/api';
import Button from '../components/common/Button';

export default function SettingsPage() {
  const { user, updateUserState } = useAuth();
  const { sidebarCollapsed, setSidebarCollapsed } = useUI();

  const [prefs, setPrefs] = useState({
    emailNotifications: user?.preferences?.emailNotifications ?? true,
    taskUpdates: user?.preferences?.taskUpdates ?? true,
    deadlineReminders: user?.preferences?.deadlineReminders ?? true,
    compactSidebar: sidebarCollapsed,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [savingPw, setSavingPw] = useState(false);

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await authService.updateProfile({ preferences: prefs });
      updateUserState(res.user);
      setSidebarCollapsed(prefs.compactSidebar);
      toast.success('Workspace preferences saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customize notification alerts, layout behavior, and account security.
        </p>
      </div>

      {/* Preferences */}
      <form
        onSubmit={handleSavePrefs}
        className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <BellRing className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">
            Notification &amp; Workspace Preferences
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              title: 'Email Digests',
              desc: 'Receive daily summary notifications for high-priority tasks.',
            },
            {
              key: 'taskUpdates',
              title: 'Task Status Updates',
              desc: 'Get notified when tasks you created or manage move columns.',
            },
            {
              key: 'deadlineReminders',
              title: 'Deadline Alerts',
              desc: 'Receive automated warnings 48 hours before a task is due.',
            },
            {
              key: 'compactSidebar',
              title: 'Compact Navigation Sidebar',
              desc: 'Default to collapsed icon-only sidebar on desktop screens.',
            },
          ].map((item) => (
            <label
              key={item.key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={prefs[item.key]}
                onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit" loading={savingPrefs}>
            <Sliders className="h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </form>

      {/* Password */}
      <form
        onSubmit={handleChangePassword}
        className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Lock className="h-4 w-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-slate-900">Security &amp; Password</h2>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Current Password
          </label>
          <input
            type="password"
            required
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={savingPw}>
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
}

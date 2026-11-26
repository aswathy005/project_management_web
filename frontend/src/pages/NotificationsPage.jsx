import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, Activity as ActivityIcon, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUI } from '../context/UIContext';
import { notificationService } from '../services/notificationService';
import { activityService } from '../services/activityService';
import { getErrorMessage } from '../services/api';
import { formatRelativeTime } from '../utils/formatters';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import EmptyState from '../components/common/EmptyState';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUI();

  const [tab, setTab] = useState('notifications');
  const [filter, setFilter] = useState('all');
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchNotifications();
    activityService
      .getAll({ limit: 40 })
      .then((res) => setActivities(res.activities || []))
      .catch(() => {});
  }, [fetchNotifications]);

  const handleDelete = async (id) => {
    try {
      await notificationService.remove(id);
      toast.success('Notification removed');
      fetchNotifications();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const visibleNotifications =
    filter === 'unread' ? notifications.filter((n) => !n.isRead) : notifications;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Notifications &amp; Activity
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stay updated on task assignments, status changes, deadlines, and team activity.
          </p>
        </div>

        {tab === 'notifications' && unreadCount > 0 && (
          <Button variant="secondary" onClick={markAllNotificationsRead}>
            <CheckCheck className="h-4 w-4 text-indigo-600" />
            Mark all read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-6">
          <button
            type="button"
            onClick={() => setTab('notifications')}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
              tab === 'notifications'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Notifications ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('activity')}
            className={`border-b-2 pb-3 text-sm font-semibold transition-colors ${
              tab === 'activity'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Activity Timeline
          </button>
        </div>

        {tab === 'notifications' && (
          <div className="flex gap-2 pb-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                filter === 'all'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                filter === 'unread'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Unread
            </button>
          </div>
        )}
      </div>

      {tab === 'notifications' ? (
        visibleNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You have no notifications matching this view right now."
          />
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            {visibleNotifications.map((n) => (
              <div
                key={n._id}
                className={`flex items-start justify-between gap-4 p-4 transition-colors hover:bg-slate-50/70 ${
                  !n.isRead ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div
                  onClick={() => {
                    if (!n.isRead) markNotificationRead(n._id);
                    if (n.link) navigate(n.link);
                  }}
                  className="flex flex-1 cursor-pointer items-start gap-3"
                >
                  <span
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${
                      !n.isRead ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                    <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n._id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600"
                      title="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(n._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    title="Delete notification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activities.length === 0 ? (
        <EmptyState
          icon={ActivityIcon}
          title="No activities yet"
          description="Workspace actions will appear in this timeline."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card">
          <div className="space-y-5">
            {activities.map((act) => (
              <div key={act._id} className="flex items-start gap-3.5">
                <Avatar name={act.actor?.name} color={act.actor?.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800">{act.description}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatRelativeTime(act.createdAt)}
                    {act.project?.name ? ` • ${act.project.name}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  LogOut,
  User,
  Settings,
  ChevronDown,
  FolderKanban,
  CheckSquare,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useDebounce } from '../../hooks/useDebounce';
import { projectService } from '../../services/projectService';
import { taskService } from '../../services/taskService';
import { formatRelativeTime } from '../../utils/formatters';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export default function Topbar() {
  const { user, logout } = useAuth();
  const {
    setMobileMenuOpen,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useUI();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [searchResults, setSearchResults] = useState({ projects: [], tasks: [] });
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const searchRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const runSearch = async () => {
      const q = debouncedSearch.trim();
      if (!q) {
        setSearchResults({ projects: [], tasks: [] });
        return;
      }
      setSearching(true);
      try {
        const [pRes, tRes] = await Promise.all([
          projectService.getAll({ search: q }),
          taskService.getAll({ search: q }),
        ]);
        setSearchResults({
          projects: (pRes.projects || []).slice(0, 4),
          tasks: (tRes.tasks || []).slice(0, 4),
        });
      } catch {
        // ignore search failures
      } finally {
        setSearching(false);
      }
    };
    runSearch();
  }, [debouncedSearch]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-white/50 bg-white/85 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile menu + Global Search */}
      <div className="flex flex-1 items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div ref={searchRef} className="relative w-full max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onFocus={() => setSearchOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchOpen(true);
            }}
            placeholder="Search projects, tasks..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />

          {searchOpen && searchTerm.trim() && (
            <div className="absolute left-0 right-0 top-12 z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-scale-in">
              {searching ? (
                <div className="p-4 text-center text-xs text-slate-500">Searching...</div>
              ) : searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  No matching projects or tasks found.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {searchResults.projects.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400">
                        Projects
                      </p>
                      {searchResults.projects.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchTerm('');
                            navigate(`/projects/${p._id}`);
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FolderKanban className="h-4 w-4 shrink-0 text-indigo-500" />
                            <span className="truncate font-medium text-slate-800">{p.name}</span>
                          </div>
                          <Badge variant={p.status}>{p.status}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div className="p-2">
                      <p className="px-2 py-1 text-[11px] font-semibold uppercase text-slate-400">
                        Tasks
                      </p>
                      {searchResults.tasks.map((t) => (
                        <button
                          key={t._id}
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchTerm('');
                            navigate(t.project?._id ? `/projects/${t.project._id}` : '/tasks');
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckSquare className="h-4 w-4 shrink-0 text-emerald-500" />
                            <span className="truncate font-medium text-slate-800">{t.title}</span>
                          </div>
                          <Badge variant={t.status}>{t.status}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Notifications & User Profile Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 sm:w-96 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-scale-in">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllNotificationsRead}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    You&apos;re all caught up!
                  </div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <button
                      key={n._id}
                      type="button"
                      onClick={() => {
                        if (!n.isRead) markNotificationRead(n._id);
                        setNotifOpen(false);
                        if (n.link) navigate(n.link);
                      }}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                        !n.isRead ? 'bg-indigo-50/40' : ''
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          !n.isRead ? 'bg-indigo-600' : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600 line-clamp-2">{n.message}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <Link
                to="/notifications"
                onClick={() => setNotifOpen(false)}
                className="block border-t border-slate-100 bg-slate-50/70 py-2.5 text-center text-xs font-semibold text-indigo-600 hover:bg-slate-100"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white py-1.5 pl-2 pr-3 transition-colors hover:bg-slate-50"
          >
            <Avatar name={user?.name} color={user?.avatarColor} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user?.name}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">{user?.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 z-40 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl animate-scale-in">
              <div className="border-b border-slate-100 px-4 py-2.5">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Link
                to="/profile"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-400" />
                My Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

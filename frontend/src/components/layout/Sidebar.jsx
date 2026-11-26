import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  PlusSquare,
  CheckSquare,
  Columns3,
  ListTodo,
  Users,
  Bell,
  UserCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { isManagerOrAdmin } from '../../utils/permissions';
import BrandLogo from '../common/BrandLogo';
import Avatar from '../common/Avatar';

export default function Sidebar() {
  const { user } = useAuth();
  const {
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileMenuOpen,
    setMobileMenuOpen,
    unreadCount,
  } = useUI();

  const navGroups = [
    {
      label: 'Workspace',
      items: [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/projects', label: 'Projects', icon: FolderKanban },
        ...(isManagerOrAdmin(user)
          ? [{ to: '/projects/new', label: 'Create Project', icon: PlusSquare }]
          : []),
      ],
    },
    {
      label: 'Execution',
      items: [
        { to: '/tasks', label: 'Tasks', icon: CheckSquare },
        { to: '/kanban', label: 'Kanban Board', icon: Columns3 },
        { to: '/my-tasks', label: 'My Tasks', icon: ListTodo },
      ],
    },
    {
      label: 'Collaboration',
      items: [
        { to: '/team', label: 'Team Members', icon: Users },
        {
          to: '/notifications',
          label: 'Notifications',
          icon: Bell,
          badge: unreadCount,
        },
      ],
    },
    {
      label: 'Account',
      items: [
        { to: '/profile', label: 'Profile', icon: UserCircle },
        { to: '/settings', label: 'Settings', icon: Settings },
      ],
    },
  ];

  const renderLinks = (isMobile = false) => (
    <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-3 py-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          {(!sidebarCollapsed || isMobile) && (
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.label}
            </p>
          )}
          <nav className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/projects'}
                  onClick={() => isMobile && setMobileMenuOpen(false)}
                  title={sidebarCollapsed && !isMobile ? item.label : undefined}
                  className={({ isActive }) =>
                    `relative group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-50 to-indigo-50/40 text-indigo-700 font-semibold ring-1 ring-indigo-100/80'
                        : 'text-slate-600 hover:bg-slate-100/75 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-indigo-600" />
                      )}
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`h-[18px] w-[18px] shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-700'
                          }`}
                        />
                        {(!sidebarCollapsed || isMobile) && (
                          <span className="truncate">{item.label}</span>
                        )}
                      </div>
                      {item.badge > 0 && (!sidebarCollapsed || isMobile) && (
                        <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-[11px] font-semibold text-white shadow-sm shadow-indigo-600/25">
                          {item.badge > 99 ? '99+' : item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r border-white/50 bg-white/90 backdrop-blur-md transition-all duration-200 ${
          sidebarCollapsed ? 'w-[78px]' : 'w-64'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
          <BrandLogo showText={!sidebarCollapsed} />
          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {renderLinks(false)}

        {!sidebarCollapsed && user && (
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2.5">
              <Avatar name={user.name} color={user.avatarColor} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 truncate">{user.name}</p>
                <p className="text-[11px] text-indigo-600 font-medium truncate">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/45 backdrop-blur-[2px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 flex w-72 flex-col bg-white shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderLinks(true)}
          </aside>
        </div>
      )}
    </>
  );
}

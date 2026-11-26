import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Search, Users, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/userService';
import { getErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import { isAdmin } from '../utils/permissions';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AddMemberModal from '../components/team/AddMemberModal';
import MemberProfileModal from '../components/team/MemberProfileModal';

export default function TeamMembersPage() {
  const { user: currentUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [roleFilter, setRoleFilter] = useState('All');

  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [profileMemberId, setProfileMemberId] = useState(null);
  const [deletingMember, setDeletingMember] = useState(null);

  const adminUser = isAdmin(currentUser);

  const loadMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getAll({
        search: debouncedSearch,
        role: roleFilter,
      });
      setMembers(res.users || []);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Failed to load team members'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  const handleAddMember = async (payload, resetForm) => {
    setAdding(true);
    try {
      await userService.create(payload);
      toast.success('Team member added successfully');
      resetForm();
      setAddOpen(false);
      loadMembers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAdding(false);
    }
  };

  const handleRoleChange = async (memberId, nextRole) => {
    try {
      await userService.updateRole(memberId, { role: nextRole });
      toast.success(`Role updated to ${nextRole}`);
      loadMembers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;
    try {
      await userService.remove(deletingMember._id);
      toast.success('Team member removed');
      setDeletingMember(null);
      loadMembers();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Team Members</h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor individual workload, task completion, and workspace roles.
          </p>
        </div>
        {adminUser && (
          <Button onClick={() => setAddOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Member
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name, email, or department..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
        >
          <option value="All">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Project Manager">Project Manager</option>
          <option value="Team Member">Team Member</option>
        </select>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading team members..." />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No team members found"
          description="Try adjusting your search or role filter."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {members.map((member) => {
            const stats = member.stats || {};
            const workloadColor =
              stats.workloadPercent >= 80
                ? 'bg-rose-500'
                : stats.workloadPercent >= 50
                ? 'bg-amber-500'
                : 'bg-emerald-500';

            return (
              <div
                key={member._id}
                className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-card-hover animate-fade-in-up"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500/80 via-violet-500/80 to-sky-500/80" />
                <div>
                  <div className="flex items-start justify-between gap-3 pt-1">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        name={member.name}
                        color={member.avatarColor}
                        size="md"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900">
                          {member.name}
                        </h3>
                        <p className="truncate text-xs text-slate-500">{member.jobTitle}</p>
                        <p className="truncate text-[11px] text-slate-400">{member.email}</p>
                      </div>
                    </div>
                    <Badge variant={member.role}>{member.role}</Badge>
                  </div>

                  {/* Stats Grid */}
                  <div className="mt-5 grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-center tabular-nums">
                    <div>
                      <p className="text-[11px] text-slate-500">Assigned</p>
                      <p className="text-sm font-bold text-slate-900">{stats.totalTasks || 0}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Completed</p>
                      <p className="text-sm font-bold text-emerald-600">
                        {stats.completedTasks || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500">Projects</p>
                      <p className="text-sm font-bold text-indigo-600">
                        {stats.projectCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Workload Bar */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs tabular-nums">
                      <span className="text-slate-500">Active Workload</span>
                      <span className="font-semibold text-slate-800">
                        {stats.workloadPercent || 0}% ({stats.pendingTasks || 0} open)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${workloadColor}`}
                        style={{ width: `${stats.workloadPercent || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setProfileMemberId(member._id)}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View Profile
                  </Button>

                  {adminUser && member._id !== currentUser?._id && (
                    <div className="flex items-center gap-1.5">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member._id, e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700 focus:border-indigo-500 focus:outline-none"
                      >
                        <option value="Team Member">Team Member</option>
                        <option value="Project Manager">Project Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setDeletingMember(member)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Remove member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddMemberModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddMember}
        loading={adding}
      />

      <MemberProfileModal
        memberId={profileMemberId}
        isOpen={Boolean(profileMemberId)}
        onClose={() => setProfileMemberId(null)}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingMember)}
        onClose={() => setDeletingMember(null)}
        onConfirm={handleDeleteMember}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${deletingMember?.name}" from the workspace?`}
      />
    </div>
  );
}

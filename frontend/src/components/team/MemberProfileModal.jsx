import { useEffect, useState } from 'react';
import { Mail, Briefcase, Building2, CheckCircle2, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import LoadingSpinner from '../common/LoadingSpinner';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/formatters';

export default function MemberProfileModal({ memberId, isOpen, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!memberId || !isOpen) return;
      setLoading(true);
      try {
        const res = await userService.getById(memberId);
        setData(res);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [memberId, isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Member Profile" size="lg">
      {loading || !data ? (
        <LoadingSpinner label="Loading member profile..." />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-5 sm:flex-row sm:items-center">
            <Avatar
              name={data.user.name}
              color={data.user.avatarColor}
              size="xl"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{data.user.name}</h3>
                <Badge variant={data.user.role}>{data.user.role}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {data.user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                  {data.user.jobTitle || 'Team Member'}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  {data.user.department || 'General'}
                </span>
              </div>
              {data.user.bio && (
                <p className="mt-2.5 text-xs leading-relaxed text-slate-500">{data.user.bio}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-xs text-slate-500">Assigned Tasks</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{data.user.stats.totalTasks}</p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-xs text-slate-500">Completed</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">
                {data.user.stats.completedTasks}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 p-3.5 text-center">
              <p className="text-xs text-slate-500">Workload</p>
              <p className="mt-1 text-xl font-bold text-indigo-600">
                {data.user.stats.workloadPercent}%
              </p>
            </div>
          </div>

          <div>
            <h4 className="mb-2.5 text-sm font-semibold text-slate-900">
              Assigned Tasks ({data.tasks.length})
            </h4>
            {data.tasks.length === 0 ? (
              <p className="rounded-xl bg-slate-50 py-6 text-center text-xs text-slate-500">
                No tasks currently assigned to this member.
              </p>
            ) : (
              <div className="max-h-60 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
                {data.tasks.map((t) => (
                  <div key={t._id} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">{t.title}</p>
                      <p className="text-xs text-slate-500">
                        {t.project?.name} • Due {formatDate(t.dueDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={t.priority}>{t.priority}</Badge>
                      <Badge variant={t.status}>
                        {t.status === 'Completed' ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <Clock className="h-3 w-3" />
                        )}
                        {t.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

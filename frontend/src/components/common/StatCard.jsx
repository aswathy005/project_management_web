export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = 'indigo',
  trend,
}) {
  const ACCENTS = {
    indigo: {
      icon: 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/20',
      bar: 'bg-indigo-600',
      top: 'from-indigo-500/70 to-violet-500/70',
    },
    emerald: {
      icon: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20',
      bar: 'bg-emerald-500',
      top: 'from-emerald-500/70 to-teal-500/70',
    },
    sky: {
      icon: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20',
      bar: 'bg-sky-500',
      top: 'from-sky-500/70 to-blue-500/70',
    },
    amber: {
      icon: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20',
      bar: 'bg-amber-500',
      top: 'from-amber-500/70 to-orange-500/70',
    },
    rose: {
      icon: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/20',
      bar: 'bg-rose-500',
      top: 'from-rose-500/70 to-pink-500/70',
    },
    violet: {
      icon: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/20',
      bar: 'bg-violet-600',
      top: 'from-violet-500/70 to-purple-500/70',
    },
  };

  const theme = ACCENTS[accent] || ACCENTS.indigo;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300/80 hover:shadow-card-hover animate-fade-in-up">
      <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${theme.top} opacity-75 group-hover:opacity-100 transition-opacity`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${theme.icon}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend !== undefined && (
        <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${theme.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, trend))}%` }}
          />
        </div>
      )}
    </div>
  );
}

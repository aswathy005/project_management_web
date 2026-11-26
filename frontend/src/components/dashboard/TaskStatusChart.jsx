import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

export default function TaskStatusChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (!total) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No tasks recorded yet.
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full">
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-7">
        <span className="text-2xl font-bold text-slate-900 tabular-nums">{total}</span>
        <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
          Tasks
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="46%"
            innerRadius={58}
            outerRadius={84}
            paddingAngle={3}
            stroke="none"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 28px -5px rgba(15, 23, 42, 0.12)',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

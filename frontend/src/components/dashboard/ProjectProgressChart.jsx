import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

export default function ProjectProgressChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        No project progress data available yet.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 12, left: -16, bottom: 5 }}>
          <defs>
            <linearGradient id="barIndigoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4F46E5" stopOpacity={1} />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity={0.85} />
            </linearGradient>
            <linearGradient id="barEmeraldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
              <stop offset="100%" stopColor="#0D9488" stopOpacity={0.85} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            unit="%"
          />
          <Tooltip
            cursor={{ fill: '#F1F5F9', radius: 8 }}
            contentStyle={{
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 12px 28px -5px rgba(15, 23, 42, 0.12)',
              fontSize: '12px',
            }}
            formatter={(value, _name, props) => [
              `${value}% (${props.payload.completed}/${props.payload.total} tasks)`,
              props.payload.fullName,
            ]}
          />
          <Bar dataKey="progress" radius={[10, 10, 0, 0]} maxBarSize={40}>
            {data.map((entry, idx) => (
              <Cell
                key={entry.id || idx}
                fill={entry.progress === 100 ? 'url(#barEmeraldGrad)' : 'url(#barIndigoGrad)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

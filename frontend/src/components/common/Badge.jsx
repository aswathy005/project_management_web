import { STATUS_STYLES, PRIORITY_STYLES, ROLE_STYLES } from '../../utils/formatters';

export default function Badge({ children, variant = 'default', className = '' }) {
  const styleMap = {
    ...STATUS_STYLES,
    ...PRIORITY_STYLES,
    ...ROLE_STYLES,
    default: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  const style = styleMap[variant] || styleMap[children] || styleMap.default;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style} ${className}`}
    >
      {children}
    </span>
  );
}

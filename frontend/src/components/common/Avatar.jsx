import { getInitials } from '../../utils/formatters';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

export default function Avatar({ name, color = '#4F46E5', size = 'sm', className = '' }) {
  return (
    <div
      title={name}
      style={{ backgroundColor: color }}
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-white shadow-sm select-none ${SIZES[size] || SIZES.sm} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

export default function BrandLogo({ showText = true, size = 'md', dark = false, badge = 'SaaS' }) {
  const iconSize = size === 'lg' ? 'h-10 w-10' : size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';

  return (
    <div className="flex items-center gap-2.5 overflow-hidden select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        fill="none"
        className={`${iconSize} shrink-0 drop-shadow-sm`}
      >
        <defs>
          <linearGradient id="ptBrandGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="55%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#0EA5E9" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill="url(#ptBrandGrad)" />
        <path
          d="M18 22C18 19.7909 19.7909 18 22 18H35C41.0751 18 46 22.9249 46 29C46 35.0751 41.0751 40 35 40H26V46C26 47.6569 24.6569 49 23 49H21C19.3431 49 18 47.6569 18 46V22Z"
          fill="white"
          fillOpacity="0.96"
        />
        <rect x="26" y="25" width="9" height="8" rx="4" fill="url(#ptBrandGrad)" />
        <circle cx="44" cy="44" r="8" fill="#10B981" stroke="white" strokeWidth="2.5" />
        <path
          d="M40.8 44.2L43 46.4L47.4 41.8"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex items-center gap-1.5 truncate">
          <span
            className={`font-bold tracking-tight ${
              size === 'lg' ? 'text-xl' : 'text-base'
            } ${dark ? 'text-white' : 'text-slate-900'}`}
          >
            ProTrack
          </span>
          {badge && (
            <span
              className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide ${
                dark
                  ? 'bg-white/15 text-indigo-100 ring-1 ring-white/20'
                  : 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100'
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

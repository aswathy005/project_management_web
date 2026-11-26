export default function LoadingSpinner({ fullPage = false, label = 'Loading...' }) {
  if (fullPage) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-100 border-t-indigo-600" />
      <span className="text-sm text-slate-500">{label}</span>
    </div>
  );
}

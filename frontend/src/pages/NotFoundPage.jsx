import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md rounded-3xl border border-white/60 bg-white/90 p-8 shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#be2f2e]/10 text-[#be2f2e]">
          <Compass className="h-8 w-8" />
        </div>
        <p className="text-sm font-bold uppercase tracking-widest text-[#be2f2e]">404 Error</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          The workspace page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/dashboard" className="mt-6 inline-block">
          <Button>
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

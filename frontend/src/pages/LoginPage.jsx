import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import Button from '../components/common/Button';
import BrandLogo from '../components/common/BrandLogo';

const DEMO_ACCOUNTS = [
  { label: 'Admin', role: 'Full Access', email: 'admin@gmail.com', password: 'admin@123' },
  { label: 'Manager', role: 'Projects & Tasks', email: 'ProjectManager@gmail.com', password: 'ProjectManager@123' },
  { label: 'Member', role: 'Execution', email: 'TeamMember@gmail.com', password: 'TeamMember@123' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back to ProTrack!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Invalid credentials'));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e6b794] via-[#d4715b] to-[#be2f2e]">
      {/* Left Brand Showcase */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col justify-between overflow-hidden bg-gradient-to-br from-[#be2f2e] via-[#8f2423] to-[#4a1414] p-12 text-white">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[#e6b794]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[#be2f2e]/40 blur-3xl" />

        <div className="relative z-10">
          <BrandLogo size="lg" dark />
        </div>

        <div className="relative z-10 max-w-lg space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-200 ring-1 ring-indigo-400/30">
            <Sparkles className="h-3.5 w-3.5 text-indigo-300" /> Modern Project Operating System
          </span>
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Ship projects faster with{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
              clarity and precision.
            </span>
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            Unify sprint planning, interactive Kanban execution, real-time MongoDB analytics, and team workload visibility in one high-velocity workspace.
          </p>

          {/* Floating SaaS Preview Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md shadow-2xl">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-white">NextGen Cloud Portal v2.0</span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                On Track • 78%
              </span>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Kanban Sync Active
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                3-Tier Role Security
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-white/10 pt-8 text-sm">
          <div>
            <p className="text-2xl font-bold">RBAC</p>
            <p className="text-xs text-slate-400">Role-Based Access</p>
          </div>
          <div>
            <p className="text-2xl font-bold">Kanban</p>
            <p className="text-xs text-slate-400">Live Drag &amp; Drop</p>
          </div>
          <div>
            <p className="text-2xl font-bold">Real-Time</p>
            <p className="text-xs text-slate-400">MongoDB Analytics</p>
          </div>
        </div>
      </div>

      {/* Right Login Card */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandLogo size="lg" />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-7 shadow-card-hover sm:p-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Sign in to ProTrack
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Enter your workspace credentials to continue.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full py-2.5">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {/* Quick Demo Credentials */}
            <div className="mt-6 border-t border-slate-100 pt-5">
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                One-Click Quick Login
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc)}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 px-2.5 py-2 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50/80"
                  >
                    <p className="text-xs font-semibold text-slate-800">{acc.label}</p>
                    <p className="text-[10px] text-slate-500 truncate">{acc.role}</p>
                  </button>
                ))}
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

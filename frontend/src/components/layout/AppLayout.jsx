import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#e6b794] via-[#d4715b] to-[#be2f2e]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl rounded-3xl border border-white/60 bg-white/85 p-5 shadow-xl backdrop-blur-md sm:p-7">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

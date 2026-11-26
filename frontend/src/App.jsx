import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import AppLayout from './components/layout/AppLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import TasksPage from './pages/TasksPage';
import KanbanBoardPage from './pages/KanbanBoardPage';
import MyTasksPage from './pages/MyTasksPage';
import TeamMembersPage from './pages/TeamMembersPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl bg-white/90 px-8 py-6 shadow-xl backdrop-blur-md">
          <LoadingSpinner label="Verifying session..." />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-2xl bg-white/90 px-8 py-6 shadow-xl backdrop-blur-md">
          <LoadingSpinner label="Loading ProTrack..." />
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UIProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3200,
              style: {
                borderRadius: '12px',
                background: '#0F172A',
                color: '#F8FAFC',
                fontSize: '13px',
              },
            }}
          />

          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/login"
              element={
                <PublicOnlyRoute>
                  <LoginPage />
                </PublicOnlyRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicOnlyRoute>
                  <RegisterPage />
                </PublicOnlyRoute>
              }
            />

            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute allowedRoles={['Admin', 'Project Manager']}>
                    <CreateProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/projects/:id" element={<ProjectDetailsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/kanban" element={<KanbanBoardPage />} />
              <Route path="/my-tasks" element={<MyTasksPage />} />
              <Route path="/team" element={<TeamMembersPage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </UIProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

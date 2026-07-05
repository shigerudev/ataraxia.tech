import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { useAuth } from '@/features/auth/login';
import { LandingPage } from '@/pages/landing';
import { LoginPage } from '@/pages/login';
import { DashboardPage } from '@/pages/dashboard';
import { TherapyFlowPage } from '@/pages/therapy';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-loading">Cargando…</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.staffLogin} replace />;
  }

  return children;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="app-loading">Cargando…</div>;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.staffDashboard} replace />;
  }

  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<LandingPage />} />
      <Route path={ROUTES.start} element={<TherapyFlowPage />} />
      <Route
        path={ROUTES.staffLogin}
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path={ROUTES.staffDashboard}
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  );
}

import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { USER_ROLE_LABELS, type User } from '@/entities/user';
import { useAuth } from '@/features/auth/login';
import './DashboardPage.css';

function WelcomeMessage({ user }: { user: User }) {
  const roleLabel = USER_ROLE_LABELS[user.role];

  return (
    <section className="dashboard-welcome">
      <p className="dashboard-welcome__greeting">Bienvenido/a</p>
      <h1>{user.name}</h1>
      <span className="dashboard-welcome__role">{roleLabel}</span>
      <p className="dashboard-welcome__hint">
        Este es el panel inicial. Aquí se gestionarán las sesiones de psicología
        (individual y grupal).
      </p>
    </section>
  );
}

export function DashboardPage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="dashboard-page dashboard-page--loading">
        <p>Cargando sesión…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.staffLogin} replace />;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="dashboard-header__brand">Ataraxia</div>
        <button type="button" className="dashboard-header__logout" onClick={logout}>
          Cerrar sesión
        </button>
      </header>

      <main className="dashboard-main">
        <WelcomeMessage user={user} />

        <section className="dashboard-cards">
          <article className="dashboard-card">
            <h2>Sesiones individuales</h2>
            <p>Agenda y seguimiento de terapia uno a uno.</p>
            <span className="dashboard-card__status">Próximamente</span>
          </article>
          <article className="dashboard-card">
            <h2>Sesiones grupales</h2>
            <p>Grupos de apoyo y talleres terapéuticos.</p>
            <span className="dashboard-card__status">Próximamente</span>
          </article>
        </section>
      </main>
    </div>
  );
}

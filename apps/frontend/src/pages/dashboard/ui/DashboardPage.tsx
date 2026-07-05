import { Navigate } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import { USER_ROLE_LABELS, type User } from '@/entities/user';
import { Chip } from '@/shared/ui';
import { useAuth } from '@/features/auth/login';

function WelcomeMessage({ user }: { user: User }) {
  const roleLabel = USER_ROLE_LABELS[user.role];

  return (
    <section className="flex flex-col gap-1">
      <p className="text-muted">Bienvenido/a</p>
      <h1 className="font-display font-bold text-3xl tracking-tight">{user.name}</h1>
      <Chip className="self-start mt-1">{roleLabel}</Chip>
      <p className="text-muted mt-3 max-w-2xl leading-relaxed">
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
      <div className="app-loading">
        <p>Cargando sesión…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={ROUTES.staffLogin} replace />;
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-hairline">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="flex items-center gap-2 font-display font-bold text-xl text-navy">
            <span className="w-[22px] h-[22px] rounded-full bg-gradient-to-br from-navy to-indigo-500" />
            Ataraxia
          </span>
          <button type="button" className="btn--light text-sm px-4 py-2" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
        <WelcomeMessage user={user} />

        <section className="grid sm:grid-cols-2 gap-6">
          <article className="card flex flex-col gap-2">
            <h2 className="font-display font-semibold text-xl">Sesiones individuales</h2>
            <p className="text-muted">Agenda y seguimiento de terapia uno a uno.</p>
            <Chip variant="green" className="self-start mt-2">Próximamente</Chip>
          </article>
          <article className="card flex flex-col gap-2">
            <h2 className="font-display font-semibold text-xl">Sesiones grupales</h2>
            <p className="text-muted">Grupos de apoyo y talleres terapéuticos.</p>
            <Chip variant="blue" className="self-start mt-2">Próximamente</Chip>
          </article>
        </section>
      </main>
    </div>
  );
}

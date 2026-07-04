import { LoginForm } from '@/features/auth/login';
import './LoginPage.css';

export function LoginPage() {
  return (
    <div className="login-page">
      <aside className="login-page__brand">
        <div className="login-page__brand-top">
          <span className="login-page__logo">Ataraxia</span>
        </div>
        <div className="login-page__brand-body">
          <h2>Plataforma de gestión de sesiones de psicología</h2>
          <p>
            Un espacio profesional para coordinar terapia individual y grupal,
            centrado en el bienestar de cada persona.
          </p>
        </div>
        <div className="login-page__brand-footer">
          <span>&copy; {new Date().getFullYear()} Ataraxia · Todos los derechos reservados</span>
        </div>
      </aside>

      <main className="login-page__panel">
        <LoginForm />
      </main>
    </div>
  );
}

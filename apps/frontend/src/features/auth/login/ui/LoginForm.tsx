import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiError } from '@/shared/api';
import { ROUTES } from '@/shared/config';
import { Button, Input } from '@/shared/ui';
import { useAuth } from '../model/useAuth';
import './LoginForm.css';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);

    try {
      await login(email, password);
      navigate(ROUTES.staffDashboard);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? 'Las credenciales ingresadas no son correctas.'
            : 'Ocurrió un error al procesar la solicitud.',
        );
      } else {
        setError('No fue posible iniciar sesión. Intente nuevamente.');
      }
    }
  }

  return (
    <div className="login-form">
      <header className="login-form__header">
        <h1>Acceso a la plataforma</h1>
        <p>Ingrese sus credenciales institucionales para continuar.</p>
      </header>

      <form onSubmit={handleSubmit} className="login-form__body" noValidate>
        <Input
          label="Correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nombre@ataraxia.tech"
        />

        <Input
          label="Contraseña"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingrese su contraseña"
        />

        {error && (
          <p className="login-form__error" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" loading={isLoading} className="login-form__submit">
          Iniciar sesión
        </Button>
      </form>

      <footer className="login-form__footer">
        <p>
          El acceso está reservado a personal autorizado. Si necesita
          credenciales, contacte con el administrador.
        </p>
      </footer>
    </div>
  );
}

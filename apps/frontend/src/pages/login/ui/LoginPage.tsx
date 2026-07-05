import { LoginForm } from '@/features/auth/login';
import { BrandLogo, IconShield, IconUsers } from '@/shared/ui';

export function LoginPage() {
  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-navy p-12 text-white md:flex">
        <div
          className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-gradient-to-br from-primary/50 to-transparent blur-2xl"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-gradient-to-tr from-blue/20 to-transparent blur-2xl"
          aria-hidden="true"
        />

        <BrandLogo tone="white" className="relative" />

        <div className="relative flex flex-col gap-5">
          <h2 className="font-display text-3xl font-semibold leading-tight">
            Plataforma de gestión de sesiones de psicología
          </h2>
          <p className="leading-relaxed text-white/70">
            Un espacio profesional para coordinar terapia individual y grupal,
            centrado en el bienestar de cada persona.
          </p>
          <ul className="flex flex-col gap-3 text-sm text-white/80">
            <li className="flex items-center gap-2.5">
              <IconShield className="h-4 w-4 text-green" />
              Información protegida y confidencial
            </li>
            <li className="flex items-center gap-2.5">
              <IconUsers className="h-4 w-4 text-blue" />
              Gestión de terapia individual y grupal
            </li>
          </ul>
        </div>

        <span className="relative text-sm text-white/50">
          © {new Date().getFullYear()} Ataraxia · Todos los derechos reservados
        </span>
      </aside>

      <main className="grid place-items-center bg-bg bg-aurora bg-no-repeat p-6 md:p-12">
        <div className="flex w-full max-w-md flex-col gap-6">
          <BrandLogo className="self-center md:hidden" />
          <div className="card">
            <LoginForm />
          </div>
        </div>
      </main>
    </div>
  );
}

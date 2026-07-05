import { LoginForm } from '@/features/auth/login';

export function LoginPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2">
      <aside className="hidden md:flex flex-col justify-between p-12 text-white bg-navy relative overflow-hidden">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-gradient-to-br from-indigo-500/40 to-transparent blur-2xl"
          aria-hidden
        />
        <span className="relative flex items-center gap-2 font-display font-bold text-xl">
          <span className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-white to-lavender" />
          Ataraxia
        </span>

        <div className="relative">
          <h2 className="font-display font-semibold text-3xl leading-tight mb-4">
            Plataforma de gestión de sesiones de psicología
          </h2>
          <p className="text-white/70 leading-relaxed">
            Un espacio profesional para coordinar terapia individual y grupal,
            centrado en el bienestar de cada persona.
          </p>
        </div>

        <span className="relative text-sm text-white/50">
          © {new Date().getFullYear()} Ataraxia · Todos los derechos reservados
        </span>
      </aside>

      <main className="grid place-items-center p-6 md:p-12 bg-bg">
        <LoginForm />
      </main>
    </div>
  );
}

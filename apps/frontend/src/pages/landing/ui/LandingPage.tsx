import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/shared/config';
import {
  BrandLogo,
  BrandMark,
  IconArrowRight,
  IconChat,
  IconCheck,
  IconHeart,
  IconLock,
  IconPhone,
  IconShield,
  IconUsers,
} from '@/shared/ui';

/* ============================================================
   Reveal — aparición sutil (fade + slide-up) al entrar en el
   viewport, al estilo de sinapsisai.com. Autocontenido: no
   depende de tokens/CSS globales y respeta reduced-motion.
   ============================================================ */
function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(18px)',
        transition: `opacity 600ms ease ${delay}ms, transform 700ms cubic-bezier(0.22,0.61,0.36,1) ${delay}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}

/* ---- Iconos locales (solo usados aquí) ---- */
function IconCross({ className = 'h-3.5 w-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className={className} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function IconRobot({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="4" y="8" width="16" height="12" rx="2" />
      <path d="M12 8V4M9 14h.01M15 14h.01M2 13h2M20 13h2" />
    </svg>
  );
}
function IconWarn({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

type IconCmp = (p: { className?: string }) => ReactNode;

/* ---- Datos ---- */
const STEPS = [
  { t: 'Entras en anónimo', d: 'Sin cuenta ni datos personales. Solo tú y un espacio seguro para empezar.' },
  { t: 'Nos cuentas cómo estás', d: 'Un cuestionario breve y validado (PHQ-9 / GAD-7) para entender tu momento.' },
  { t: 'Conversas a tu manera', d: 'Chat o voz natural, con acompañamiento basado en terapia cognitivo-conductual.' },
  { t: 'Das el siguiente paso', d: 'Si quieres, te conectamos con terapia humana: individual o grupal.' },
];

const GENERIC = [
  'Contesta de todo, sin propósito clínico.',
  'Puede inventar respuestas sin base clínica.',
  'Sin red de seguridad ante una crisis.',
  'Suele pedirte cuenta y datos personales.',
  'Te deja solo/a con lo que sientes.',
  'Solo texto.',
];
const ATARAXIA = [
  'Centrado en tu bienestar, con enfoque cognitivo-conductual.',
  'Respuestas ancladas en conocimiento clínico curado (RAG · referencias DSM-5).',
  'Detecta señales de riesgo y activa el protocolo de crisis en cada mensaje.',
  '100% anónimo hasta que tú decidas dar tus datos.',
  'Puente hacia terapia real con profesionales.',
  'Chat y voz natural, tú eliges.',
];

const TRUST: { Icon: IconCmp; label: string }[] = [
  { Icon: IconLock, label: 'Sin registro' },
  { Icon: IconShield, label: 'Conversación privada' },
  { Icon: IconHeart, label: 'Apoyo ante crisis' },
  { Icon: IconPhone, label: 'Chat y voz' },
];

const PILLARS: { Icon: IconCmp; t: string; d: string }[] = [
  { Icon: IconLock, t: 'Privacidad primero', d: 'Entras y conversas sin identificarte. Tus datos solo existen si decides dar el paso hacia terapia.' },
  { Icon: IconShield, t: 'Seguridad clínica', d: 'Clasificación de riesgo determinística y protocolo de crisis con líneas de ayuda, revisado en cada turno.' },
  { Icon: IconHeart, t: 'Método con respaldo', d: 'Cribado PHQ-9 / GAD-7 y enfoque cognitivo-conductual, con conocimiento clínico curado detrás de cada respuesta.' },
  { Icon: IconPhone, t: 'Chat y voz', d: 'Escribe o habla con una voz natural. Elige el canal en el que te sientas más cómodo/a.' },
  { Icon: IconUsers, t: 'Puente humano', d: 'Cuando quieras, te conectamos con terapia individual o grupal acompañada por profesionales.' },
  { Icon: IconChat, t: 'Siempre disponible', d: 'Sin salas de espera: un primer apoyo el día que lo necesitas, a la hora que sea.' },
];

const FAQ = [
  { q: '¿Es realmente anónimo?', a: 'Sí. Entras sin cuenta ni datos personales. Tu conversación se guarda de forma anónima y solo te pedimos un contacto si eliges continuar con terapia.' },
  { q: '¿Reemplaza a un psicólogo?', a: 'No. Es un primer paso de contención y un puente hacia terapia con profesionales de salud mental.' },
  { q: '¿Qué pasa si estoy en crisis?', a: 'En cada mensaje evaluamos señales de riesgo. Si detectamos algo, mostramos de inmediato apoyo prioritario y las líneas de ayuda de tu país.' },
  { q: '¿Cuánto cuesta empezar?', a: 'Empezar a conversar es gratuito y anónimo. La conexión con terapia se coordina contigo si decides continuar.' },
  { q: '¿Chat o voz?', a: 'Ambos. Puedes escribir o hablar con una voz natural, y cambiar según lo que te resulte más cómodo.' },
];

const H2 = 'text-[clamp(1.7rem,3.6vw,2.4rem)] font-extrabold tracking-tight text-balance';
const CARD_HOVER = 'transition-transform duration-300 hover:-translate-y-1';

/* ---- Página ---- */
export function LandingPage() {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 rounded-full border border-hairline bg-white/80 py-2.5 pl-5 pr-2.5 shadow-card backdrop-blur-md">
          <Link to={ROUTES.home} aria-label="Ataraxia — inicio">
            <BrandLogo />
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <a href="#como" className="text-sm font-semibold text-muted transition hover:text-ink">Cómo funciona</a>
            <a href="#comparacion" className="text-sm font-semibold text-muted transition hover:text-ink">Comparación</a>
            <a href="#seguridad" className="text-sm font-semibold text-muted transition hover:text-ink">Seguridad</a>
            <a href="#preguntas" className="text-sm font-semibold text-muted transition hover:text-ink">Preguntas</a>
          </nav>
          <Link to={ROUTES.start} className="btn--primary px-5 py-2.5 text-sm">Empezar</Link>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden px-5 pb-16 pt-10 sm:pt-14">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-aurora bg-no-repeat" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
            <Reveal className="flex flex-col gap-5">
              <span className="chip-brand self-start">Anónimo · Gratuito · Chat y voz</span>
              <h1 className="text-[clamp(2.1rem,5.4vw,3.3rem)] font-extrabold leading-[1.1] tracking-tight text-balance">
                Habla de lo que sientes.{' '}
                <span className="bg-brand bg-clip-text text-transparent">Sin esperas, sin dar tu nombre.</span>
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted">
                Ataraxia es un espacio confidencial de acompañamiento emocional con enfoque
                cognitivo-conductual. Conversa por chat o por voz, a tu ritmo — y cuando estés
                listo/a, te conectamos con terapia real.
              </p>
              <div className="mt-1 flex flex-wrap gap-3">
                <Link to={ROUTES.start} className="btn--primary">
                  Empezar ahora <IconArrowRight className="h-4 w-4" />
                </Link>
                <a href="#como" className="btn--light">Ver cómo funciona</a>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5">
                {TRUST.map(({ Icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-2 text-sm font-semibold text-muted">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                  </span>
                ))}
              </div>
            </Reveal>

            {/* Orbe de marca */}
            <Reveal delay={140} className="order-first grid place-items-center md:order-last">
              <div className="relative grid aspect-square w-[min(340px,80vw)] animate-float place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
                <div className="h-[78%] w-[78%] rounded-full bg-primary-light/40 blur-3xl" />
                <div className="h-full w-full rounded-full border border-primary/20" />
                <div className="h-[84%] w-[84%] rounded-full border border-primary-light/30" />
                <div className="h-[66%] w-[66%] animate-breathe rounded-full bg-orb shadow-[inset_-18px_-26px_52px_rgba(29,35,64,.45),inset_12px_16px_40px_rgba(255,255,255,.28),0_30px_70px_rgba(91,76,240,.4)]" />
                <span className="grid h-[34%] w-[34%] place-items-center">
                  <BrandMark className="h-full w-full text-white drop-shadow-[0_8px_18px_rgba(29,35,64,.35)]" />
                </span>
              </div>
            </Reveal>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como" className="scroll-mt-24 px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto mb-11 flex max-w-2xl flex-col items-center gap-3 text-center">
              <span className="chip-brand">Cómo funciona</span>
              <h2 className={H2}>Cuatro pasos, a tu ritmo</h2>
              <p className="text-muted">
                Un recorrido pensado para bajar la barrera de pedir ayuda: empiezas en segundos
                y decides tú hasta dónde llegar.
              </p>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((s, i) => (
                <Reveal key={s.t} delay={i * 70} className="h-full">
                  <div className={`card flex h-full flex-col gap-1.5 ${CARD_HOVER}`}>
                    <span className="text-xs font-extrabold tracking-widest text-primary">PASO 0{i + 1}</span>
                    <h3 className="text-lg font-bold">{s.t}</h3>
                    <p className="text-sm text-muted">{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* COMPARATIVO / VS */}
        <section id="comparacion" className="scroll-mt-24 bg-white px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto mb-12 flex max-w-2xl flex-col items-center gap-3 text-center">
              <span className="chip-brand">La diferencia</span>
              <h2 className={H2}>No es “un chat con IA” más</h2>
              <p className="text-muted">
                Un asistente genérico responde. Ataraxia acompaña: con método clínico, seguridad
                y un puente hacia ayuda humana.
              </p>
            </Reveal>

            <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr]">
              {/* Genérico (frío) */}
              <Reveal className="h-full">
                <div className="h-full rounded-lg2 border border-[#E4E5EC] bg-[#F1F2F6] p-6 sm:p-7">
                  <h3 className="mb-5 flex items-center gap-3 text-lg font-bold text-ink">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#E4E6EE] text-[#828799]">
                      <IconRobot />
                    </span>
                    Un asistente de IA genérico
                  </h3>
                  <ul className="flex flex-col gap-3.5 font-mono text-sm text-[#7C8194]">
                    {GENERIC.map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-pink-bg text-pink-text">
                          <IconCross className="h-3 w-3" />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              {/* Insignia VS */}
              <Reveal delay={90} className="grid place-items-center">
                <div className="z-10 -my-1 grid h-14 w-14 place-items-center rounded-full bg-brand text-base font-extrabold text-white shadow-card md:-mx-2">
                  VS
                </div>
              </Reveal>

              {/* Ataraxia (cálido) */}
              <Reveal delay={160} className="h-full">
                <div className="relative h-full rounded-lg2 border border-primary/30 bg-white p-6 shadow-card sm:p-7">
                  <span className="absolute -top-3 right-6 rounded-full bg-brand px-3 py-1 text-xs font-extrabold text-white">
                    Ataraxia
                  </span>
                  <h3 className="mb-5 flex items-center gap-3 text-lg font-bold">
                    <BrandMark gradient className="h-8 w-8" />
                    Acompañamiento con método
                  </h3>
                  <ul className="flex flex-col gap-3.5 text-sm text-ink">
                    {ATARAXIA.map((t) => (
                      <li key={t} className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-bg text-green-text">
                          <IconCheck className="h-3 w-3" />
                        </span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* PILARES */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto mb-11 flex max-w-xl flex-col items-center gap-3 text-center">
              <span className="chip-brand">Por qué confiar</span>
              <h2 className={H2}>Diseñado con cuidado clínico</h2>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {PILLARS.map(({ Icon, t, d }, i) => (
                <Reveal key={t} delay={(i % 3) * 70} className="h-full">
                  <div className={`card flex h-full flex-col gap-2 ${CARD_HOVER}`}>
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand text-white">
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="mt-2 text-lg font-bold">{t}</h3>
                    <p className="text-sm text-muted">{d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SEGURIDAD / AVISO */}
        <section id="seguridad" className="scroll-mt-24 px-5 pb-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="flex items-start gap-4 rounded-lg2 border border-green/60 bg-green-bg p-6 sm:p-7">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-green-text/40 text-green-text">
                  <IconWarn />
                </span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg font-bold">Ataraxia acompaña, no reemplaza</h3>
                  <p className="leading-relaxed text-ink/80">
                    No es un servicio de emergencia ni sustituye la atención de un profesional de salud
                    mental. Si tú o alguien más corre peligro inmediato, comunícate ahora con tu{' '}
                    <strong className="text-ink">línea local de crisis</strong> o con{' '}
                    <strong className="text-ink">emergencias</strong>. Nuestro protocolo mostrará estos
                    recursos apenas detecte una señal de riesgo.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PREGUNTAS */}
        <section id="preguntas" className="scroll-mt-24 bg-white px-5 py-20">
          <div className="mx-auto max-w-3xl">
            <Reveal className="mx-auto mb-9 flex max-w-xl flex-col items-center gap-3 text-center">
              <span className="chip-brand">Preguntas frecuentes</span>
              <h2 className={H2}>Lo que quizá te preguntas</h2>
            </Reveal>
            <div className="flex flex-col gap-3">
              {FAQ.map((f, i) => (
                <Reveal key={f.q} delay={i * 55}>
                  <details
                    className="group rounded-md2 border border-hairline bg-white"
                    {...(i === 0 ? { open: true } : {})}
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 font-bold [&::-webkit-details-marker]:hidden">
                      {f.q}
                      <svg className="h-5 w-5 shrink-0 text-primary transition group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-5 leading-relaxed text-muted">{f.a}</div>
                  </details>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-6xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-lg2 bg-brand px-6 py-16 text-center text-white shadow-card">
                <h2 className="text-[clamp(1.7rem,3.6vw,2.3rem)] font-extrabold tracking-tight text-white text-balance">
                  Da el primer paso hoy
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-white/85">
                  Un espacio seguro para hablar de lo que sientes, sin juicios y sin esperas.
                  Estás a un clic de comenzar.
                </p>
                <Link
                  to={ROUTES.start}
                  className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-3.5 font-bold text-primary shadow-card transition hover:-translate-y-0.5"
                >
                  Empezar ahora — es anónimo <IconArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-hairline px-5 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="flex flex-col gap-3">
              <BrandLogo />
              <p className="max-w-[30ch] text-sm text-muted">
                Acompañamiento emocional confidencial con enfoque cognitivo-conductual.
              </p>
            </div>
            <div>
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Producto</h5>
              <a href="#como" className="block py-1 text-sm text-muted transition hover:text-ink">Cómo funciona</a>
              <a href="#comparacion" className="block py-1 text-sm text-muted transition hover:text-ink">Comparación</a>
              <a href="#seguridad" className="block py-1 text-sm text-muted transition hover:text-ink">Seguridad</a>
            </div>
            <div>
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Recursos</h5>
              <a href="#preguntas" className="block py-1 text-sm text-muted transition hover:text-ink">Preguntas</a>
              <Link to={ROUTES.staffLogin} className="block py-1 text-sm text-muted transition hover:text-ink">Para profesionales</Link>
              <a href="#seguridad" className="block py-1 text-sm text-muted transition hover:text-ink">Líneas de ayuda</a>
            </div>
            <div>
              <h5 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted">Legal</h5>
              <span className="block py-1 text-sm text-muted">Privacidad</span>
              <span className="block py-1 text-sm text-muted">Términos</span>
              <span className="block py-1 text-sm text-muted">Aviso clínico</span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap justify-between gap-2 border-t border-hairline pt-6 text-xs text-muted">
            <span>© {year} Ataraxia · Este servicio no sustituye la atención profesional de salud mental.</span>
            <span>Hecho con cuidado</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

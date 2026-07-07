import { useEffect, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';

/* ============================================================
   Iconos — trazos de 24px estilo línea (sin emojis).
   Uso: <IconChat className="h-5 w-5" />
   ============================================================ */

interface IconProps {
  className?: string;
}

function createIcon(paths: ReactNode) {
  return function Icon({ className = 'h-5 w-5' }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };
}

export const IconChat = createIcon(<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />);

export const IconMic = createIcon(
  <>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </>,
);

export const IconMicOff = createIcon(
  <>
    <line x1="2" x2="22" y1="2" y2="22" />
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
    <path d="M5 10v2a7 7 0 0 0 12 5.29" />
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </>,
);

export const IconShield = createIcon(
  <>
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const IconLock = createIcon(
  <>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>,
);

export const IconHeart = createIcon(
  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.04 3 5.5l7 7Z" />,
);

export const IconPhone = createIcon(
  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />,
);

export const IconCheck = createIcon(<path d="M20 6 9 17l-5-5" />);

export const IconX = createIcon(
  <>
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </>,
);

export const IconArrowRight = createIcon(
  <>
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </>,
);

export const IconSend = createIcon(
  <>
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </>,
);

export const IconUser = createIcon(
  <>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
);

export const IconUsers = createIcon(
  <>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </>,
);

export const IconCalendar = createIcon(
  <>
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 2v4" />
    <path d="M16 2v4" />
  </>,
);

export const IconClock = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </>,
);

export const IconVideo = createIcon(
  <>
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
  </>,
);

export const IconPhoneOff = createIcon(
  <>
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67" />
    <path d="M5 5a2 2 0 0 0-1.11 2.4 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L2.82 13.63" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </>,
);

export const IconArrowLeft = createIcon(
  <>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </>,
);

export const IconSun = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </>,
);

export const IconMoon = createIcon(
  <path d="M12 3a6.8 6.8 0 0 0 8.8 8.8A9 9 0 1 1 12 3Z" />,
);

/* ============================================================
   Marca
   ============================================================ */

interface BrandLogoProps {
  tone?: 'navy' | 'white';
  className?: string;
}

interface BrandMarkProps extends IconProps {
  /** true = alas con el gradiente de marca; false = currentColor (fondos oscuros). */
  gradient?: boolean;
}

/** Isotipo: mariposa (alas superiores amplias, inferiores menores). */
export function BrandMark({ className = 'h-4 w-4', gradient = false }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id="ataraxia-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8D7FFF" />
            <stop offset="100%" stopColor="#5B4CF0" />
          </linearGradient>
        </defs>
      )}
      <g fill={gradient ? 'url(#ataraxia-brand-gradient)' : 'currentColor'}>
        <ellipse cx="7.1" cy="8.3" rx="4.7" ry="5.5" transform="rotate(-18 7.1 8.3)" />
        <ellipse cx="16.9" cy="8.3" rx="4.7" ry="5.5" transform="rotate(18 16.9 8.3)" />
        <ellipse cx="8" cy="17.2" rx="3.4" ry="4" transform="rotate(14 8 17.2)" />
        <ellipse cx="16" cy="17.2" rx="3.4" ry="4" transform="rotate(-14 16 17.2)" />
      </g>
    </svg>
  );
}

export function BrandLogo({ tone = 'navy', className = '' }: BrandLogoProps) {
  const isWhite = tone === 'white';
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-display font-extrabold text-xl tracking-tight ${
        isWhite ? 'text-white' : 'text-navy'
      } ${className}`.trim()}
    >
      <BrandMark className="h-8 w-8" gradient={!isWhite} />
      Ataraxia
    </span>
  );
}

type ThemeMode = 'daylight' | 'dark';

function getStoredTheme(): ThemeMode {
  if (typeof document === 'undefined') return 'daylight';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'daylight';
}

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('ataraxia_theme', theme);
    } catch {
      // Theme still works for the current tab if storage is unavailable.
    }
  }, [theme]);

  return (
    <div className={`theme-toggle ${className}`.trim()} role="group" aria-label="Tema visual">
      <button
        type="button"
        className={`theme-toggle__option ${theme === 'daylight' ? 'is-active' : ''}`}
        aria-pressed={theme === 'daylight'}
        onClick={() => setTheme('daylight')}
        title="Daylight theme"
      >
        <IconSun className="h-4 w-4" />
        <span className="hidden sm:inline">Daylight</span>
      </button>
      <button
        type="button"
        className={`theme-toggle__option ${theme === 'dark' ? 'is-active' : ''}`}
        aria-pressed={theme === 'dark'}
        onClick={() => setTheme('dark')}
        title="Dark theme"
      >
        <IconMoon className="h-4 w-4" />
        <span className="hidden sm:inline">Dark</span>
      </button>
    </div>
  );
}

/* ============================================================
   Primitivas de formulario y superficie
   ============================================================ */

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'light';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  loading = false,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`btn--${variant} ${className}`.trim()}
      disabled={disabled || loading}
      type="button"
      {...props}
    >
      {loading && (
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 animate-spin" aria-hidden="true">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
          <path
            d="M22 12a10 10 0 0 1-10 10"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;

  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`.trim()}>
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} {...props} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return <div className={`card ${className}`.trim()}>{children}</div>;
}

type ChipVariant = 'brand' | 'outline' | 'green' | 'blue' | 'pink';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  className?: string;
}

export function Chip({ children, variant = 'brand', className = '' }: ChipProps) {
  return <span className={`chip-${variant} ${className}`.trim()}>{children}</span>;
}

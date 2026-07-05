import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

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

/* ============================================================
   Marca
   ============================================================ */

interface BrandLogoProps {
  tone?: 'navy' | 'white';
  className?: string;
}

export function BrandMark({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2.5c1.5 1.6 2.3 3.3 2.3 5S13.3 10.5 12 10.5 9.7 9.2 9.7 7.5s.8-3.4 2.3-5Z" />
      <path
        transform="rotate(90 12 12)"
        d="M12 2.5c1.5 1.6 2.3 3.3 2.3 5S13.3 10.5 12 10.5 9.7 9.2 9.7 7.5s.8-3.4 2.3-5Z"
      />
      <path
        transform="rotate(180 12 12)"
        d="M12 2.5c1.5 1.6 2.3 3.3 2.3 5S13.3 10.5 12 10.5 9.7 9.2 9.7 7.5s.8-3.4 2.3-5Z"
      />
      <path
        transform="rotate(270 12 12)"
        d="M12 2.5c1.5 1.6 2.3 3.3 2.3 5S13.3 10.5 12 10.5 9.7 9.2 9.7 7.5s.8-3.4 2.3-5Z"
      />
      <circle cx="12" cy="12" r="1.6" />
    </svg>
  );
}

export function BrandLogo({ tone = 'navy', className = '' }: BrandLogoProps) {
  const isWhite = tone === 'white';
  return (
    <span
      className={`inline-flex items-center gap-2.5 font-display font-bold text-xl tracking-tight ${
        isWhite ? 'text-white' : 'text-navy'
      } ${className}`.trim()}
    >
      <span
        className={`grid h-8 w-8 place-items-center rounded-xl ${
          isWhite ? 'bg-white/15 text-white' : 'bg-navy text-white'
        }`}
      >
        <BrandMark className="h-[18px] w-[18px]" />
      </span>
      Ataraxia
    </span>
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

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react';

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
      {loading ? 'Cargando…' : children}
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

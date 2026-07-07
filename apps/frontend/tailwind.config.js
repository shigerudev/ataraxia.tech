/** @type {import('tailwindcss').Config} */
// Sistema de diseño "Sinapsis" — fuente de verdad de tokens UX/UI del proyecto.
// Derivado de plantilla-estilo-sinapsis-tailwind.html. Ver apps/frontend/DESIGN.md.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca (propuesta del equipo): violeta como color de acción.
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
        },
        // Navy queda como texto y superficies oscuras.
        navy: {
          DEFAULT: 'rgb(var(--color-navy) / <alpha-value>)',
          2: 'rgb(var(--color-navy-2) / <alpha-value>)',
        },
        bg: 'rgb(var(--color-bg) / <alpha-value>)',
        lavender: 'rgb(var(--color-lavender) / <alpha-value>)',
        // Feedback: pasteles del equipo como relleno + par oscuro para texto (AA).
        green: {
          DEFAULT: 'rgb(var(--color-green) / <alpha-value>)',
          bg: 'rgb(var(--color-green-bg) / <alpha-value>)',
          text: 'rgb(var(--color-green-text) / <alpha-value>)',
        },
        blue: {
          DEFAULT: 'rgb(var(--color-blue) / <alpha-value>)',
          bg: 'rgb(var(--color-blue-bg) / <alpha-value>)',
          text: 'rgb(var(--color-blue-text) / <alpha-value>)',
        },
        pink: {
          DEFAULT: 'rgb(var(--color-pink) / <alpha-value>)',
          bg: 'rgb(var(--color-pink-bg) / <alpha-value>)',
          text: 'rgb(var(--color-pink-text) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          bg: 'rgb(var(--color-warning-bg) / <alpha-value>)',
          text: 'rgb(var(--color-warning-text) / <alpha-value>)',
        },
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        hairline: 'rgb(var(--color-hairline) / <alpha-value>)',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        sm2: '12px',
        md2: '20px',
        lg2: '28px',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
        card: 'var(--shadow-card)',
      },
      backgroundImage: {
        brand: 'var(--bg-brand)',
        aurora: 'var(--bg-aurora)',
        orb: 'var(--bg-orb)',
        'voice-glow': 'var(--bg-voice-glow)',
      },
      keyframes: {
        'ping-soft': {
          '0%': { boxShadow: '0 0 0 0 rgba(242,139,130,.55)' },
          '70%': { boxShadow: '0 0 0 8px rgba(242,139,130,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(242,139,130,0)' },
        },
        typing: {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-3px)', opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.045)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-7px)' },
        },
        'orb-spin': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.94) translateY(6px)' },
          to: { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        'message-in-left': {
          from: { opacity: '0', transform: 'translate(-6px, 8px)' },
          to: { opacity: '1', transform: 'translate(0, 0)' },
        },
        'message-in-right': {
          from: { opacity: '0', transform: 'translate(6px, 8px)' },
          to: { opacity: '1', transform: 'translate(0, 0)' },
        },
        'fill-x': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'ping-green': {
          '0%': { boxShadow: '0 0 0 0 rgba(167,215,181,0.7)' },
          '70%': { boxShadow: '0 0 0 6px rgba(167,215,181,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(167,215,181,0)' },
        },
        caret: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.25' },
        },
        'send-fly': {
          '0%': { transform: 'translate(0, 0)', opacity: '1' },
          '55%': { transform: 'translate(12px, -12px)', opacity: '0' },
          '56%': { transform: 'translate(-8px, 8px)', opacity: '0' },
          '100%': { transform: 'translate(0, 0)', opacity: '1' },
        },
      },
      animation: {
        'ping-soft': 'ping-soft 1.8s infinite',
        typing: 'typing 1.2s ease-in-out infinite',
        breathe: 'breathe 3.4s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'orb-spin': 'orb-spin 18s linear infinite',
        'fade-in': 'fade-in 0.25s ease-out both',
        'rise-in': 'rise-in 0.35s ease-out both',
        'scale-in': 'scale-in 0.35s ease-out both',
        'message-in-left': 'message-in-left 0.28s ease-out both',
        'message-in-right': 'message-in-right 0.28s ease-out both',
        'fill-x': 'fill-x 0.4s ease-out both',
        'ping-green': 'ping-green 3s infinite',
        caret: 'caret 0.9s ease-in-out infinite',
        'send-fly': 'send-fly 0.4s ease-in-out',
      },
    },
  },
  plugins: [],
};

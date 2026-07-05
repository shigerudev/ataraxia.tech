/** @type {import('tailwindcss').Config} */
// Sistema de diseño "Sinapsis" — fuente de verdad de tokens UX/UI del proyecto.
// Derivado de plantilla-estilo-sinapsis-tailwind.html. Ver apps/frontend/DESIGN.md.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Marca (propuesta del equipo): violeta como color de acción.
        primary: { DEFAULT: '#5B4CF0', light: '#8D7FFF', dark: '#4033C8' },
        // Navy queda como texto y superficies oscuras.
        navy: { DEFAULT: '#1D2340', 2: '#272E52' },
        bg: '#F7F5FC',
        lavender: '#E9E5FD',
        // Feedback: pasteles del equipo como relleno + par oscuro para texto (AA).
        green: { DEFAULT: '#A7D7B5', bg: '#EAF6EE', text: '#1F7A50' },
        blue: { DEFAULT: '#A9C8FF', bg: '#EAF1FF', text: '#2E5AAC' },
        pink: { DEFAULT: '#F28B82', bg: '#FDECEA', text: '#B4453C' },
        warning: { DEFAULT: '#F7D27A', bg: '#FDF4DE', text: '#8A6116' },
        ink: '#1D2340',
        muted: '#6B7280',
        hairline: '#E9E7F6',
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
        soft: '0 10px 30px rgba(91,76,240,0.10)',
        card: '0 15px 40px rgba(91,76,240,0.15)',
      },
      backgroundImage: {
        brand: 'linear-gradient(135deg, #8D7FFF 0%, #5B4CF0 100%)',
        aurora: 'radial-gradient(1100px 560px at 50% -10%, #E9E5FD, transparent)',
        orb: 'radial-gradient(circle at 30% 26%, #FFFFFF 0%, #E9E5FD 14%, #8D7FFF 40%, #5B4CF0 68%, #1D2340 96%)',
        'voice-glow': 'radial-gradient(480px 480px at 50% 36%, rgba(141,127,255,0.18), transparent 70%)',
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
      },
      animation: {
        'ping-soft': 'ping-soft 1.8s infinite',
        typing: 'typing 1.2s ease-in-out infinite',
        breathe: 'breathe 3.4s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'orb-spin': 'orb-spin 18s linear infinite',
      },
    },
  },
  plugins: [],
};

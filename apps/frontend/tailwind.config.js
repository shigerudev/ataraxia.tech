/** @type {import('tailwindcss').Config} */
// Sistema de diseño "Sinapsis" — fuente de verdad de tokens UX/UI del proyecto.
// Derivado de plantilla-estilo-sinapsis-tailwind.html. Ver apps/frontend/DESIGN.md.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#10123B', 2: '#171A4A' },
        bg: '#F3F2FB',
        lavender: '#E7E5FA',
        green: { DEFAULT: '#33D686', bg: '#E4FBEF', text: '#1B8A54' },
        blue: { DEFAULT: '#A9C8FF', bg: '#EAF1FF', text: '#2E5AAC' },
        pink: { DEFAULT: '#FF5C7A', bg: '#FFE9ED' },
        ink: '#14162C',
        muted: '#62637A',
        hairline: '#E7E6F3',
      },
      fontFamily: {
        display: ['Poppins', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        lg2: '24px',
        md2: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(16,18,59,0.04)',
        card: '0 12px 32px rgba(16,18,59,0.08)',
      },
      keyframes: {
        'ping-soft': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,92,122,.5)' },
          '70%': { boxShadow: '0 0 0 8px rgba(255,92,122,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,92,122,0)' },
        },
      },
      animation: {
        'ping-soft': 'ping-soft 1.8s infinite',
      },
    },
  },
  plugins: [],
};

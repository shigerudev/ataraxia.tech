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
      backgroundImage: {
        aurora: 'radial-gradient(1100px 560px at 50% -10%, #E7E5FA, transparent)',
        orb: 'radial-gradient(circle at 30% 26%, #FFFFFF 0%, #E7E5FA 14%, #A9C8FF 38%, #2E5AAC 64%, #10123B 92%)',
        'voice-glow': 'radial-gradient(480px 480px at 50% 36%, rgba(169,200,255,0.16), transparent 70%)',
      },
      keyframes: {
        'ping-soft': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,92,122,.5)' },
          '70%': { boxShadow: '0 0 0 8px rgba(255,92,122,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(255,92,122,0)' },
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

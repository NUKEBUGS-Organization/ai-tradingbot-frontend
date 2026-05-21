/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        tv: {
          bg: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          gold: '#d4af37',
          muted: '#8b949e',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
      },
      backdropBlur: {
        glass: '12px',
      },
    },
  },
  plugins: [],
};

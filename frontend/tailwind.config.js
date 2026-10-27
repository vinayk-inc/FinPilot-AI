/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1020',
        sidebar: '#10182A',
        card: '#121D32',
        cardHover: '#16233D',
        borderSubtle: '#26344E',
        accentBlue: '#60A5FA',
        accentHover: '#3B82F6',
        textMuted: '#94A3B8',
        textSecondary: '#A9B9D0',
        textLight: '#F8FAFC',
        emeraldSuccess: '#10B981',
        roseDanger: '#F43F5E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

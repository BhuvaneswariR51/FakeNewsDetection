/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4f46e5',
          DEFAULT: '#3b82f6',
          dark: '#1e3a8a',
        },
        sidebar: '#111827',
        accent: '#2ebdff',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'main-gradient': 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        'soft-gradient': 'linear-gradient(to right, #f8fafc, #eff6ff)',
      }
    },
  },
  plugins: [],
}

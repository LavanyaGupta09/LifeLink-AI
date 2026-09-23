/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-base)',
        surface: 'var(--bg-surface)',
        elevated: 'var(--bg-elevated)',
        card: 'var(--bg-card)',
        'card-hover': 'var(--bg-card-hover)',
        overlay: 'var(--bg-overlay)',
        primary: 'var(--primary)',
        'primary-dark': 'var(--primary-dark)',
        'primary-light': 'var(--primary-light)',
        danger: 'var(--danger)',
        'danger-dark': 'var(--danger-dark)',
        'danger-light': 'var(--danger-light)',
        warning: 'var(--warning)',
        info: 'var(--info)',
        success: 'var(--success)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        textTertiary: 'var(--text-tertiary)',
        border: 'var(--border)',
        'border-light': 'var(--border-light)',
        input: 'var(--bg-input)',
        'accent-purple': 'var(--bg-accent-purple)',
        'accent-blue': 'var(--bg-accent-blue)',
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}

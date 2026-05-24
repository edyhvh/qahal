import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: 'var(--brand-purple)',
          navy: 'var(--brand-navy)',
          light: 'var(--brand-light)',
          accent: 'var(--brand-accent)',
          text: 'var(--brand-text)',
          'text-muted': 'var(--brand-text-muted)',
          border: 'var(--brand-border)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        hebrew: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;

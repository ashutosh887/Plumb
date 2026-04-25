import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0d10',
        fg: '#f0f1f3',
        muted: '#8a8f99',
        border: '#1d1f26',
        critical: '#ff4d6d',
        warn: '#f5a524',
        accent: '#a3e635',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
};

export default config;

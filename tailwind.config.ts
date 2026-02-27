import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './hooks/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink:           '#000000',
        'ink-soft':    '#111111',
        'ink-muted':   '#1c1c1c',
        dim:           '#555555',
        muted:         '#888888',
        border:        '#2a2a2a',
        'border-soft': '#3a3a3a',
        surface:       '#0d0d0d',
        'surface-2':   '#161616',
        'surface-3':   '#1f1f1f',
        fog:           '#cccccc',
        paper:         '#f2f2f2',
        white:         '#ffffff',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono:    ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        body:    ['"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem',  { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['2.25rem', { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
      },
      maxWidth: {
        prose: '65ch',
      },
      animation: {
        'pulse-soft': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
} satisfies Config

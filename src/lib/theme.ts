export const theme = {
  colors: {
    background: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    surfaceMuted: 'var(--color-surface-muted)',
    border: 'var(--color-border)',
    borderStrong: 'var(--color-border-strong)',
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    primary: 'var(--color-primary)',
    primaryStrong: 'var(--color-primary-strong)',
    primaryMuted: 'var(--color-primary-muted)',
    accent: 'var(--color-accent)',
    danger: 'var(--color-danger)',
    warning: 'var(--color-warning)',
    success: 'var(--color-success)',
  },
  radii: {
    xs: 'var(--radius-xs)',
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
  },
  shadows: {
    soft: 'var(--shadow-soft)',
    ring: 'var(--shadow-ring)',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    heading: {
      letterSpacing: '-0.01em',
      fontWeight: 600,
    },
    body: {
      fontWeight: 400,
    },
    mono: 'Menlo, SFMono-Regular, Consolas, "Liberation Mono", monospace',
  },
} as const;

export type Theme = typeof theme;

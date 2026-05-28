export const Colors = {
  // KORTA — Urban Premium Tech (Paleta de Cores do Utilizador)
  background: '#000000', // Preto puro
  foreground: '#FFFFFF', // Branco
  surface: '#18181B',    // Zinc-900
  surface2: '#27272A',   // Zinc-800
  
  primary: '#f59e0b',    // Âmbar
  primaryGlow: '#fbbf24', // Âmbar Glow
  primaryForeground: '#000000', // Preto
  
  secondary: '#27272A',  // Zinc-800
  secondaryForeground: '#FFFFFF',
  
  muted: '#27272A',
  mutedForeground: '#a1a1aa', // Zinc-400
  
  accent: 'rgba(245, 158, 11, 0.15)', // Âmbar transparente
  accentForeground: '#fbbf24',
  
  success: '#34D399',
  error: '#EF4444',
  warning: '#f59e0b',
  
  border: '#27272A',     // Zinc-800
  input: 'rgba(39, 39, 42, 0.8)',
  
  // Gradients (representação em string para uso em componentes)
  gradientGold: ['#f59e0b', '#fbbf24'],
  gradientDark: ['#000000', '#18181b'],
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 10, // calc(14px - 4px)
  md: 12, // calc(14px - 2px)
  lg: 14, // var(--radius) 0.875rem
  xl: 18, // calc(14px + 4px)
  full: 9999,
};

export const Shadows = {
  gold: {
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  elegant: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 40,
    elevation: 12,
  }
};

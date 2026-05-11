export const Colors = {
  // KORTA — Urban Premium Tech (Baseado na paleta enviada)
  background: '#0D0D0D', // Deep Black
  foreground: '#FAFAFA', // Near White
  surface: '#1C1C1C',    // Card/Surface
  surface2: '#242424',
  
  primary: '#D4AF37',    // Gold
  primaryGlow: '#E5C158',
  primaryForeground: '#0D0D0D',
  
  secondary: '#242424',
  secondaryForeground: '#FAFAFA',
  
  muted: '#242424',
  mutedForeground: '#B3B3B3',
  
  accent: 'rgba(212, 175, 55, 0.15)', // Gold transparente
  accentForeground: '#E5C158',
  
  success: '#34D399',
  error: '#EF4444',
  warning: '#F59E0B',
  
  border: 'rgba(255, 255, 255, 0.1)',
  input: 'rgba(255, 255, 255, 0.12)',
  
  // Gradients (representação em string para uso em componentes)
  gradientGold: ['#D4AF37', '#E5C158'],
  gradientDark: ['#0D0D0D', '#1A1A1A'],
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
    shadowColor: '#D4AF37',
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

/**
 * PomodoroApp - Design System (React Native)
 * Palette: Dark Minimalist Professional
 */

export const COLORS = {
  // Brand Colors
  primary: '#0D0D0D',      // Negro profundo (Fondo principal)
  secondary: '#22C55E',    // Verde esmeralda (Acciones primarias)
  accent: '#3B82F6',       // Azul profesional (Acentos secundarios)
  
  // Neutrals
  textMain: '#F8FAFC',     // Blanco suave - Texto títulos
  textMuted: '#94A3B8',    // Gris azulado - Texto secundario
  textDark: '#1E293B',     // Texto oscuro para fondos claros
  
  // Cards y superficies
  card: '#1A1A1A',         // Fondo de tarjetas
  cardLight: '#F8FAFC',    // Tarjeta clara
  border: '#2D2D2D',       // Bordes sutiles
  borderLight: '#E2E8F0',  // Bordes para fondos claros
  
  // Base colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Estados
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Transparency/Overlays
  overlay: 'rgba(0, 0, 0, 0.6)',
  cardOverlay: 'rgba(255, 255, 255, 0.05)',
  
  // Gradientes (arrays para LinearGradient)
  gradientPrimary: ['#22C55E', '#16A34A'],
  gradientAccent: ['#3B82F6', '#2563EB'],
  gradientDark: ['#1A1A1A', '#0D0D0D'],
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

export const TYPOGRAPHY = {
  h1: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
};

export default {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
};

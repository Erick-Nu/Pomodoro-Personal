/**
 * PomodoroApp - Design System (React Native)
 * Palette: Corporate Clean (White & Royal Blue)
 */

export interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  textMain: string;
  textMuted: string;
  border: string;
  white: string;
  black: string;
  secondaryLight: string;
  accentLight: string;
  shadow: string;
}

export const COLORS: ColorTheme = {
  // Brand Colors
  primary: '#FFFFFF',      // Blanco (Fondo principal)
  secondary: '#1E40AF',    // Azul Royal (Acciones, Progreso, Títulos)
  accent: '#1E40AF',       
  
  // Neutrals
  textMain: '#1E293B',     /* Azul Pizarra Oscuro para textos nítidos */
  textMuted: '#64748B',    /* Slate Grey para textos secundarios */
  border: '#E2E8F0',       /* Gris azulado muy claro para bordes */
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparency/Overlays (Efectos sutiles sobre fondo blanco)
  secondaryLight: 'rgba(30, 64, 175, 0.1)',
  accentLight: 'rgba(30, 64, 175, 0.05)',
  shadow: 'rgba(30, 64, 175, 0.1)',
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
  sm: 8,
  md: 16,
  lg: 24,
  full: 999,
};

export const SHADOWS = {
  light: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1E40AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
};

const Theme = {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
};

export default Theme;

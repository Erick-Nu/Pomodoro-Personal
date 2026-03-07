/**
 * PomodoroApp - Design System (React Native)
 * Palette: Dark Minimalist (Black, Silver & Sand)
 */

export const COLORS = {
  // Brand Colors
  primary: '#000000',      // Negro (Fondo principal)
  secondary: '#F2F2F2',    // Gris muy claro (Acciones, Títulos)
  accent: '#B6B09F',       // Sage/Olive Gray (Acentos, Iconos)
  
  // Neutrals
  textMain: '#F2F2F2',     /* Blanco humo - Texto títulos */
  textMuted: '#B6B09F',    /* Sage - Texto secundario */
  border: '#EAE4D5',       /* Arena - Bordes y divisores */
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparency/Overlays (Adaptados para fondo negro)
  secondaryLight: 'rgba(242, 242, 242, 0.1)',
  accentLight: 'rgba(182, 176, 159, 0.15)',
  shadow: 'rgba(255, 255, 255, 0.05)',
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
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
};

export default {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
};

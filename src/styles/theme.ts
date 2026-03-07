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
  primary: '#FFFFFF',      
  secondary: '#1E40AF',    
  accent: '#1E40AF',       
  textMain: '#1E293B',     
  textMuted: '#64748B',    
  border: '#E2E8F0',       
  white: '#FFFFFF',
  black: '#000000',
  secondaryLight: 'rgba(30, 64, 175, 0.1)',
  accentLight: 'rgba(30, 64, 175, 0.05)',
  shadow: 'rgba(30, 64, 175, 0.1)',
};

export const TAG_COLORS = {
  nota: { bg: '#F1F5F9', text: '#475569', border: '#CBD5E1' },
  idea: { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  urgente: { bg: '#FEE2E2', text: '#B91C1C', border: '#FECACA' },
  logro: { bg: '#DCFCE7', text: '#15803D', border: '#BBF7D0' },
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

export default {
  COLORS,
  TAG_COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
};

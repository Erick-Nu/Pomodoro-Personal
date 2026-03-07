/**
 * PomodoroApp - Design System (React Native)
 * Palette: Cream, Teal & Terracotta
 */

export const COLORS = {
  // Brand Colors
  primary: '#F4F0E4',      
  secondary: '#44A194',    
  accent: '#A66B56',       
  
  // Neutrals
  textMain: '#2A3B3A',     
  textMuted: '#7B8C8A',    
  border: '#DED9C9',      
  white: '#FFFFFF',
  black: '#000000',
  
  // Transparency/Overlays
  secondaryLight: 'rgba(68, 161, 148, 0.1)',
  accentLight: 'rgba(166, 107, 86, 0.1)',
  shadow: 'rgba(42, 59, 58, 0.08)',
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
    shadowColor: COLORS.textMain,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.textMain,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default {
  COLORS,
  SPACING,
  RADIUS,
  SHADOWS,
};

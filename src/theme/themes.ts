export interface AppTheme {
  id: string;
  name: string;
  colors: {
    background: string;
    backgroundLight: string;
    surface: string;
    surfaceLight: string;
    border: string;
    accent: string;
    accentLight: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    error: string;
    success: string;
  };
  gradient: [string, string];
}

export const themes: Record<string, AppTheme> = {
  darkGradient: {
    id: 'darkGradient',
    name: 'Dark Gradient',
    colors: {
      background: '#0D0D0D',
      backgroundLight: '#1A1A1A',
      surface: '#1E1E1E',
      surfaceLight: '#2A2A2A',
      border: '#333333',
      accent: '#1E88E5',
      accentLight: '#42A5F5',
      textPrimary: '#FFFFFF',
      textSecondary: '#B0B0B0',
      textMuted: '#666666',
      error: '#EF5350',
      success: '#66BB6A',
    },
    gradient: ['#1A1A2E', '#16213E'],
  },
  midnightGradient: {
    id: 'midnightGradient',
    name: 'Midnight Gradient',
    colors: {
      background: '#0A0E1A',
      backgroundLight: '#111827',
      surface: '#1F2937',
      surfaceLight: '#374151',
      border: '#4B5563',
      accent: '#6366F1',
      accentLight: '#818CF8',
      textPrimary: '#F9FAFB',
      textSecondary: '#D1D5DB',
      textMuted: '#6B7280',
      error: '#F87171',
      success: '#34D399',
    },
    gradient: ['#0F0C29', '#302B63'],
  },
  warmGradient: {
    id: 'warmGradient',
    name: 'Warm Gradient',
    colors: {
      background: '#1C1410',
      backgroundLight: '#2D221A',
      surface: '#3D2E22',
      surfaceLight: '#4D3A2A',
      border: '#5D4A3A',
      accent: '#D97706',
      accentLight: '#F59E0B',
      textPrimary: '#FEF3C7',
      textSecondary: '#D9C8A9',
      textMuted: '#A68A5B',
      error: '#DC2626',
      success: '#65A30D',
    },
    gradient: ['#2C1810', '#4A2C17'],
  },
  blueGradient: {
    id: 'blueGradient',
    name: 'Blue Gradient',
    colors: {
      background: '#0A1628',
      backgroundLight: '#122744',
      surface: '#1A3A5C',
      surfaceLight: '#234B73',
      border: '#2D5C8A',
      accent: '#00D4FF',
      accentLight: '#4DE8FF',
      textPrimary: '#FFFFFF',
      textSecondary: '#A8D4F0',
      textMuted: '#5A9BC9',
      error: '#FF6B6B',
      success: '#4ECDC4',
    },
    gradient: ['#0F2027', '#203A43'],
  },
  softLight: {
    id: 'softLight',
    name: 'Soft Light',
    colors: {
      background: '#F8F9FA',
      backgroundLight: '#E9ECEF',
      surface: '#DEE2E6',
      surfaceLight: '#CED4DA',
      border: '#ADB5BD',
      accent: '#6C63FF',
      accentLight: '#8B85FF',
      textPrimary: '#212529',
      textSecondary: '#495057',
      textMuted: '#6C757D',
      error: '#DC3545',
      success: '#28A745',
    },
    gradient: ['#ECE9E6', '#FFFFFF'],
  },
  roseDark: {
    id: 'roseDark',
    name: 'Rose Dark',
    colors: {
      background: '#1A0A10',
      backgroundLight: '#2D1520',
      surface: '#3D2230',
      surfaceLight: '#4D2E40',
      border: '#5D3A4A',
      accent: '#E91E63',
      accentLight: '#F06292',
      textPrimary: '#FFE4E9',
      textSecondary: '#D9A8B4',
      textMuted: '#A07080',
      error: '#EF5350',
      success: '#66BB6A',
    },
    gradient: ['#1A0A10', '#2D1520'],
  },
};

export const themeIds = Object.keys(themes) as Array<keyof typeof themes>;

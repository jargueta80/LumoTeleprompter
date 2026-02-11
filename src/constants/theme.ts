export const COLORS = {
  background: '#0D0D0D',
  backgroundLight: '#1A1A1A',
  surface: '#242424',
  surfaceLight: '#2E2E2E',
  primary: '#E8E8E8',
  secondary: '#A0A0A0',
  accent: '#4A9EFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textMuted: '#666666',
  border: '#333333',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

import { Platform } from 'react-native';

export const FONTS = {
  serif: [
    { id: 'serif', name: 'Serif', family: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
    { id: 'times', name: 'Times', family: Platform.OS === 'ios' ? 'Times New Roman' : 'serif' },
  ],
  sansSerif: [
    { id: 'system', name: 'System Default', family: 'System' },
    { id: 'sans', name: 'Sans Serif', family: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif' },
    { id: 'monospace', name: 'Monospace', family: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  ],
};

export const DEFAULT_TEXT_SETTINGS = {
  fontSize: 42,
  lineHeight: 1.6,
  paragraphSpacing: 24,
  fontFamily: 'System',
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
};

export const DEFAULT_PLAYBACK_SETTINGS = {
  speed: 50,
  mirrorHorizontal: false,
  mirrorVertical: false,
};

export const DEFAULT_COLOR_PRESETS = [
  {
    id: 'classic',
    name: 'Clásico',
    textColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
  {
    id: 'night',
    name: 'Reflexión Nocturna',
    textColor: '#E0E0E0',
    backgroundColor: '#0A0A0A',
  },
  {
    id: 'warm',
    name: 'Cálido',
    textColor: '#FFE4C4',
    backgroundColor: '#1A1208',
  },
  {
    id: 'high-contrast',
    name: 'Alto Contraste',
    textColor: '#00FF00',
    backgroundColor: '#000000',
  },
  {
    id: 'soft',
    name: 'Suave',
    textColor: '#D0D0D0',
    backgroundColor: '#1C1C1C',
  },
  {
    id: 'rose',
    name: 'Rosa Suave',
    textColor: '#4A3035',
    backgroundColor: '#FFF0F3',
  },
];

export const SPEED_MIN = 1;
export const SPEED_MAX = 100;
export const SPEED_DEFAULT = 50;

export const FONT_SIZE_MIN = 24;
export const FONT_SIZE_MAX = 96;

export const LINE_HEIGHT_MIN = 1.2;
export const LINE_HEIGHT_MAX = 3.0;

export const PARAGRAPH_SPACING_MIN = 0;
export const PARAGRAPH_SPACING_MAX = 64;

export const WEBSOCKET_PORT = 8765;

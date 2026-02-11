export interface Script {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  category?: string;
  isFavorite?: boolean;
}

export interface ScriptCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export const DEFAULT_CATEGORIES: ScriptCategory[] = [
  { id: 'all', name: 'Todos', isDefault: true },
  { id: 'general', name: 'General', isDefault: true },
  { id: 'work', name: 'Trabajo', isDefault: true },
  { id: 'content', name: 'Contenido', isDefault: true },
];

export interface TextSettings {
  fontSize: number;
  lineHeight: number;
  paragraphSpacing: number;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
}

export interface PlaybackSettings {
  speed: number;
  mirrorHorizontal: boolean;
  mirrorVertical: boolean;
}

export interface ColorPreset {
  id: string;
  name: string;
  textColor: string;
  backgroundColor: string;
}

export interface AppSettings {
  textSettings: TextSettings;
  playbackSettings: PlaybackSettings;
  colorPresets: ColorPreset[];
  activePresetId: string | null;
}

export interface RemoteCommand {
  type: 'play' | 'pause' | 'stop' | 'speed' | 'seek' | 'status' | 'sync';
  payload?: {
    speed?: number;
    direction?: 'forward' | 'backward';
    amount?: 'line' | 'paragraph';
    position?: number;
  };
}

export interface RemoteState {
  isPlaying: boolean;
  speed: number;
  position: number;
  scriptTitle: string;
}

export type ConnectionMode = 'teleprompter' | 'remote' | null;

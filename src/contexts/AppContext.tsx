import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Script, AppSettings, TextSettings, PlaybackSettings, ColorPreset } from '../types';
import { storageService } from '../services/storageService';
import {
  DEFAULT_TEXT_SETTINGS,
  DEFAULT_PLAYBACK_SETTINGS,
  DEFAULT_COLOR_PRESETS,
} from '../constants/theme';

interface AppContextType {
  scripts: Script[];
  settings: AppSettings;
  isLoading: boolean;
  loadScripts: () => Promise<void>;
  saveScript: (script: Script) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  updateTextSettings: (settings: Partial<TextSettings>) => Promise<void>;
  updatePlaybackSettings: (settings: Partial<PlaybackSettings>) => Promise<void>;
  saveColorPreset: (preset: ColorPreset) => Promise<void>;
  deleteColorPreset: (id: string) => Promise<void>;
  setActivePreset: (id: string) => Promise<void>;
  applyPreset: (preset: ColorPreset) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    textSettings: DEFAULT_TEXT_SETTINGS,
    playbackSettings: DEFAULT_PLAYBACK_SETTINGS,
    colorPresets: DEFAULT_COLOR_PRESETS,
    activePresetId: 'classic',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [loadedScripts, loadedSettings] = await Promise.all([
        storageService.getScripts(),
        storageService.getSettings(),
      ]);
      setScripts(loadedScripts);
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadScripts = useCallback(async () => {
    const loadedScripts = await storageService.getScripts();
    setScripts(loadedScripts);
  }, []);

  const saveScript = useCallback(async (script: Script) => {
    await storageService.saveScript(script);
    await loadScripts();
  }, [loadScripts]);

  const deleteScript = useCallback(async (id: string) => {
    await storageService.deleteScript(id);
    await loadScripts();
  }, [loadScripts]);

  const updateTextSettings = useCallback(async (newSettings: Partial<TextSettings>) => {
    const updated = {
      ...settings,
      textSettings: { ...settings.textSettings, ...newSettings },
    };
    setSettings(updated);
    await storageService.saveSettings(updated);
  }, [settings]);

  const updatePlaybackSettings = useCallback(async (newSettings: Partial<PlaybackSettings>) => {
    const updated = {
      ...settings,
      playbackSettings: { ...settings.playbackSettings, ...newSettings },
    };
    setSettings(updated);
    await storageService.saveSettings(updated);
  }, [settings]);

  const saveColorPreset = useCallback(async (preset: ColorPreset) => {
    const existingIndex = settings.colorPresets.findIndex((p) => p.id === preset.id);
    let updatedPresets: ColorPreset[];
    if (existingIndex >= 0) {
      updatedPresets = [...settings.colorPresets];
      updatedPresets[existingIndex] = preset;
    } else {
      updatedPresets = [...settings.colorPresets, preset];
    }
    const updated = { ...settings, colorPresets: updatedPresets };
    setSettings(updated);
    await storageService.saveSettings(updated);
  }, [settings]);

  const deleteColorPreset = useCallback(async (id: string) => {
    const updatedPresets = settings.colorPresets.filter((p) => p.id !== id);
    const updated = {
      ...settings,
      colorPresets: updatedPresets,
      activePresetId: settings.activePresetId === id ? updatedPresets[0]?.id || null : settings.activePresetId,
    };
    setSettings(updated);
    await storageService.saveSettings(updated);
  }, [settings]);

  const setActivePreset = useCallback(async (id: string) => {
    const preset = settings.colorPresets.find((p) => p.id === id);
    if (preset) {
      const updated = {
        ...settings,
        activePresetId: id,
        textSettings: {
          ...settings.textSettings,
          textColor: preset.textColor,
          backgroundColor: preset.backgroundColor,
        },
      };
      setSettings(updated);
      await storageService.saveSettings(updated);
    }
  }, [settings]);

  const applyPreset = useCallback(async (preset: ColorPreset) => {
    const updated = {
      ...settings,
      activePresetId: preset.id,
      textSettings: {
        ...settings.textSettings,
        textColor: preset.textColor,
        backgroundColor: preset.backgroundColor,
      },
    };
    setSettings(updated);
    await storageService.saveSettings(updated);
  }, [settings]);

  return (
    <AppContext.Provider
      value={{
        scripts,
        settings,
        isLoading,
        loadScripts,
        saveScript,
        deleteScript,
        updateTextSettings,
        updatePlaybackSettings,
        saveColorPreset,
        deleteColorPreset,
        setActivePreset,
        applyPreset,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

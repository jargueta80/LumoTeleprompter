import AsyncStorage from '@react-native-async-storage/async-storage';
import { Script, AppSettings, ColorPreset, ScriptCategory, DEFAULT_CATEGORIES } from '../types';
import {
  DEFAULT_TEXT_SETTINGS,
  DEFAULT_PLAYBACK_SETTINGS,
  DEFAULT_COLOR_PRESETS,
} from '../constants/theme';

const KEYS = {
  SCRIPTS: '@lumo_scripts',
  SETTINGS: '@lumo_settings',
  PRESETS: '@lumo_presets',
  CATEGORIES: '@lumo_categories',
};

export const storageService = {
  async getScripts(): Promise<Script[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SCRIPTS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading scripts:', error);
      return [];
    }
  },

  async saveScripts(scripts: Script[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SCRIPTS, JSON.stringify(scripts));
    } catch (error) {
      console.error('Error saving scripts:', error);
    }
  },

  async getScript(id: string): Promise<Script | null> {
    const scripts = await this.getScripts();
    return scripts.find((s) => s.id === id) || null;
  },

  async saveScript(script: Script): Promise<void> {
    const scripts = await this.getScripts();
    const index = scripts.findIndex((s) => s.id === script.id);
    if (index >= 0) {
      scripts[index] = script;
    } else {
      scripts.unshift(script);
    }
    await this.saveScripts(scripts);
  },

  async deleteScript(id: string): Promise<void> {
    const scripts = await this.getScripts();
    const filtered = scripts.filter((s) => s.id !== id);
    await this.saveScripts(filtered);
  },

  async getSettings(): Promise<AppSettings> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (data) {
        return JSON.parse(data);
      }
      return {
        textSettings: DEFAULT_TEXT_SETTINGS,
        playbackSettings: DEFAULT_PLAYBACK_SETTINGS,
        colorPresets: DEFAULT_COLOR_PRESETS,
        activePresetId: 'classic',
      };
    } catch (error) {
      console.error('Error loading settings:', error);
      return {
        textSettings: DEFAULT_TEXT_SETTINGS,
        playbackSettings: DEFAULT_PLAYBACK_SETTINGS,
        colorPresets: DEFAULT_COLOR_PRESETS,
        activePresetId: 'classic',
      };
    }
  },

  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  },

  async saveColorPreset(preset: ColorPreset): Promise<void> {
    const settings = await this.getSettings();
    const index = settings.colorPresets.findIndex((p) => p.id === preset.id);
    if (index >= 0) {
      settings.colorPresets[index] = preset;
    } else {
      settings.colorPresets.push(preset);
    }
    await this.saveSettings(settings);
  },

  async deleteColorPreset(id: string): Promise<void> {
    const settings = await this.getSettings();
    settings.colorPresets = settings.colorPresets.filter((p) => p.id !== id);
    if (settings.activePresetId === id) {
      settings.activePresetId = settings.colorPresets[0]?.id || null;
    }
    await this.saveSettings(settings);
  },

  async getCategories(): Promise<ScriptCategory[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.CATEGORIES);
      if (data) {
        return JSON.parse(data);
      }
      return DEFAULT_CATEGORIES;
    } catch (error) {
      console.error('Error loading categories:', error);
      return DEFAULT_CATEGORIES;
    }
  },

  async saveCategories(categories: ScriptCategory[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  },

  async addCategory(name: string): Promise<ScriptCategory> {
    const categories = await this.getCategories();
    const newCategory: ScriptCategory = {
      id: `custom_${Date.now()}`,
      name,
      isDefault: false,
    };
    categories.push(newCategory);
    await this.saveCategories(categories);
    return newCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    const categories = await this.getCategories();
    const filtered = categories.filter((c) => c.id !== id || c.isDefault);
    await this.saveCategories(filtered);
  },
};

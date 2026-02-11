import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useApp } from '../contexts/AppContext';
import { FONTS, FONT_SIZE_MIN, FONT_SIZE_MAX, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX, PARAGRAPH_SPACING_MIN, PARAGRAPH_SPACING_MAX } from '../constants/theme';
import { Button, Slider } from '../components';
import { ColorPreset } from '../types';
import { useTranslation } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../theme/themes';

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export function SettingsScreen() {
  const navigation = useNavigation();
  const { t, language, changeLanguage } = useTranslation();
  const { theme, themeId, setThemeId } = useTheme();
  const {
    settings,
    updateTextSettings,
    updatePlaybackSettings,
    saveColorPreset,
    deleteColorPreset,
    applyPreset,
  } = useApp();

  const [presetModalVisible, setPresetModalVisible] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      Alert.alert(t('common', 'error'), t('settings', 'enterPresetName'));
      return;
    }

    const newPreset: ColorPreset = {
      id: generateId(),
      name: newPresetName.trim(),
      textColor: settings.textSettings.textColor,
      backgroundColor: settings.textSettings.backgroundColor,
    };

    saveColorPreset(newPreset);
    setNewPresetName('');
    setPresetModalVisible(false);
  };

  const handleDeletePreset = (preset: ColorPreset) => {
    Alert.alert(
      t('settings', 'deletePreset'),
      `${t('common', 'delete')} "${preset.name}"?`,
      [
        { text: t('common', 'cancel'), style: 'cancel' },
        { text: t('settings', 'deletePresetConfirm'), style: 'destructive', onPress: () => deleteColorPreset(preset.id) },
      ]
    );
  };

  const openDonation = () => {
    Linking.openURL('https://www.paypal.com/donate/?hosted_button_id=XFEKGXTBG3QCA');
  };

  const allFonts = [...FONTS.sansSerif, ...FONTS.serif];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('settings', 'title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'text')}</Text>
          
          <Slider
            label={t('settings', 'fontSize')}
            value={settings.textSettings.fontSize}
            min={FONT_SIZE_MIN}
            max={FONT_SIZE_MAX}
            onValueChange={(v) => updateTextSettings({ fontSize: v })}
            formatValue={(v) => `${v}px`}
          />

          <Slider
            label={t('settings', 'lineHeight')}
            value={settings.textSettings.lineHeight}
            min={LINE_HEIGHT_MIN}
            max={LINE_HEIGHT_MAX}
            step={0.1}
            onValueChange={(v) => updateTextSettings({ lineHeight: v })}
            formatValue={(v) => v.toFixed(1)}
          />

          <Slider
            label={t('settings', 'paragraphSpacing')}
            value={settings.textSettings.paragraphSpacing}
            min={PARAGRAPH_SPACING_MIN}
            max={PARAGRAPH_SPACING_MAX}
            onValueChange={(v) => updateTextSettings({ paragraphSpacing: v })}
            formatValue={(v) => `${v}px`}
          />

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>{t('settings', 'font')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fontScroll}>
            {allFonts.map((font) => (
              <TouchableOpacity
                key={font.id}
                style={[
                  styles.fontChip,
                  { backgroundColor: theme.colors.surface },
                  settings.textSettings.fontFamily === font.family && { borderColor: theme.colors.accent, backgroundColor: theme.colors.surfaceLight },
                ]}
                onPress={() => updateTextSettings({ fontFamily: font.family })}
              >
                <Text
                  style={[
                    styles.fontChipText,
                    { fontFamily: font.family === 'System' ? undefined : font.family, color: theme.colors.textSecondary },
                    settings.textSettings.fontFamily === font.family && { color: theme.colors.accent },
                  ]}
                >
                  {font.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'mirrorMode')}</Text>
          
          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.textPrimary }]}>{t('settings', 'mirrorHorizontal')}</Text>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: settings.playbackSettings.mirrorHorizontal ? theme.colors.accent : theme.colors.surface }]}
              onPress={() => updatePlaybackSettings({ mirrorHorizontal: !settings.playbackSettings.mirrorHorizontal })}
            >
              <Text style={[styles.toggleText, { color: theme.colors.textPrimary }]}>
                {settings.playbackSettings.mirrorHorizontal ? t('settings', 'on') : t('settings', 'off')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.toggleRow}>
            <Text style={[styles.toggleLabel, { color: theme.colors.textPrimary }]}>{t('settings', 'mirrorVertical')}</Text>
            <TouchableOpacity
              style={[styles.toggle, { backgroundColor: settings.playbackSettings.mirrorVertical ? theme.colors.accent : theme.colors.surface }]}
              onPress={() => updatePlaybackSettings({ mirrorVertical: !settings.playbackSettings.mirrorVertical })}
            >
              <Text style={[styles.toggleText, { color: theme.colors.textPrimary }]}>
                {settings.playbackSettings.mirrorVertical ? t('settings', 'on') : t('settings', 'off')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'colorPresets')}</Text>
            <TouchableOpacity onPress={() => setPresetModalVisible(true)}>
              <Text style={[styles.addButton, { color: theme.colors.accent }]}>{t('settings', 'saveCurrentPreset')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.presetGrid}>
            {settings.colorPresets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetCard,
                  { backgroundColor: theme.colors.surface },
                  settings.activePresetId === preset.id && { borderColor: theme.colors.accent },
                ]}
                onPress={() => applyPreset(preset)}
                onLongPress={() => handleDeletePreset(preset)}
              >
                <View
                  style={[
                    styles.presetPreview,
                    { backgroundColor: preset.backgroundColor },
                  ]}
                >
                  <Text style={[styles.presetPreviewText, { color: preset.textColor }]}>
                    Aa
                  </Text>
                </View>
                <Text style={[styles.presetName, { color: theme.colors.textSecondary }]} numberOfLines={1}>
                  {preset.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'language')}</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: theme.colors.surface }, language === 'es' && { borderColor: theme.colors.accent, backgroundColor: theme.colors.surfaceLight }]}
              onPress={() => changeLanguage('es')}
            >
              <Text style={styles.languageFlag}>🇪🇸</Text>
              <Text style={[styles.languageText, { color: theme.colors.textSecondary }, language === 'es' && { color: theme.colors.accent }]}>
                Español
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.languageButton, { backgroundColor: theme.colors.surface }, language === 'en' && { borderColor: theme.colors.accent, backgroundColor: theme.colors.surfaceLight }]}
              onPress={() => changeLanguage('en')}
            >
              <Text style={styles.languageFlag}>🇺🇸</Text>
              <Text style={[styles.languageText, { color: theme.colors.textSecondary }, language === 'en' && { color: theme.colors.accent }]}>
                English
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'theme')}</Text>
          <View style={styles.themeGrid}>
            {Object.values(themes).map((themeOption) => (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeCard,
                  { backgroundColor: themeOption.colors.surface, borderColor: themeOption.colors.border },
                  themeId === themeOption.id && { borderColor: theme.colors.accent, borderWidth: 2 },
                ]}
                onPress={() => setThemeId(themeOption.id)}
              >
                <View style={[styles.themePreview, { backgroundColor: themeOption.colors.background }]}>
                  <View style={[styles.themeAccent, { backgroundColor: themeOption.colors.accent }]} />
                  <Text style={[styles.themePreviewText, { color: themeOption.colors.textPrimary }]}>Aa</Text>
                </View>
                <Text style={[styles.themeName, { color: themeOption.colors.textPrimary }]}>
                  {t('settings', `theme${themeOption.id.charAt(0).toUpperCase() + themeOption.id.slice(1)}` as any) || themeOption.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'about')}</Text>
          <Text style={[styles.aboutText, { color: theme.colors.textSecondary }]}>
            {t('settings', 'aboutText')}
          </Text>
          
          <TouchableOpacity style={[styles.donateButton, { backgroundColor: theme.colors.surface }]} onPress={openDonation}>
            <Text style={[styles.donateText, { color: theme.colors.textPrimary }]}>❤️ {t('settings', 'donate')}</Text>
            <Text style={[styles.donateSubtitle, { color: theme.colors.textSecondary }]}>{t('settings', 'donateSubtitle')}</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={presetModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPresetModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{t('settings', 'savePreset')}</Text>
            <View style={styles.previewBox}>
              <View
                style={[
                  styles.previewInner,
                  { backgroundColor: settings.textSettings.backgroundColor },
                ]}
              >
                <Text style={{ color: settings.textSettings.textColor, fontSize: 24 }}>
                  {t('settings', 'sampleText')}
                </Text>
              </View>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.backgroundLight, color: theme.colors.textPrimary }]}
              placeholder={t('settings', 'presetName')}
              placeholderTextColor={theme.colors.textMuted}
              value={newPresetName}
              onChangeText={setNewPresetName}
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('common', 'cancel')}
                variant="ghost"
                onPress={() => { setNewPresetName(''); setPresetModalVisible(false); }}
              />
              <Button title={t('common', 'save')} onPress={handleSavePreset} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginTop: 16,
    marginBottom: 8,
  },
  fontScroll: {
    marginTop: 8,
  },
  fontChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fontChipActive: {
  },
  fontChipText: {
    fontSize: 14,
  },
  fontChipTextActive: {
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  toggleActive: {
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  addButton: {
    fontSize: 14,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  presetCard: {
    width: '30%',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetCardActive: {
  },
  presetPreview: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  presetPreviewText: {
    fontSize: 20,
    fontWeight: '600',
  },
  presetName: {
    fontSize: 12,
    textAlign: 'center',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 16,
  },
  donateButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  donateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  donateSubtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  previewBox: {
    marginBottom: 16,
  },
  previewInner: {
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  input: {
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  languageRow: {
    flexDirection: 'row',
    gap: 12,
  },
  languageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  languageButtonActive: {
  },
  languageFlag: {
    fontSize: 24,
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
  languageTextActive: {
    fontWeight: '600',
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '30%',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  themePreview: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  themeAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 8,
    height: '100%',
  },
  themePreviewText: {
    fontSize: 18,
    fontWeight: '600',
  },
  themeName: {
    fontSize: 11,
    textAlign: 'center',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks';
import { Script } from '../types';

type RootStackParamList = {
  Home: undefined;
  Editor: { scriptId?: string };
  Teleprompter: { scriptId: string };
};

type EditorRouteProp = RouteProp<RootStackParamList, 'Editor'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Editor'>;

export function EditorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<EditorRouteProp>();
  const { scripts, saveScript } = useApp();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const [script, setScript] = useState<Script | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (route.params?.scriptId) {
      const found = scripts.find((s) => s.id === route.params.scriptId);
      if (found) {
        setScript(found);
        setTitle(found.title);
        setContent(found.content);
      }
    }
  }, [route.params?.scriptId, scripts]);

  const handleSave = async () => {
    if (!script) return;
    
    const updated: Script = {
      ...script,
      title: title.trim() || t('editor', 'untitled'),
      content,
      updatedAt: Date.now(),
    };
    
    await saveScript(updated);
    setHasChanges(false);
    Alert.alert(t('editor', 'saved'), t('editor', 'savedMessage'));
  };

  const handleBack = () => {
    if (hasChanges) {
      Alert.alert(
        t('editor', 'unsavedChanges'),
        t('editor', 'unsavedMessage'),
        [
          { text: t('editor', 'discard'), style: 'destructive', onPress: () => navigation.goBack() },
          { text: t('common', 'cancel'), style: 'cancel' },
          { text: t('common', 'save'), onPress: async () => { await handleSave(); navigation.goBack(); } },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handlePlay = () => {
    if (script && content.trim()) {
      if (hasChanges) {
        handleSave().then(() => {
          navigation.navigate('Teleprompter', { scriptId: script.id });
        });
      } else {
        navigation.navigate('Teleprompter', { scriptId: script.id });
      }
    } else {
      Alert.alert(t('common', 'error'), t('editor', 'writeFirst'));
    }
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estimatedTime = Math.ceil(wordCount / 150);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.titleInput, { color: theme.colors.textPrimary }]}
          value={title}
          onChangeText={(text) => { setTitle(text); setHasChanges(true); }}
          placeholder={t('editor', 'titlePlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveIcon}>💾</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.editorContainer}
      >
        <TextInput
          style={[styles.editor, { color: theme.colors.textPrimary }]}
          value={content}
          onChangeText={(text) => { setContent(text); setHasChanges(true); }}
          placeholder={t('editor', 'contentPlaceholder')}
          placeholderTextColor={theme.colors.textMuted}
          multiline
          textAlignVertical="top"
          scrollEnabled={true}
          maxLength={undefined}
        />
      </KeyboardAvoidingView>

      <View style={[styles.footer, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surface }]}>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>{wordCount} {t('editor', 'words')}</Text>
          <Text style={[styles.statDivider, { color: theme.colors.textMuted }]}>•</Text>
          <Text style={[styles.statText, { color: theme.colors.textSecondary }]}>~{estimatedTime} {t('editor', 'readingTime')}</Text>
        </View>
        <TouchableOpacity style={[styles.playButton, { backgroundColor: theme.colors.accent }]} onPress={handlePlay}>
          <Text style={styles.playIcon}>▶</Text>
          <Text style={styles.playText}>{t('editor', 'start')}</Text>
        </TouchableOpacity>
      </View>
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
  titleInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 12,
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveIcon: {
    fontSize: 20,
  },
  editorContainer: {
    flex: 1,
  },
  editor: {
    flex: 1,
    padding: 20,
    fontSize: 18,
    lineHeight: 28,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
  },
  statDivider: {
    marginHorizontal: 8,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  playIcon: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 8,
  },
  playText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

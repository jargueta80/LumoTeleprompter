import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components';
import { Script, ScriptCategory, DEFAULT_CATEGORIES } from '../types';
import { useTranslation } from '../hooks';
import { useTheme } from '../contexts/ThemeContext';
import { storageService } from '../services/storageService';

type RootStackParamList = {
  Home: undefined;
  Editor: { scriptId?: string };
  Teleprompter: { scriptId: string };
  Settings: undefined;
  RemoteMode: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

export function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { scripts, saveScript, deleteScript, isLoading } = useApp();
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categories, setCategories] = useState<ScriptCategory[]>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedScriptCategory, setSelectedScriptCategory] = useState('general');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const cats = await storageService.getCategories();
    setCategories(cats);
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    const newCat = await storageService.addCategory(newCategoryName.trim());
    setCategories([...categories, newCat]);
    setNewCategoryName('');
    setCategoryModalVisible(false);
  };

  const filteredScripts = scripts.filter((script) => {
    if (showFavoritesOnly && !script.isFavorite) return false;
    if (selectedCategory === 'all') return true;
    return script.category === selectedCategory;
  });

  const handleCreateScript = async () => {
    if (!newTitle.trim()) {
      Alert.alert(t('common', 'error'), t('modal', 'enterTitle'));
      return;
    }

    const newScript: Script = {
      id: generateId(),
      title: newTitle.trim(),
      content: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      category: selectedScriptCategory,
      isFavorite: false,
    };

    await saveScript(newScript);
    setNewTitle('');
    setSelectedScriptCategory('general');
    setModalVisible(false);
    navigation.navigate('Editor', { scriptId: newScript.id });
  };

  const toggleFavorite = async (script: Script) => {
    const updatedScript = { ...script, isFavorite: !script.isFavorite };
    await saveScript(updatedScript);
  };

  const handleDeleteScript = (script: Script) => {
    Alert.alert(
      t('home', 'deleteScript'),
      `${t('home', 'deleteConfirm')} "${script.title}"?`,
      [
        { text: t('common', 'cancel'), style: 'cancel' },
        {
          text: t('common', 'delete'),
          style: 'destructive',
          onPress: () => deleteScript(script.id),
        },
      ]
    );
  };

  const formatDate = (timestamp: number) => {
    const locale = language === 'es' ? 'es-ES' : 'en-US';
    return new Date(timestamp).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderScript = ({ item }: { item: Script }) => (
    <TouchableOpacity
      style={[styles.scriptCard, { backgroundColor: theme.colors.surface }]}
      onPress={() => navigation.navigate('Editor', { scriptId: item.id })}
      onLongPress={() => handleDeleteScript(item)}
    >
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => toggleFavorite(item)}
      >
        <Text style={styles.favoriteIcon}>{item.isFavorite ? '★' : '☆'}</Text>
      </TouchableOpacity>
      <View style={styles.scriptInfo}>
        <Text style={[styles.scriptTitle, { color: theme.colors.textPrimary }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.scriptDate, { color: theme.colors.textMuted }]}>
          {t('home', 'modified')}: {formatDate(item.updatedAt)}
        </Text>
      </View>
      <TouchableOpacity
        style={[styles.playButton, { backgroundColor: theme.colors.accent }]}
        onPress={() => navigation.navigate('Teleprompter', { scriptId: item.id })}
      >
        <Text style={styles.playIcon}>▶</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('home', 'title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('home', 'subtitle')}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('RemoteMode')}
          >
            <Text style={styles.headerButtonIcon}>📡</Text>
            <Text style={[styles.headerButtonLabel, { color: theme.colors.textMuted }]}>
              {t('home', 'remoteControl')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.headerButtonIcon}>⚙️</Text>
            <Text style={[styles.headerButtonLabel, { color: theme.colors.textMuted }]}>
              {t('home', 'settings')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryTab,
                { backgroundColor: selectedCategory === cat.id ? theme.colors.accent : theme.colors.surface }
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[
                styles.categoryTabText,
                { color: selectedCategory === cat.id ? '#FFFFFF' : theme.colors.textPrimary }
              ]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[styles.categoryTab, styles.addCategoryTab, { backgroundColor: theme.colors.surface }]}
            onPress={() => setCategoryModalVisible(true)}
          >
            <Text style={[styles.categoryTabText, { color: theme.colors.textPrimary }]}>+ Carpeta</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Favorites Toggle */}
      <TouchableOpacity
        style={[styles.favoritesToggle, { backgroundColor: showFavoritesOnly ? theme.colors.accent : theme.colors.surface }]}
        onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
      >
        <Text style={[styles.favoritesToggleText, { color: showFavoritesOnly ? '#FFFFFF' : theme.colors.textSecondary }]}>
          Solo favoritos
        </Text>
      </TouchableOpacity>

      {filteredScripts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.textPrimary }]}>
            {showFavoritesOnly ? 'No hay favoritos' : t('home', 'noScripts')}
          </Text>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {showFavoritesOnly ? 'Marca guiones como favoritos' : t('home', 'createFirst')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredScripts}
          keyExtractor={(item) => item.id}
          renderItem={renderScript}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}

      <View style={[styles.footer, { backgroundColor: theme.colors.background }]}>
        <Button
          title={t('home', 'newScript')}
          onPress={() => setModalVisible(true)}
          icon="+"
          size="large"
          style={styles.createButton}
        />
      </View>

      {/* New Script Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>{t('modal', 'newScriptTitle')}</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.backgroundLight, color: theme.colors.textPrimary }]}
              placeholder={t('modal', 'scriptTitlePlaceholder')}
              placeholderTextColor={theme.colors.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
              autoFocus
            />
            <Text style={[styles.categorySelectLabel, { color: theme.colors.textSecondary }]}>Guardar en:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categorySelectScroll}>
              {categories.filter(c => c.id !== 'all').map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categorySelectItem,
                    { backgroundColor: selectedScriptCategory === cat.id ? theme.colors.accent : theme.colors.backgroundLight }
                  ]}
                  onPress={() => setSelectedScriptCategory(cat.id)}
                >
                  <Text style={{ color: selectedScriptCategory === cat.id ? '#FFF' : theme.colors.textPrimary }}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalButtons}>
              <Button
                title={t('common', 'cancel')}
                onPress={() => {
                  setNewTitle('');
                  setModalVisible(false);
                }}
                variant="ghost"
              />
              <Button title={t('common', 'create')} onPress={handleCreateScript} />
            </View>
          </View>
        </View>
      </Modal>

      {/* New Category Modal */}
      <Modal
        visible={categoryModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.textPrimary }]}>Nueva Carpeta</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.backgroundLight, color: theme.colors.textPrimary }]}
              placeholder="Nombre de la carpeta"
              placeholderTextColor={theme.colors.textMuted}
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Button
                title={t('common', 'cancel')}
                onPress={() => {
                  setNewCategoryName('');
                  setCategoryModalVisible(false);
                }}
                variant="ghost"
              />
              <Button title={t('common', 'create')} onPress={handleAddCategory} />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  headerButtonIcon: {
    fontSize: 20,
  },
  headerButtonLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
  },
  list: {
    padding: 20,
    paddingBottom: 100,
  },
  scriptCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scriptInfo: {
    flex: 1,
  },
  scriptTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  scriptDate: {
    fontSize: 13,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  playIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  createButton: {
    width: '100%',
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
  categoryContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  categoryScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addCategoryTab: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderStyle: 'dashed',
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoritesToggle: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  favoritesToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoriteButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  favoriteIcon: {
    fontSize: 20,
    color: '#FFD700',
  },
  categorySelectLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  categorySelectScroll: {
    marginBottom: 16,
  },
  categorySelectItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
});

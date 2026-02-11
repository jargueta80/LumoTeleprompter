import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import QRCode from 'react-native-qrcode-svg';
import { useRemote } from '../contexts/RemoteContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks';
import { Button } from '../components';

type RootStackParamList = {
  Home: undefined;
  RemoteMode: undefined;
  RemoteControl: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RemoteMode'>;

export function RemoteModeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { mode, sessionId, startTeleprompterSession, joinSession, disconnect, isConnected } = useRemote();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const [inputSessionId, setInputSessionId] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);

  const handleStartAsTeleprompter = async () => {
    setIsConnecting(true);
    const newSessionId = await startTeleprompterSession();
    setIsConnecting(false);
    
    if (!newSessionId) {
      Alert.alert(t('common', 'error'), t('remote', 'connectionError'));
    }
  };

  const handleConnectAsRemote = async () => {
    if (!inputSessionId.trim()) {
      Alert.alert(t('common', 'error'), t('remote', 'enterSessionIdError'));
      return;
    }

    setIsConnecting(true);

    try {
      const success = await joinSession(inputSessionId.trim());
      setIsConnecting(false);

      if (success) {
        navigation.navigate('RemoteControl');
      } else {
        Alert.alert(t('remote', 'connectionError'), t('remote', 'sessionNotFound'));
      }
    } catch (error) {
      setIsConnecting(false);
      Alert.alert(t('remote', 'connectionError'), t('remote', 'sessionNotFound'));
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  // QR contains the session ID for easy scanning
  const qrValue = sessionId || '';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>{t('remote', 'title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {mode === null ? (
          <>
            <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
              {t('remote', 'description')}
            </Text>

            <View style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>📱 {t('remote', 'thisDeviceAs')} {t('remote', 'teleprompterMode')}</Text>
              <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                {t('remote', 'teleprompterDesc')}
              </Text>
              <Button
                title={t('remote', 'activateTeleprompter')}
                onPress={handleStartAsTeleprompter}
                style={styles.optionButton}
              />
            </View>

            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
              <Text style={[styles.dividerText, { color: theme.colors.textMuted }]}>{t('remote', 'or')}</Text>
              <View style={[styles.dividerLine, { backgroundColor: theme.colors.border }]} />
            </View>

            <View style={[styles.optionCard, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.optionTitle, { color: theme.colors.textPrimary }]}>🎮 {t('remote', 'thisDeviceAs')} {t('remote', 'controlMode')}</Text>
              <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
                {t('remote', 'controlDesc')}
              </Text>
              
              {!showManualEntry ? (
                <Button
                  title={t('remote', 'connectToTeleprompter')}
                  onPress={() => setShowManualEntry(true)}
                  variant="secondary"
                  style={styles.optionButton}
                />
              ) : (
                <View style={styles.connectForm}>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.colors.backgroundLight, color: theme.colors.textPrimary }]}
                    placeholder={t('remote', 'sessionIdPlaceholder')}
                    placeholderTextColor={theme.colors.textMuted}
                    value={inputSessionId}
                    onChangeText={setInputSessionId}
                    autoCapitalize="characters"
                    maxLength={8}
                  />
                  {isConnecting ? (
                    <ActivityIndicator color={theme.colors.accent} />
                  ) : (
                    <Button title={t('remote', 'connect')} onPress={handleConnectAsRemote} />
                  )}
                </View>
              )}
            </View>
          </>
        ) : mode === 'teleprompter' ? (
          <View style={styles.activeMode}>
            <Text style={[styles.activeModeTitle, { color: theme.colors.textPrimary }]}>📡 {t('remote', 'teleprompterActive')}</Text>
            
            <View style={[styles.sessionCodeContainer, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.sessionCodeLabel, { color: theme.colors.textSecondary }]}>{t('remote', 'sessionCode')}</Text>
              <Text style={[styles.sessionCodeBig, { color: theme.colors.accent }]}>{sessionId || '...'}</Text>
              <TouchableOpacity
                style={[styles.copyButton, { backgroundColor: theme.colors.accent }]}
                onPress={() => {
                  Clipboard.setString(sessionId || '');
                  Alert.alert('✓', t('remote', 'codeCopied'));
                }}
              >
                <Text style={styles.copyButtonText}>{t('remote', 'copyCode')}</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.instructionsBox, { backgroundColor: theme.colors.backgroundLight }]}>
              <Text style={[styles.instructionsTitle, { color: theme.colors.textPrimary }]}>{t('remote', 'howToConnect')}</Text>
              <Text style={[styles.instructionsStep, { color: theme.colors.textSecondary }]}>1. {t('remote', 'step1')}</Text>
              <Text style={[styles.instructionsStep, { color: theme.colors.textSecondary }]}>2. {t('remote', 'step2')}</Text>
              <Text style={[styles.instructionsStep, { color: theme.colors.textSecondary }]}>3. {t('remote', 'step3')}</Text>
            </View>

            {isConnected && (
              <View style={[styles.connectedBadge, { backgroundColor: theme.colors.success }]}>
                <Text style={styles.connectedBadgeText}>✓ {t('remote', 'remoteConnected')}</Text>
              </View>
            )}

            <Button
              title={t('remote', 'disconnect')}
              onPress={handleDisconnect}
              variant="secondary"
              style={styles.disconnectButton}
            />
          </View>
        ) : (
          <View style={styles.activeMode}>
            <Text style={[styles.activeModeTitle, { color: theme.colors.textPrimary }]}>🎮 {t('remote', 'connectedAsControl')}</Text>
            <Text style={[styles.connectedTo, { color: theme.colors.textSecondary }]}>{t('remote', 'session')}: {sessionId}</Text>
            
            <Button
              title={t('remote', 'openRemoteControl')}
              onPress={() => navigation.navigate('RemoteControl')}
              style={styles.openControlButton}
            />

            <Button
              title={t('remote', 'disconnect')}
              onPress={handleDisconnect}
              variant="secondary"
              style={styles.disconnectButton}
            />
          </View>
        )}
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
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  optionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  optionButton: {
    width: '100%',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  connectForm: {
    gap: 12,
  },
  input: {
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  activeMode: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  activeModeTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
  },
  qrContainer: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  connectionInfo: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 16,
  },
  connectionLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  connectionValue: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sessionCode: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    marginTop: 8,
  },
  sessionCodeContainer: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionCodeLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  sessionCodeBig: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: 6,
    marginBottom: 16,
  },
  copyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  instructionsBox: {
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  instructionsStep: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  connectedBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 20,
  },
  connectedBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  connectedTo: {
    fontSize: 16,
    marginBottom: 24,
  },
  openControlButton: {
    width: '100%',
    marginBottom: 12,
  },
  disconnectButton: {
    width: '100%',
  },
});

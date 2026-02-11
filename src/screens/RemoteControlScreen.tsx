import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useRemote } from '../contexts/RemoteContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks';
import { SPEED_MIN, SPEED_MAX } from '../constants/theme';
import { Slider } from '../components';

export function RemoteControlScreen() {
  const navigation = useNavigation();
  const { isConnected, remoteState, sendCommand, disconnect } = useRemote();
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  const [localSpeed, setLocalSpeed] = useState(remoteState?.speed || 50);

  useEffect(() => {
    activateKeepAwakeAsync();
    return () => {
      deactivateKeepAwake();
    };
  }, []);

  useEffect(() => {
    if (remoteState?.speed !== undefined) {
      setLocalSpeed(remoteState.speed);
    }
  }, [remoteState?.speed]);

  useEffect(() => {
    if (!isConnected) {
      navigation.goBack();
    }
  }, [isConnected, navigation]);

  const handlePlay = () => {
    sendCommand({ type: 'play' });
  };

  const handlePause = () => {
    sendCommand({ type: 'pause' });
  };

  const handleStop = () => {
    sendCommand({ type: 'stop' });
  };

  const handleSpeedChange = (speed: number) => {
    setLocalSpeed(speed);
    sendCommand({ type: 'speed', payload: { speed } });
  };

  const handleSeekBackward = () => {
    sendCommand({ type: 'seek', payload: { direction: 'backward', amount: 'line' } });
  };

  const handleSeekForward = () => {
    sendCommand({ type: 'seek', payload: { direction: 'forward', amount: 'line' } });
  };

  const handleDisconnect = () => {
    disconnect();
    navigation.goBack();
  };

  const isPlaying = remoteState?.isPlaying || false;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top', 'bottom']}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={[styles.backIcon, { color: theme.colors.textPrimary }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? theme.colors.success : theme.colors.error }]} />
          <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
            {isConnected ? t('remote', 'connected') : t('remote', 'disconnected')}
          </Text>
        </View>
        <TouchableOpacity style={styles.disconnectButton} onPress={handleDisconnect}>
          <Text style={[styles.disconnectText, { color: theme.colors.textMuted }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {remoteState?.scriptTitle && (
          <View style={[styles.scriptInfo, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.scriptLabel, { color: theme.colors.textSecondary }]}>{t('remote', 'playing')}:</Text>
            <Text style={[styles.scriptTitle, { color: theme.colors.textPrimary }]}>{remoteState.scriptTitle}</Text>
          </View>
        )}

        <View style={styles.mainControls}>
          <TouchableOpacity
            style={[styles.seekButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleSeekBackward}
          >
            <Text style={[styles.seekIcon, { color: theme.colors.textPrimary }]}>⏮</Text>
            <Text style={[styles.seekLabel, { color: theme.colors.textSecondary }]}>{t('remote', 'back')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.playPauseButton, { backgroundColor: isPlaying ? theme.colors.accentLight : theme.colors.accent }]}
            onPress={isPlaying ? handlePause : handlePlay}
          >
            <Text style={styles.playPauseIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.seekButton, { backgroundColor: theme.colors.surface }]}
            onPress={handleSeekForward}
          >
            <Text style={[styles.seekIcon, { color: theme.colors.textPrimary }]}>⏭</Text>
            <Text style={[styles.seekLabel, { color: theme.colors.textSecondary }]}>{t('remote', 'forward')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.stopButton, { backgroundColor: theme.colors.surface }]} onPress={handleStop}>
          <Text style={[styles.stopIcon, { color: theme.colors.textPrimary }]}>⏹</Text>
          <Text style={[styles.stopLabel, { color: theme.colors.textPrimary }]}>{t('remote', 'stop')}</Text>
        </TouchableOpacity>

        <View style={[styles.speedSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.speedTitle, { color: theme.colors.textPrimary }]}>{t('remote', 'scrollSpeed')}</Text>
          <Slider
            value={localSpeed}
            min={SPEED_MIN}
            max={SPEED_MAX}
            onValueChange={handleSpeedChange}
            formatValue={(v) => `${v}%`}
          />
          <View style={styles.speedButtons}>
            <TouchableOpacity
              style={[styles.speedAdjustButton, { backgroundColor: theme.colors.backgroundLight }]}
              onPress={() => handleSpeedChange(Math.max(SPEED_MIN, localSpeed - 10))}
            >
              <Text style={[styles.speedAdjustText, { color: theme.colors.textPrimary }]}>-10</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.speedAdjustButton, { backgroundColor: theme.colors.backgroundLight }]}
              onPress={() => handleSpeedChange(Math.min(SPEED_MAX, localSpeed + 10))}
            >
              <Text style={[styles.speedAdjustText, { color: theme.colors.textPrimary }]}>+10</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: theme.colors.border }]}>
        <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
          🎮 {t('remote', 'remoteControlLumo')}
        </Text>
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
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotConnected: {
  },
  statusText: {
    fontSize: 14,
  },
  disconnectButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disconnectText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  scriptInfo: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  scriptLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  scriptTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    marginBottom: 24,
  },
  seekButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seekIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  seekLabel: {
    fontSize: 11,
  },
  playPauseButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseIcon: {
    fontSize: 48,
    color: '#FFFFFF',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignSelf: 'center',
    marginBottom: 32,
  },
  stopIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  stopLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  speedSection: {
    borderRadius: 16,
    padding: 20,
  },
  speedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  speedAdjustButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  speedAdjustText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 14,
  },
});

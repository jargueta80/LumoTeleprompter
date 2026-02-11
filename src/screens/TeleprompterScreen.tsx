import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  StatusBar,
  BackHandler,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useApp } from '../contexts/AppContext';
import { useRemote } from '../contexts/RemoteContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks';
import { TeleprompterView, PlaybackControls } from '../components';
import { Script, RemoteCommand } from '../types';
import { websocketService } from '../services/websocketService';

type RootStackParamList = {
  Teleprompter: { scriptId: string };
};

type TeleprompterRouteProp = RouteProp<RootStackParamList, 'Teleprompter'>;

export function TeleprompterScreen() {
  const navigation = useNavigation();
  const route = useRoute<TeleprompterRouteProp>();
  const { scripts, settings } = useApp();
  const { mode, broadcastState } = useRemote();
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [script, setScript] = useState<Script | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displaySpeed, setDisplaySpeed] = useState(settings.playbackSettings.speed);
  const speedRef = useRef(settings.playbackSettings.speed); // TRUE source of speed
  const [controlsVisible, setControlsVisible] = useState(true);
  const [position, setPosition] = useState(0);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTapTime = useRef<number>(0);
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update speed ref AND display (for UI only)
  const handleSpeedChange = useCallback((newSpeed: number) => {
    speedRef.current = newSpeed; // Direct ref update - no re-render in TeleprompterView
    setDisplaySpeed(newSpeed); // Only for slider display
  }, []);

  useEffect(() => {
    const found = scripts.find((s) => s.id === route.params.scriptId);
    if (found) {
      setScript(found);
    }
  }, [route.params.scriptId, scripts]);

  useEffect(() => {
    activateKeepAwakeAsync();
    StatusBar.setHidden(true);

    return () => {
      deactivateKeepAwake();
      StatusBar.setHidden(false);
    };
  }, []);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (mode === 'teleprompter') {
      const unsubscribe = websocketService.onMessage((command: RemoteCommand) => {
        handleRemoteCommand(command);
      });
      return () => unsubscribe();
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'teleprompter' && script) {
      broadcastState({
        isPlaying,
        speed: displaySpeed,
        position,
        scriptTitle: script.title,
      });
    }
  }, [isPlaying, displaySpeed, position, mode, script, broadcastState]);

  const handleRemoteCommand = useCallback((command: RemoteCommand) => {
    switch (command.type) {
      case 'play':
        setIsPlaying(true);
        break;
      case 'pause':
        setIsPlaying(false);
        break;
      case 'stop':
        setIsPlaying(false);
        setPosition(0);
        break;
      case 'speed':
        if (command.payload?.speed !== undefined) {
          handleSpeedChange(command.payload.speed);
        }
        break;
      case 'seek':
        break;
    }
  }, []);

  const handleExit = () => {
    setIsPlaying(false);
    navigation.goBack();
  };

  const handleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
      tapTimeout.current = null;
    }

    if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
      // Double tap - toggle controls
      setControlsVisible((prev) => !prev);
      lastTapTime.current = 0;
    } else {
      // Single tap - wait to confirm it's not a double tap
      lastTapTime.current = now;
      tapTimeout.current = setTimeout(() => {
        // Single tap confirmed - toggle play/pause
        if (isPlaying) {
          setIsPlaying(false);
          setControlsVisible(true);
        } else {
          setIsPlaying(true);
          // Auto-hide controls after starting
          if (hideControlsTimer.current) {
            clearTimeout(hideControlsTimer.current);
          }
          hideControlsTimer.current = setTimeout(() => {
            setControlsVisible(false);
          }, 3000);
        }
        tapTimeout.current = null;
      }, DOUBLE_TAP_DELAY);
    }
  };

  const showControls = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    hideControlsTimer.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  };

  const handlePause = () => {
    setIsPlaying(false);
    setControlsVisible(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setPosition(0);
    setControlsVisible(true);
  };

  const handleSeekBackward = () => {
    setPosition((prev) => Math.max(0, prev - 200));
  };

  const handleSeekForward = () => {
    setPosition((prev) => prev + 200);
  };

  if (!script) {
    return (
      <View style={styles.loading}>
        <Text style={[styles.loadingText, { color: theme.colors.textPrimary }]}>{t('common', 'loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.teleprompterContainer}
        activeOpacity={1}
        onPress={handleTap}
      >
        <TeleprompterView
          content={script.content}
          textSettings={settings.textSettings}
          playbackSettings={settings.playbackSettings}
          isPlaying={isPlaying}
          speedRef={speedRef}
          onPositionChange={setPosition}
          scrollPosition={position}
        />
      </TouchableOpacity>

      <View style={[styles.exitButton, !controlsVisible && styles.hiddenOverlay]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
        <TouchableOpacity onPress={handleExit} style={styles.exitButtonInner}>
          <Text style={[styles.exitIcon, { color: theme.colors.textPrimary }]}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.topInfo, !controlsVisible && styles.hiddenOverlay]} pointerEvents={controlsVisible ? 'auto' : 'none'}>
        <Text style={[styles.scriptTitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>
          {script.title}
        </Text>
        {mode === 'teleprompter' && (
          <View style={[styles.remoteBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.remoteBadgeText}>📡 {t('teleprompter', 'controlledRemotely')}</Text>
          </View>
        )}
      </View>

      <PlaybackControls
        isPlaying={isPlaying}
        speed={displaySpeed}
        onPlay={handlePlay}
        onPause={handlePause}
        onStop={handleStop}
        onSpeedChange={handleSpeedChange}
        onSeekBackward={handleSeekBackward}
        onSeekForward={handleSeekForward}
        visible={controlsVisible}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  teleprompterContainer: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  exitButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitButtonInner: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  exitIcon: {
    fontSize: 20,
  },
  topInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 80,
  },
  scriptTitle: {
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  remoteBadge: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  remoteBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  hiddenOverlay: {
    opacity: 0.15,
  },
});

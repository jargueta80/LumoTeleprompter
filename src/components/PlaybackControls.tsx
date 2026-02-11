import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks';
import { Slider } from './Slider';

interface PlaybackControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSpeedChange: (speed: number) => void;
  onSeekBackward: () => void;
  onSeekForward: () => void;
  visible: boolean;
  minimal?: boolean;
}

export function PlaybackControls({
  isPlaying,
  speed,
  onPlay,
  onPause,
  onStop,
  onSpeedChange,
  onSeekBackward,
  onSeekForward,
  visible,
  minimal = false,
}: PlaybackControlsProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();

  // Always visible - no hiding
  const containerStyle = [
    styles.container,
    { borderTopColor: theme.colors.border },
    minimal && styles.minimalContainer,
  ];

  return (
    <View style={containerStyle}>
      <View style={styles.mainControls}>
        <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.surface }]} onPress={onSeekBackward}>
          <Text style={[styles.controlIcon, { color: theme.colors.textPrimary }]}>⏮</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.playButton, { backgroundColor: theme.colors.accent }]}
          onPress={isPlaying ? onPause : onPlay}
        >
          <Text style={[styles.controlIcon, styles.playIcon]}>
            {isPlaying ? '⏸' : '▶'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.surface }]} onPress={onStop}>
          <Text style={[styles.controlIcon, { color: theme.colors.textPrimary }]}>⏹</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.controlButton, { backgroundColor: theme.colors.surface }]} onPress={onSeekForward}>
          <Text style={[styles.controlIcon, { color: theme.colors.textPrimary }]}>⏭</Text>
        </TouchableOpacity>
      </View>

      {!minimal && (
        <View style={styles.speedControl}>
          <Text style={[styles.speedLabel, { color: theme.colors.textSecondary }]}>{t('teleprompter', 'speed')}</Text>
          <Slider
            value={speed}
            min={1}
            max={100}
            onValueChange={onSpeedChange}
            formatValue={(v) => `${v}%`}
          />
          <View style={styles.speedPresets}>
            <TouchableOpacity 
              style={[styles.presetButton, { backgroundColor: theme.colors.surface }]} 
              onPress={() => onSpeedChange(25)}
            >
              <Text style={[styles.presetText, { color: theme.colors.textPrimary }]}>{t('teleprompter', 'slow')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { backgroundColor: theme.colors.surface }]} 
              onPress={() => onSpeedChange(50)}
            >
              <Text style={[styles.presetText, { color: theme.colors.textPrimary }]}>{t('teleprompter', 'normal')}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.presetButton, { backgroundColor: theme.colors.surface }]} 
              onPress={() => onSpeedChange(75)}
            >
              <Text style={[styles.presetText, { color: theme.colors.textPrimary }]}>{t('teleprompter', 'fast')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  minimalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingVertical: 12,
  },
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  controlIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  playIcon: {
    fontSize: 24,
  },
  speedControl: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  speedLabel: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  speedPresets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  presetButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '500',
  },
});

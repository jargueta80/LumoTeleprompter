import React, { useRef, useCallback, memo } from 'react';
import { View, StyleSheet, Text, GestureResponderEvent } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onValueChange: (value: number) => void;
  formatValue?: (value: number) => string;
  label?: string;
}

// Dead simple slider - no Animated, no complex state, just works
export const Slider = memo(function Slider({
  value,
  min,
  max,
  step,
  onValueChange,
  formatValue,
  label,
}: SliderProps) {
  const { theme } = useTheme();
  const trackRef = useRef<View>(null);
  const trackLayoutRef = useRef({ x: 0, width: 200 });

  const handleTouch = useCallback((evt: GestureResponderEvent) => {
    const { pageX } = evt.nativeEvent;
    const { x, width } = trackLayoutRef.current;
    
    if (width <= 0) return;
    
    const relativeX = pageX - x;
    const clampedX = Math.max(0, Math.min(relativeX, width));
    let newValue = (clampedX / width) * (max - min) + min;
    
    // Apply step if provided (for decimals like lineHeight)
    if (step && step < 1) {
      newValue = Math.round(newValue / step) * step;
    } else {
      newValue = Math.round(newValue);
    }
    
    const finalValue = Math.max(min, Math.min(max, newValue));
    onValueChange(finalValue);
  }, [min, max, step, onValueChange]);

  const handleLayout = useCallback(() => {
    trackRef.current?.measureInWindow((x, y, width, height) => {
      trackLayoutRef.current = { x, width };
    });
  }, []);

  const percentage = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
  const displayText = formatValue ? formatValue(value) : `${value}%`;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.labelText, { color: theme.colors.textSecondary }]}>{label}</Text>
      )}
      <Text style={[styles.valueText, { color: theme.colors.textPrimary }]}>{displayText}</Text>
      <View
        ref={trackRef}
        style={[styles.track, { backgroundColor: theme.colors.surface }]}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
      >
        <View style={[styles.fill, { width: `${percentage}%`, backgroundColor: theme.colors.accent }]} />
        <View style={[styles.thumb, { left: `${percentage}%`, backgroundColor: theme.colors.textPrimary }]} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  labelText: {
    fontSize: 14,
    marginBottom: 4,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  track: {
    height: 6,
    borderRadius: 3,
    justifyContent: 'center',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    top: -9,
    marginLeft: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
});

import React, { useRef, useEffect, useCallback, useState, RefObject } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { TextSettings, PlaybackSettings } from '../types';

interface TeleprompterViewProps {
  content: string;
  textSettings: TextSettings;
  playbackSettings: PlaybackSettings;
  isPlaying: boolean;
  speedRef: RefObject<number>; // Direct ref - no re-renders when speed changes
  onPositionChange?: (position: number) => void;
  scrollPosition?: number;
}

export function TeleprompterView({
  content,
  textSettings,
  playbackSettings,
  isPlaying,
  speedRef, // Direct ref from parent - NO re-renders when speed changes
  onPositionChange,
  scrollPosition,
}: TeleprompterViewProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const contentHeightRef = useRef(0);
  const viewHeightRef = useRef(Dimensions.get('window').height);
  const currentPosition = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isPlayingRef = useRef(isPlaying);
  const easeStartTime = useRef<number | null>(null);
  const hasEasedIn = useRef(false);
  const onPositionChangeRef = useRef(onPositionChange);

  // Force re-render only for display updates
  const [, forceUpdate] = useState(0);

  // Update refs without restarting animation - NO speed ref here!
  useEffect(() => {
    onPositionChangeRef.current = onPositionChange;
  }, [onPositionChange]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
    if (!isPlaying) {
      // Reset ease-in state when paused
      hasEasedIn.current = false;
      easeStartTime.current = null;
    }
  }, [isPlaying]);

  const paragraphs = content.split('\n\n').filter((p) => p.trim());

  // Mirror transform for text only (for beam splitter/glass reflection)
  const getTextMirrorTransform = () => {
    if (playbackSettings.mirrorHorizontal) {
      return [{ scaleX: -1 }];
    }
    return undefined;
  };


  const scrollToPosition = useCallback((position: number) => {
    scrollViewRef.current?.scrollTo({ y: position, animated: false });
  }, []);

  useEffect(() => {
    if (scrollPosition !== undefined && scrollPosition !== currentPosition.current) {
      currentPosition.current = scrollPosition;
      scrollToPosition(scrollPosition);
    }
  }, [scrollPosition, scrollToPosition]);

  // Start/stop animation based on isPlaying only
  useEffect(() => {
    if (!isPlaying) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const easeInDuration = 1500;
    const easeInQuad = (t: number): number => t * t;
    let lastTimestamp: number | null = null;

    const animate = (timestamp: number) => {
      // Check if still playing
      if (!isPlayingRef.current) {
        return;
      }

      const contentHeight = contentHeightRef.current;
      const viewHeight = viewHeightRef.current;
      const maxScroll = Math.max(0, contentHeight - viewHeight);

      // Skip if content not ready
      if (contentHeight <= viewHeight) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Initialize ease-in start time
      if (easeStartTime.current === null) {
        easeStartTime.current = timestamp;
      }

      // Calculate delta time
      if (lastTimestamp === null) {
        lastTimestamp = timestamp;
      }
      const deltaTime = Math.min((timestamp - lastTimestamp) / 1000, 0.1); // Cap at 100ms
      lastTimestamp = timestamp;

      // Get current speed from ref - reads directly, no re-render needed
      const targetPixelsPerSecond = ((speedRef.current || 50) / 100) * 150;
      
      // Apply ease-in
      let currentSpeed = targetPixelsPerSecond;
      if (!hasEasedIn.current) {
        const elapsed = timestamp - easeStartTime.current;
        const easeProgress = Math.min(elapsed / easeInDuration, 1);
        currentSpeed = targetPixelsPerSecond * easeInQuad(easeProgress);
        if (easeProgress >= 1) {
          hasEasedIn.current = true;
        }
      }
      
      // Update position
      currentPosition.current += currentSpeed * deltaTime;
      
      // Check end
      if (currentPosition.current >= maxScroll) {
        currentPosition.current = maxScroll;
        scrollToPosition(currentPosition.current);
        onPositionChangeRef.current?.(currentPosition.current);
        return;
      }

      scrollToPosition(currentPosition.current);
      onPositionChangeRef.current?.(currentPosition.current);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying, scrollToPosition]);

  const resetPosition = useCallback(() => {
    currentPosition.current = 0;
    scrollToPosition(0);
    onPositionChange?.(0);
  }, [scrollToPosition, onPositionChange]);

  const seekByAmount = useCallback((direction: 'forward' | 'backward', lines: number = 3) => {
    const amount = lines * textSettings.fontSize * textSettings.lineHeight;
    const maxScroll = Math.max(0, contentHeightRef.current - viewHeightRef.current);
    if (direction === 'forward') {
      currentPosition.current = Math.min(currentPosition.current + amount, maxScroll);
    } else {
      currentPosition.current = Math.max(currentPosition.current - amount, 0);
    }
    scrollToPosition(currentPosition.current);
    onPositionChange?.(currentPosition.current);
  }, [textSettings, scrollToPosition, onPositionChange]);

  // Build container style with proper transform
  const containerStyle = [
    styles.container,
    { backgroundColor: textSettings.backgroundColor },
    playbackSettings.mirrorVertical && { transform: [{ scaleY: -1 }] },
  ];

  return (
    <View
      style={containerStyle}
      onLayout={(e) => { viewHeightRef.current = e.nativeEvent.layout.height; forceUpdate(n => n + 1); }}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onContentSizeChange={(w, h) => { contentHeightRef.current = h; }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isPlaying}
        removeClippedSubviews={false}
      >
        {/* Top spacer - text starts at focus line position */}
        <View style={{ height: viewHeightRef.current * 0.25 }} />
        {paragraphs.map((paragraph, index) => (
          <Text
            key={index}
            style={[
              styles.text,
              {
                color: textSettings.textColor,
                fontSize: textSettings.fontSize,
                lineHeight: textSettings.fontSize * textSettings.lineHeight,
                fontFamily: textSettings.fontFamily === 'System' ? undefined : textSettings.fontFamily,
                marginBottom: textSettings.paragraphSpacing,
                transform: getTextMirrorTransform(),
              },
            ]}
          >
            {paragraph}
          </Text>
        ))}
        {/* Bottom spacer - allows scrolling past end */}
        <View style={{ height: viewHeightRef.current * 0.75 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 5,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    zIndex: 5,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  text: {
    textAlign: 'center',
  },
});

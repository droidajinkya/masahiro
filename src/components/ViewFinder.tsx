import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const VIEWFINDER_SIZE = SCREEN_WIDTH - 48;
const CORNER_SIZE = 24;
const CORNER_THICKNESS = 3;

interface ViewFinderProps {
  flashEnabled: boolean;
  onFlashToggle: () => void;
  onGalleryPress: () => void;
}

export function ViewFinder({
  flashEnabled,
  onFlashToggle,
  onGalleryPress,
}: ViewFinderProps) {
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [scanLineAnim]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, VIEWFINDER_SIZE - 4],
  });

  return (
    <View style={styles.container}>
      {/* Top-left corner */}
      <View style={[styles.corner, styles.cornerTopLeft]} />
      {/* Top-right corner */}
      <View style={[styles.corner, styles.cornerTopRight]} />
      {/* Bottom-left corner */}
      <View style={[styles.corner, styles.cornerBottomLeft]} />
      {/* Bottom-right corner */}
      <View style={[styles.corner, styles.cornerBottomRight]} />

      {/* Scanning line */}
      <Animated.View
        style={[
          styles.scanLine,
          { transform: [{ translateY: scanLineTranslateY }] },
        ]}
      />

      {/* Flash toggle */}
      <TouchableOpacity
        style={styles.flashButton}
        onPress={onFlashToggle}
        activeOpacity={0.7}
      >
        <Ionicons
          name={flashEnabled ? 'flash' : 'flash-off'}
          size={20}
          color={flashEnabled ? Colors.accent : Colors.textPrimary}
        />
      </TouchableOpacity>

      {/* Gallery icon */}
      <TouchableOpacity
        style={styles.galleryButton}
        onPress={onGalleryPress}
        activeOpacity={0.7}
      >
        <Ionicons name="images" size={20} color={Colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE,
    position: 'relative',
    overflow: 'hidden',
  },

  // Corner brackets
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: Colors.accent,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderTopLeftRadius: 4,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderTopRightRadius: 4,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderLeftWidth: CORNER_THICKNESS,
    borderBottomLeftRadius: 4,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_THICKNESS,
    borderRightWidth: CORNER_THICKNESS,
    borderBottomRightRadius: 4,
  },

  // Scan line
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.accent,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },

  // Overlay buttons
  flashButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  galleryButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

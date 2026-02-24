import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Colors } from '../constants/colors';
import { ScanRecord } from '../constants/qrTypes';
import { ViewFinder } from '../components/ViewFinder';
import { ScanCard } from '../components/ScanCard';
import { ScanResultSheet } from '../components/ScanResultSheet';
import { FilterChips } from '../components/FilterChips';
import { useScanner } from '../hooks/useScanner';
import { useScanHistory } from '../hooks/useScanHistory';
import { parseQRData } from '../utils/qrParser';
import { loadSettings } from '../utils/storage';
import { v4 as uuidv4 } from 'uuid';

type FilterValue = 'All' | ScanRecord['type'];

export function ScanScreen() {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filter, setFilter] = useState<FilterValue>('All');
  const [autoOpen, setAutoOpen] = useState(false);

  const { history, recentScans, addScan, toggleSaved } = useScanHistory();

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setCameraPermission(status === 'granted');
    });
    loadSettings().then((s) => setAutoOpen(s.autoOpenURLs));
  }, []);

  // Pause camera when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        setIsCameraActive(false);
      };
    }, [])
  );

  const handleScanResult = useCallback(
    (record: ScanRecord) => {
      addScan(record);
      setSelectedRecord(record);
      setSheetVisible(true);
      setIsCameraActive(false);

      if (autoOpen && record.type === 'URL') {
        Linking.openURL(record.parsedData.url || record.rawData).catch(() => {});
      }
    },
    [addScan, autoOpen]
  );

  const { handleBarCodeScanned, resetScanner } = useScanner({
    onScan: handleScanResult,
    saveHistory: true,
  });

  const handleGalleryPress = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const scanned = await BarCodeScanner.scanFromURLAsync(uri);
      if (scanned.length > 0) {
        const raw = scanned[0].data;
        const parsed = parseQRData(raw);
        const record: ScanRecord = {
          id: uuidv4(),
          rawData: raw,
          type: parsed.type,
          parsedData: parsed.parsedData,
          timestamp: new Date().toISOString(),
          isSaved: false,
          title: parsed.title,
          subtitle: parsed.subtitle,
        };
        handleScanResult(record);
      } else {
        Alert.alert('No QR code found', 'Could not detect a QR code in the selected image.');
      }
    }
  };

  const filteredRecent = filter === 'All'
    ? recentScans
    : recentScans.filter((r) => r.type === filter);

  // ─── Permission denied state ─────────────────────────────────────────────
  if (cameraPermission === false) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionText}>
          Scanner Pro needs camera access to scan QR codes and barcodes.
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={() => Linking.openSettings()}
          activeOpacity={0.8}
        >
          <Text style={styles.permissionButtonText}>Open Settings</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="qr-code" size={22} color={Colors.accent} />
          <Text style={styles.appName}>Scanner Pro</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Camera Viewfinder Card */}
        <View style={styles.cameraCard}>
          {isCameraActive && cameraPermission ? (
            <Camera
              style={styles.camera}
              type={CameraType.back}
              flashMode={flashEnabled ? FlashMode.torch : FlashMode.off}
              onBarCodeScanned={handleBarCodeScanned}
              barCodeScannerSettings={{
                barCodeTypes: [BarCodeScanner.Constants.BarCodeType.qr],
              }}
            >
              <ViewFinder
                flashEnabled={flashEnabled}
                onFlashToggle={() => setFlashEnabled((v) => !v)}
                onGalleryPress={handleGalleryPress}
              />
            </Camera>
          ) : (
            <View style={styles.cameraPlaceholder}>
              <ViewFinder
                flashEnabled={flashEnabled}
                onFlashToggle={() => setFlashEnabled((v) => !v)}
                onGalleryPress={handleGalleryPress}
              />
            </View>
          )}
        </View>

        <Text style={styles.hint}>Point camera at a code</Text>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.primaryBtn, isCameraActive && styles.primaryBtnActive]}
            onPress={() => {
              resetScanner();
              setIsCameraActive((v) => !v);
            }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isCameraActive ? 'stop-circle' : 'camera'}
              size={20}
              color="#000000"
            />
            <Text style={styles.primaryBtnText}>
              {isCameraActive ? 'Stop' : 'Scan Code'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={handleGalleryPress}
            activeOpacity={0.8}
          >
            <Ionicons name="cloud-upload-outline" size={20} color={Colors.textPrimary} />
            <Text style={styles.secondaryBtnText}>Upload</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Scans */}
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Scans</Text>
          {history.length > 0 && (
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAll}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <FilterChips selected={filter} onSelect={(v) => setFilter(v as FilterValue)} />

        {/* Scan list */}
        {filteredRecent.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="scan-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No scans yet</Text>
            <Text style={styles.emptyText}>
              Tap "Scan Code" to start scanning QR codes
            </Text>
          </View>
        ) : (
          <View style={{ paddingTop: 8 }}>
            {filteredRecent.map((record) => (
              <ScanCard
                key={record.id}
                record={record}
                onToggleSaved={toggleSaved}
                onPress={(r) => {
                  setSelectedRecord(r);
                  setSheetVisible(true);
                }}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Result Sheet */}
      <ScanResultSheet
        record={selectedRecord}
        visible={sheetVisible}
        onClose={() => {
          setSheetVisible(false);
          setSelectedRecord(null);
        }}
        onToggleSaved={toggleSaved}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appName: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  scroll: {
    flex: 1,
  },
  cameraCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  primaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingVertical: 14,
  },
  primaryBtnActive: {
    backgroundColor: Colors.error,
  },
  primaryBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.cardBackground,
    borderRadius: 999,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryBtnText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  viewAll: {
    color: Colors.accent,
    fontSize: 13,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 16,
  },
  permissionTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  permissionText: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: Colors.accent,
    borderRadius: 999,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginTop: 8,
  },
  permissionButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '700',
  },
});

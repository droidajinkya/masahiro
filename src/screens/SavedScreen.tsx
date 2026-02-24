import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';
import { ScanRecord } from '../constants/qrTypes';
import { ScanCard } from '../components/ScanCard';
import { ScanResultSheet } from '../components/ScanResultSheet';
import { useScanHistory } from '../hooks/useScanHistory';

export function SavedScreen() {
  const { savedScans, toggleSaved } = useScanHistory();
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved</Text>
        <Text style={styles.count}>
          {savedScans.length} item{savedScans.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {savedScans.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="bookmark-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>No saved scans</Text>
          <Text style={styles.emptyText}>
            Tap the bookmark icon on any scan to save it here for quick access.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
        >
          {savedScans.map((record) => (
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
        </ScrollView>
      )}

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
    alignItems: 'baseline',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  count: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 36,
  },
  emptyTitle: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});

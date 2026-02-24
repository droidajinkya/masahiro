import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SectionList,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';

import { Colors } from '../constants/colors';
import { ScanRecord, QRScanType } from '../constants/qrTypes';
import { ScanCard } from '../components/ScanCard';
import { FilterChips } from '../components/FilterChips';
import { ScanResultSheet } from '../components/ScanResultSheet';
import { useScanHistory } from '../hooks/useScanHistory';
import { groupScansByDate } from '../utils/qrParser';

type FilterValue = 'All' | QRScanType;

export function HistoryScreen() {
  const { history, deleteScan, deleteScans, clearAll, toggleSaved } = useScanHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterValue>('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ScanRecord | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const filtered = useMemo(() => {
    let result = history;

    if (filter !== 'All') {
      result = result.filter((r) => r.type === filter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.subtitle.toLowerCase().includes(q) ||
          r.rawData.toLowerCase().includes(q)
      );
    }

    return result;
  }, [history, filter, searchQuery]);

  const sections = useMemo(() => groupScansByDate(filtered), [filtered]);

  const handleLongPress = (id: string) => {
    setIsSelecting(true);
    setSelectedIds(new Set([id]));
  };

  const handleTap = (record: ScanRecord) => {
    if (isSelecting) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(record.id)) next.delete(record.id);
        else next.add(record.id);
        if (next.size === 0) setIsSelecting(false);
        return next;
      });
    } else {
      setSelectedRecord(record);
      setSheetVisible(true);
    }
  };

  const handleBulkDelete = () => {
    Alert.alert(
      'Delete Selected',
      `Delete ${selectedIds.size} scan${selectedIds.size > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteScans(Array.from(selectedIds));
            setSelectedIds(new Set());
            setIsSelecting(false);
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear History',
      'This will delete all non-saved scans. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearAll,
        },
      ]
    );
  };

  const renderDeleteAction = (id: string) => (
    <TouchableOpacity
      style={styles.deleteAction}
      onPress={() =>
        Alert.alert('Delete', 'Remove this scan from history?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteScan(id) },
        ])
      }
    >
      <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>History</Text>
          {history.length > 0 && !isSelecting && (
            <TouchableOpacity onPress={handleClearAll} activeOpacity={0.7}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
          {isSelecting && (
            <View style={styles.selectionActions}>
              <TouchableOpacity
                style={styles.bulkDeleteBtn}
                onPress={handleBulkDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
                <Text style={styles.bulkDeleteText}>Delete ({selectedIds.size})</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setIsSelecting(false);
                  setSelectedIds(new Set());
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history..."
            placeholderTextColor={Colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Chips */}
        <FilterChips selected={filter} onSelect={(v) => setFilter(v as FilterValue)} />

        {/* List */}
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="time-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : 'No scan history'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try a different search term'
                : 'Your scanned QR codes will appear here'}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            renderSectionHeader={({ section: { title } }) => (
              <Text style={styles.sectionLabel}>{title}</Text>
            )}
            renderItem={({ item }) => (
              <Swipeable
                renderRightActions={() => renderDeleteAction(item.id)}
                rightThreshold={40}
              >
                <View style={isSelecting && selectedIds.has(item.id) ? styles.selectedCard : {}}>
                  <ScanCard
                    record={item}
                    onToggleSaved={toggleSaved}
                    onPress={handleTap}
                  />
                </View>
              </Swipeable>
            )}
            contentContainerStyle={{ paddingBottom: 24 }}
          />
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
    </GestureHandlerRootView>
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
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  clearText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  bulkDeleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bulkDeleteText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  cancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 4,
  },
  searchIcon: {
    marginRight: 2,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    padding: 0,
  },
  sectionLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 32,
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
  selectedCard: {
    backgroundColor: Colors.accentDim,
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  deleteAction: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 70,
    borderRadius: 14,
    marginBottom: 10,
    marginRight: 16,
  },
});

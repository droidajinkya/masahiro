import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { QRScanType, FILTER_CHIPS } from '../constants/qrTypes';
import { Colors } from '../constants/colors';

type FilterValue = QRScanType | 'All';

interface FilterChipsProps {
  selected: FilterValue;
  onSelect: (value: FilterValue) => void;
}

export function FilterChips({ selected, onSelect }: FilterChipsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_CHIPS.map((chip) => {
        const isSelected = chip.value === selected;
        return (
          <TouchableOpacity
            key={chip.value}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(chip.value)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
});

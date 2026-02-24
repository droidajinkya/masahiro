import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '../constants/colors';
import { AppSettings, loadSettings, saveSettings, clearHistory } from '../utils/storage';

const APP_VERSION = '1.0.0';

export function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    autoOpenURLs: false,
    vibrateOnScan: true,
    beepOnScan: false,
    saveHistory: true,
  });

  useEffect(() => {
    loadSettings().then(setSettings);
  }, []);

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await saveSettings(updated);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will remove all non-saved scan records. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearHistory();
            Alert.alert('Done', 'History cleared.');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      {/* Scanner Section */}
      <SectionHeader title="SCANNER" />
      <View style={styles.section}>
        <SettingRow
          icon="globe-outline"
          iconColor={Colors.typeURL}
          label="Auto-open URLs"
          description="Automatically open URLs after scanning"
          right={
            <Switch
              value={settings.autoOpenURLs}
              onValueChange={(v) => updateSetting('autoOpenURLs', v)}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.border}
            />
          }
        />
        <Divider />
        <SettingRow
          icon="phone-portrait-outline"
          iconColor={Colors.typePhone}
          label="Vibrate on scan"
          description="Haptic feedback when a code is detected"
          right={
            <Switch
              value={settings.vibrateOnScan}
              onValueChange={(v) => updateSetting('vibrateOnScan', v)}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.border}
            />
          }
        />
        <Divider />
        <SettingRow
          icon="musical-note-outline"
          iconColor={Colors.typeGeo}
          label="Beep on scan"
          description="Play a sound when a code is detected"
          right={
            <Switch
              value={settings.beepOnScan}
              onValueChange={(v) => updateSetting('beepOnScan', v)}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.border}
            />
          }
        />
      </View>

      {/* History Section */}
      <SectionHeader title="HISTORY" />
      <View style={styles.section}>
        <SettingRow
          icon="time-outline"
          iconColor={Colors.typeContact}
          label="Save scan history"
          description="Keep a record of scanned codes"
          right={
            <Switch
              value={settings.saveHistory}
              onValueChange={(v) => updateSetting('saveHistory', v)}
              trackColor={{ false: Colors.border, true: Colors.accent }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={Colors.border}
            />
          }
        />
        <Divider />
        <TouchableOpacity
          style={styles.destructiveRow}
          onPress={handleClearHistory}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors.error + '22' }]}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </View>
          <Text style={styles.destructiveLabel}>Clear History</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      {/* Appearance Section */}
      <SectionHeader title="APPEARANCE" />
      <View style={styles.section}>
        <SettingRow
          icon="moon-outline"
          iconColor={Colors.typeWiFi}
          label="Dark Mode"
          description="Currently using dark theme"
          right={
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Dark</Text>
            </View>
          }
        />
      </View>

      {/* About Section */}
      <SectionHeader title="ABOUT" />
      <View style={styles.section}>
        <SettingRow
          icon="information-circle-outline"
          iconColor={Colors.textSecondary}
          label="Version"
          right={<Text style={styles.valueText}>{APP_VERSION}</Text>}
        />
        <Divider />
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://apps.apple.com').catch(() => {})}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors.typePayment + '22' }]}>
            <Ionicons name="star-outline" size={18} color={Colors.typePayment} />
          </View>
          <Text style={styles.linkLabel}>Rate App</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => Linking.openURL('https://example.com/privacy').catch(() => {})}
          activeOpacity={0.7}
        >
          <View style={[styles.iconContainer, { backgroundColor: Colors.typeURL + '22' }]}>
            <Ionicons name="shield-checkmark-outline" size={18} color={Colors.typeURL} />
          </View>
          <Text style={styles.linkLabel}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <Text style={sectionHeaderStyles.text}>{title}</Text>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  text: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
});

function Divider() {
  return <View style={{ height: 1, backgroundColor: Colors.divider, marginLeft: 56 }} />;
}

interface SettingRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  iconColor: string;
  label: string;
  description?: string;
  right?: React.ReactNode;
}

function SettingRow({ icon, iconColor, label, description, right }: SettingRowProps) {
  return (
    <View style={settingRowStyles.row}>
      <View style={[settingRowStyles.iconContainer, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={settingRowStyles.content}>
        <Text style={settingRowStyles.label}>{label}</Text>
        {description && (
          <Text style={settingRowStyles.description}>{description}</Text>
        )}
      </View>
      <View style={settingRowStyles.right}>{right}</View>
    </View>
  );
}

const settingRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  right: {
    alignItems: 'flex-end',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  section: {
    backgroundColor: Colors.cardBackground,
    marginHorizontal: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  destructiveLabel: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '500',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  linkLabel: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  valueText: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  badge: {
    backgroundColor: Colors.cardBackgroundAlt,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
});

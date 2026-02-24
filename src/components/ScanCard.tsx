import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { ScanRecord } from '../constants/qrTypes';
import { TypeIcon } from './TypeIcon';
import { Colors } from '../constants/colors';
import { formatTimestamp } from '../utils/qrParser';

interface ScanCardProps {
  record: ScanRecord;
  onToggleSaved?: (id: string) => void;
  onPress?: (record: ScanRecord) => void;
}

export function ScanCard({ record, onToggleSaved, onPress }: ScanCardProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(record.rawData);
  };

  const handleShare = async () => {
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(record.rawData).catch(() => {});
    }
  };

  const handleOpen = () => {
    if (record.type === 'URL') {
      Linking.openURL(record.parsedData.url || record.rawData).catch(() => {});
    } else if (record.type === 'Email') {
      Linking.openURL(record.rawData).catch(() => {});
    } else if (record.type === 'Phone') {
      Linking.openURL(`tel:${record.parsedData.number}`).catch(() => {});
    } else if (record.type === 'SMS') {
      const smsUri = `sms:${record.parsedData.number}${
        record.parsedData.message ? `?body=${encodeURIComponent(record.parsedData.message)}` : ''
      }`;
      Linking.openURL(smsUri).catch(() => {});
    } else if (record.type === 'Geo') {
      const mapsUri = `https://maps.google.com/?q=${record.parsedData.lat},${record.parsedData.lon}`;
      Linking.openURL(mapsUri).catch(() => {});
    }
  };

  const handleSaveContact = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please allow contacts access in Settings.');
      return;
    }
    const d = record.parsedData;
    const contact: Contacts.Contact = {
      contactType: Contacts.ContactTypes.Person,
      name: d.fullName || d.name || 'Unknown',
      firstName: d.name?.split(' ')[0] || d.fullName?.split(' ')[0],
      lastName: d.name?.split(' ').slice(1).join(' ') || d.fullName?.split(' ').slice(1).join(' '),
      phoneNumbers: d.phone ? [{ number: d.phone, label: 'mobile' }] : undefined,
      emails: d.email ? [{ email: d.email, label: 'work' }] : undefined,
      company: d.org,
    };
    await Contacts.addContactAsync(contact);
    Alert.alert('Saved', 'Contact saved to your contacts.');
  };

  const handleWiFiConnect = () => {
    Alert.alert(
      'Wi-Fi Network',
      `Network: ${record.parsedData.ssid}\nPassword: ${record.parsedData.password || 'None'}\n\nGo to Settings > Wi-Fi to connect.`,
      [
        { text: 'Copy Password', onPress: () => Clipboard.setStringAsync(record.parsedData.password || '') },
        { text: 'OK' },
      ]
    );
  };

  const renderActions = () => {
    switch (record.type) {
      case 'URL':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpen} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Open</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleShare} activeOpacity={0.7}>
              <Ionicons name="share-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'WiFi':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleWiFiConnect} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Connect</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'Contact':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleSaveContact} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Save Contact</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Email':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpen} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Send Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'Phone':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpen} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'SMS':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpen} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Send SMS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'Geo':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleOpen} activeOpacity={0.7}>
              <Text style={styles.actionBtnText}>Open Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      case 'Payment':
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
      default:
        return (
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons name="copy-outline" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(record)}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <TypeIcon type={record.type} size={40} />
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={1}>
            {record.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {record.subtitle}
          </Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.timestamp}>{formatTimestamp(record.timestamp)}</Text>
          {onToggleSaved && (
            <TouchableOpacity
              onPress={() => onToggleSaved(record.id)}
              style={styles.saveBtn}
              activeOpacity={0.7}
            >
              <Ionicons
                name={record.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={16}
                color={record.isSaved ? Colors.accent : Colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
      {renderActions()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  content: {
    flex: 1,
    gap: 3,
  },
  title: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  right: {
    alignItems: 'flex-end',
    gap: 6,
  },
  timestamp: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  saveBtn: {
    padding: 2,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  actionBtn: {
    backgroundColor: Colors.accentDim,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  actionBtnText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

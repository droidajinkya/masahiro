import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as Contacts from 'expo-contacts';
import { Ionicons } from '@expo/vector-icons';
import { ScanRecord, QR_TYPE_LABELS } from '../constants/qrTypes';
import { TypeIcon } from './TypeIcon';
import { Colors } from '../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ScanResultSheetProps {
  record: ScanRecord | null;
  visible: boolean;
  onClose: () => void;
  onToggleSaved: (id: string) => void;
}

export function ScanResultSheet({
  record,
  visible,
  onClose,
  onToggleSaved,
}: ScanResultSheetProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!record) return null;

  const handleCopy = () => Clipboard.setStringAsync(record.rawData);

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
      const smsUri = `sms:${record.parsedData.number}${record.parsedData.message ? `?body=${encodeURIComponent(record.parsedData.message)}` : ''}`;
      Linking.openURL(smsUri).catch(() => {});
    } else if (record.type === 'Geo') {
      Linking.openURL(`https://maps.google.com/?q=${record.parsedData.lat},${record.parsedData.lon}`).catch(() => {});
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
      `Network: ${record.parsedData.ssid}\nSecurity: ${record.parsedData.security || 'Unknown'}\nPassword: ${record.parsedData.password || 'None'}\n\nGo to Settings > Wi-Fi to connect manually.`,
      [
        {
          text: 'Copy Password',
          onPress: () => Clipboard.setStringAsync(record.parsedData.password || ''),
        },
        { text: 'OK' },
      ]
    );
  };

  const renderDetailRows = () => {
    const d = record.parsedData;
    const rows: Array<{ label: string; value: string }> = [];

    switch (record.type) {
      case 'URL':
        if (d.host) rows.push({ label: 'Host', value: d.host });
        rows.push({ label: 'URL', value: d.url || record.rawData });
        break;
      case 'WiFi':
        if (d.ssid) rows.push({ label: 'Network', value: d.ssid });
        if (d.security) rows.push({ label: 'Security', value: d.security });
        if (d.password) rows.push({ label: 'Password', value: d.password });
        break;
      case 'Contact':
        if (d.fullName || d.name) rows.push({ label: 'Name', value: d.fullName || d.name || '' });
        if (d.phone) rows.push({ label: 'Phone', value: d.phone });
        if (d.email) rows.push({ label: 'Email', value: d.email });
        if (d.org) rows.push({ label: 'Company', value: d.org });
        if (d.title) rows.push({ label: 'Title', value: d.title });
        if (d.address) rows.push({ label: 'Address', value: d.address });
        break;
      case 'Payment':
        if (d.pa) rows.push({ label: 'UPI ID', value: d.pa });
        if (d.pn) rows.push({ label: 'Name', value: d.pn });
        if (d.am) rows.push({ label: 'Amount', value: '₹' + d.am });
        if (d.tn) rows.push({ label: 'Note', value: d.tn });
        break;
      case 'Email':
        if (d.email) rows.push({ label: 'To', value: d.email });
        if (d.subject) rows.push({ label: 'Subject', value: d.subject });
        if (d.body) rows.push({ label: 'Body', value: d.body });
        break;
      case 'Phone':
        if (d.number) rows.push({ label: 'Number', value: d.number });
        break;
      case 'SMS':
        if (d.number) rows.push({ label: 'To', value: d.number });
        if (d.message) rows.push({ label: 'Message', value: d.message });
        break;
      case 'Geo':
        if (d.lat) rows.push({ label: 'Latitude', value: d.lat });
        if (d.lon) rows.push({ label: 'Longitude', value: d.lon });
        break;
      case 'Text':
        rows.push({ label: 'Content', value: d.text || record.rawData });
        break;
    }

    return rows;
  };

  const renderActions = () => {
    switch (record.type) {
      case 'URL':
        return (
          <>
            <ActionButton label="Open in Browser" icon="open-outline" onPress={handleOpen} primary />
            <ActionButton label="Copy URL" icon="copy-outline" onPress={handleCopy} />
            <ActionButton label="Share" icon="share-outline" onPress={handleShare} />
          </>
        );
      case 'WiFi':
        return (
          <>
            <ActionButton label="Connect to Wi-Fi" icon="wifi-outline" onPress={handleWiFiConnect} primary />
            <ActionButton label="Copy Password" icon="copy-outline" onPress={() => Clipboard.setStringAsync(record.parsedData.password || '')} />
          </>
        );
      case 'Contact':
        return (
          <>
            <ActionButton label="Save to Contacts" icon="person-add-outline" onPress={handleSaveContact} primary />
            <ActionButton label="Copy" icon="copy-outline" onPress={handleCopy} />
          </>
        );
      case 'Payment':
        return (
          <>
            <ActionButton label="Copy UPI ID" icon="copy-outline" onPress={() => Clipboard.setStringAsync(record.parsedData.pa || '')} primary />
            <ActionButton label="Share" icon="share-outline" onPress={handleShare} />
          </>
        );
      case 'Email':
        return (
          <>
            <ActionButton label="Send Email" icon="mail-outline" onPress={handleOpen} primary />
            <ActionButton label="Copy" icon="copy-outline" onPress={handleCopy} />
          </>
        );
      case 'Phone':
        return (
          <>
            <ActionButton label="Call" icon="call-outline" onPress={handleOpen} primary />
            <ActionButton label="Copy" icon="copy-outline" onPress={handleCopy} />
          </>
        );
      case 'SMS':
        return (
          <>
            <ActionButton label="Send SMS" icon="chatbubble-outline" onPress={handleOpen} primary />
            <ActionButton label="Copy" icon="copy-outline" onPress={handleCopy} />
          </>
        );
      case 'Geo':
        return (
          <>
            <ActionButton label="Open in Maps" icon="map-outline" onPress={handleOpen} primary />
            <ActionButton label="Copy Coordinates" icon="copy-outline" onPress={handleCopy} />
          </>
        );
      default:
        return (
          <>
            <ActionButton label="Copy" icon="copy-outline" onPress={handleCopy} primary />
            <ActionButton label="Share" icon="share-outline" onPress={handleShare} />
          </>
        );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <View style={styles.headerLeft}>
            <TypeIcon type={record.type} size={44} />
            <View style={styles.headerText}>
              <View style={styles.typeBadge}>
                <Text style={styles.typeBadgeText}>
                  {QR_TYPE_LABELS[record.type]}
                </Text>
              </View>
              <Text style={styles.titleText} numberOfLines={2}>
                {record.title}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => onToggleSaved(record.id)}
              style={styles.saveToggle}
              activeOpacity={0.7}
            >
              <Ionicons
                name={record.isSaved ? 'bookmark' : 'bookmark-outline'}
                size={22}
                color={record.isSaved ? Colors.accent : Colors.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Details */}
        <ScrollView style={styles.details} showsVerticalScrollIndicator={false}>
          {renderDetailRows().map((row, i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{row.label}</Text>
              <Text style={styles.detailValue} selectable>
                {row.value}
              </Text>
            </View>
          ))}
        </ScrollView>

        {/* Actions */}
        <View style={styles.actionsContainer}>{renderActions()}</View>
      </Animated.View>
    </Modal>
  );
}

interface ActionButtonProps {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  primary?: boolean;
}

function ActionButton({ label, icon, onPress, primary }: ActionButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.actionButton, primary && styles.actionButtonPrimary]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={18}
        color={primary ? '#000000' : Colors.textPrimary}
      />
      <Text style={[styles.actionButtonText, primary && styles.actionButtonTextPrimary]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    paddingBottom: 34,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerText: {
    flex: 1,
    gap: 4,
  },
  typeBadge: {
    backgroundColor: Colors.accentDim,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.accent + '44',
  },
  typeBadgeText: {
    color: Colors.accent,
    fontSize: 11,
    fontWeight: '600',
  },
  titleText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 8,
  },
  saveToggle: {
    padding: 4,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  details: {
    maxHeight: 200,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  detailRow: {
    marginBottom: 12,
    gap: 2,
  },
  detailLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    color: Colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.cardBackgroundAlt,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  actionButtonText: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: '#000000',
  },
});

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { QRScanType } from '../constants/qrTypes';
import { Colors } from '../constants/colors';

interface TypeIconProps {
  type: QRScanType;
  size?: number;
}

const TYPE_CONFIG: Record<
  QRScanType,
  { iconName: keyof typeof Ionicons.glyphMap; bgColor: string; iconColor: string }
> = {
  URL: {
    iconName: 'link',
    bgColor: Colors.typeURL + '33',
    iconColor: Colors.typeURL,
  },
  WiFi: {
    iconName: 'wifi',
    bgColor: Colors.typeWiFi + '33',
    iconColor: Colors.typeWiFi,
  },
  Contact: {
    iconName: 'person',
    bgColor: Colors.typeContact + '33',
    iconColor: Colors.typeContact,
  },
  Payment: {
    iconName: 'card',
    bgColor: Colors.typePayment + '33',
    iconColor: Colors.typePayment,
  },
  Text: {
    iconName: 'document-text',
    bgColor: '#333333',
    iconColor: '#999999',
  },
  Email: {
    iconName: 'mail',
    bgColor: Colors.typeEmail + '33',
    iconColor: Colors.typeEmail,
  },
  Phone: {
    iconName: 'call',
    bgColor: Colors.typePhone + '33',
    iconColor: Colors.typePhone,
  },
  SMS: {
    iconName: 'chatbubble',
    bgColor: Colors.typeSMS + '33',
    iconColor: Colors.typeSMS,
  },
  Geo: {
    iconName: 'location',
    bgColor: Colors.typeGeo + '33',
    iconColor: Colors.typeGeo,
  },
};

export function TypeIcon({ type, size = 40 }: TypeIconProps) {
  const config = TYPE_CONFIG[type] ?? TYPE_CONFIG.Text;
  const iconSize = Math.round(size * 0.5);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.25,
          backgroundColor: config.bgColor,
        },
      ]}
    >
      <Ionicons name={config.iconName} size={iconSize} color={config.iconColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

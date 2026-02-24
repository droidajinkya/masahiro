export type QRScanType =
  | 'URL'
  | 'WiFi'
  | 'Contact'
  | 'Payment'
  | 'Text'
  | 'Email'
  | 'Phone'
  | 'SMS'
  | 'Geo';

export interface ScanRecord {
  id: string;
  type: QRScanType;
  rawData: string;
  parsedData: Record<string, string>;
  timestamp: string; // ISO string for JSON serialization
  isSaved: boolean;
  title: string;
  subtitle: string;
}

export const QR_TYPE_LABELS: Record<QRScanType, string> = {
  URL: 'URL',
  WiFi: 'Wi-Fi',
  Contact: 'Contact',
  Payment: 'Payment',
  Text: 'Text',
  Email: 'Email',
  Phone: 'Phone',
  SMS: 'SMS',
  Geo: 'Location',
};

export const FILTER_CHIPS: Array<{ label: string; value: QRScanType | 'All' }> = [
  { label: 'All', value: 'All' },
  { label: 'URL', value: 'URL' },
  { label: 'Wi-Fi', value: 'WiFi' },
  { label: 'Contact', value: 'Contact' },
  { label: 'Payment', value: 'Payment' },
  { label: 'Text', value: 'Text' },
  { label: 'Email', value: 'Email' },
  { label: 'Phone', value: 'Phone' },
  { label: 'SMS', value: 'SMS' },
  { label: 'Geo', value: 'Geo' },
];

import { useState, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { v4 as uuidv4 } from 'uuid';
import { parseQRData } from '../utils/qrParser';
import { ScanRecord } from '../constants/qrTypes';

const SCAN_COOLDOWN_MS = 2000;

interface UseScannerOptions {
  onScan: (record: ScanRecord) => void;
  saveHistory: boolean;
}

export function useScanner({ onScan, saveHistory }: UseScannerOptions) {
  const [lastScannedData, setLastScannedData] = useState<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isProcessing = useRef(false);

  const handleBarCodeScanned = useCallback(
    ({ data }: { type: string; data: string }) => {
      if (isProcessing.current) return;
      if (data === lastScannedData) return;

      isProcessing.current = true;
      setLastScannedData(data);

      const parsed = parseQRData(data);
      const record: ScanRecord = {
        id: uuidv4(),
        rawData: data,
        type: parsed.type,
        parsedData: parsed.parsedData,
        timestamp: new Date().toISOString(),
        isSaved: false,
        title: parsed.title,
        subtitle: parsed.subtitle,
      };

      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

      onScan(record);

      // Cooldown before allowing next scan
      cooldownRef.current = setTimeout(() => {
        isProcessing.current = false;
      }, SCAN_COOLDOWN_MS);
    },
    [lastScannedData, onScan]
  );

  const resetScanner = useCallback(() => {
    setLastScannedData(null);
    isProcessing.current = false;
    if (cooldownRef.current) clearTimeout(cooldownRef.current);
  }, []);

  return { handleBarCodeScanned, resetScanner };
}

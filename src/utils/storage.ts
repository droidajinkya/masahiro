import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScanRecord } from '../constants/qrTypes';

const SCAN_HISTORY_KEY = '@scanner_pro:history';
const SETTINGS_KEY = '@scanner_pro:settings';

export interface AppSettings {
  autoOpenURLs: boolean;
  vibrateOnScan: boolean;
  beepOnScan: boolean;
  saveHistory: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoOpenURLs: false,
  vibrateOnScan: true,
  beepOnScan: false,
  saveHistory: true,
};

// ─── History ────────────────────────────────────────────────────────────────

export async function loadHistory(): Promise<ScanRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(SCAN_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScanRecord[];
  } catch {
    return [];
  }
}

export async function saveHistory(records: ScanRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(SCAN_HISTORY_KEY, JSON.stringify(records));
  } catch {
    // silently fail — storage errors shouldn't crash the app
  }
}

export async function addScanRecord(record: ScanRecord): Promise<ScanRecord[]> {
  try {
    const existing = await loadHistory();
    const updated = [record, ...existing];
    await saveHistory(updated);
    return updated;
  } catch {
    return [record];
  }
}

export async function updateScanRecord(
  id: string,
  changes: Partial<ScanRecord>
): Promise<ScanRecord[]> {
  try {
    const existing = await loadHistory();
    const updated = existing.map((r) => (r.id === id ? { ...r, ...changes } : r));
    await saveHistory(updated);
    return updated;
  } catch {
    return [];
  }
}

export async function deleteScanRecord(id: string): Promise<ScanRecord[]> {
  try {
    const existing = await loadHistory();
    const updated = existing.filter((r) => r.id !== id);
    await saveHistory(updated);
    return updated;
  } catch {
    return [];
  }
}

export async function deleteScanRecords(ids: string[]): Promise<ScanRecord[]> {
  try {
    const existing = await loadHistory();
    const idSet = new Set(ids);
    const updated = existing.filter((r) => !idSet.has(r.id));
    await saveHistory(updated);
    return updated;
  } catch {
    return [];
  }
}

export async function clearHistory(): Promise<void> {
  try {
    // Keep saved records
    const existing = await loadHistory();
    const saved = existing.filter((r) => r.isSaved);
    await saveHistory(saved);
  } catch {
    // silently fail
  }
}

// ─── Settings ───────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // silently fail
  }
}

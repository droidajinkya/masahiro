import { useState, useEffect, useCallback } from 'react';
import { ScanRecord } from '../constants/qrTypes';
import {
  loadHistory,
  addScanRecord,
  updateScanRecord,
  deleteScanRecord,
  deleteScanRecords,
  clearHistory,
} from '../utils/storage';

export function useScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    loadHistory().then((records) => {
      if (mounted) {
        setHistory(records);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const addScan = useCallback(async (record: ScanRecord) => {
    const updated = await addScanRecord(record);
    setHistory(updated);
  }, []);

  const toggleSaved = useCallback(async (id: string) => {
    setHistory((prev) => {
      const target = prev.find((r) => r.id === id);
      if (!target) return prev;
      const updated = prev.map((r) =>
        r.id === id ? { ...r, isSaved: !r.isSaved } : r
      );
      // Persist the change
      updateScanRecord(id, { isSaved: !target.isSaved });
      return updated;
    });
  }, []);

  const deleteScan = useCallback(async (id: string) => {
    const updated = await deleteScanRecord(id);
    setHistory(updated);
  }, []);

  const deleteScans = useCallback(async (ids: string[]) => {
    const updated = await deleteScanRecords(ids);
    setHistory(updated);
  }, []);

  const clearAll = useCallback(async () => {
    await clearHistory();
    const remaining = await loadHistory();
    setHistory(remaining);
  }, []);

  const savedScans = history.filter((r) => r.isSaved);
  const recentScans = history.slice(0, 10);

  return {
    history,
    savedScans,
    recentScans,
    loading,
    addScan,
    toggleSaved,
    deleteScan,
    deleteScans,
    clearAll,
  };
}

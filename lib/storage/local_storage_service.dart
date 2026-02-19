import 'package:hive_flutter/hive_flutter.dart';

import '../models/queued_api_event.dart';
import '../models/scan_record.dart';

class LocalStorageService {
  static const String scanHistoryBox = 'scan_history_box';
  static const String apiQueueBox = 'api_queue_box';

  Future<void> initialize() async {
    await Hive.initFlutter();
    await Hive.openBox<Map>(scanHistoryBox);
    await Hive.openBox<Map>(apiQueueBox);
  }

  Box<Map> get _history => Hive.box<Map>(scanHistoryBox);
  Box<Map> get _apiQueue => Hive.box<Map>(apiQueueBox);

  Future<void> saveScanRecord(ScanRecord record) async {
    await _history.put(record.id, record.toJson());
  }

  List<ScanRecord> getScanHistory() {
    final records = _history.values
        .map((row) => ScanRecord.fromJson(row))
        .toList()
      ..sort((a, b) => b.timestamp.compareTo(a.timestamp));
    return records;
  }

  Future<void> enqueueApiEvent(QueuedApiEvent event) async {
    await _apiQueue.put(event.id, event.toJson());
  }

  List<QueuedApiEvent> getQueuedApiEvents() {
    return _apiQueue.values.map((row) => QueuedApiEvent.fromJson(row)).toList();
  }

  Future<void> removeQueuedApiEvent(String id) async {
    await _apiQueue.delete(id);
  }

  Future<void> updateQueuedApiEvent(QueuedApiEvent event) async {
    await _apiQueue.put(event.id, event.toJson());
  }
}

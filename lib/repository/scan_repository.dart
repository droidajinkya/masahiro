import 'dart:io';

import 'package:uuid/uuid.dart';

import '../models/queued_api_event.dart';
import '../models/scan_record.dart';
import '../services/api_service.dart';
import '../services/connectivity_service.dart';
import '../storage/local_storage_service.dart';
import '../utils/qr_type_parser.dart';

class ScanRepository {
  ScanRepository({
    required LocalStorageService localStorage,
    required ApiService apiService,
    required ConnectivityService connectivityService,
  })  : _localStorage = localStorage,
        _apiService = apiService,
        _connectivityService = connectivityService;

  final LocalStorageService _localStorage;
  final ApiService _apiService;
  final ConnectivityService _connectivityService;
  final Uuid _uuid = const Uuid();

  Future<ScanRecord> handleScan(String decodedContent) async {
    final record = ScanRecord(
      id: _uuid.v4(),
      content: decodedContent,
      type: QrTypeParser.detectType(decodedContent),
      timestamp: DateTime.now().toUtc(),
      platform: Platform.isAndroid ? 'android' : 'ios',
    );

    await _localStorage.saveScanRecord(record);

    final payload = record.toJson();
    final isOnline = await _connectivityService.isOnline();

    if (isOnline) {
      try {
        await _apiService.sendScanPayload(payload);
      } on Exception {
        await _localStorage.enqueueApiEvent(
          QueuedApiEvent(
            id: _uuid.v4(),
            payload: payload,
            createdAt: DateTime.now().toUtc(),
          ),
        );
      }
    } else {
      await _localStorage.enqueueApiEvent(
        QueuedApiEvent(
          id: _uuid.v4(),
          payload: payload,
          createdAt: DateTime.now().toUtc(),
        ),
      );
    }

    return record;
  }

  List<ScanRecord> getHistory() => _localStorage.getScanHistory();

  Future<void> retryQueuedEvents() async {
    final isOnline = await _connectivityService.isOnline();
    if (!isOnline) {
      return;
    }

    final queued = _localStorage.getQueuedApiEvents();

    for (final event in queued) {
      try {
        await _apiService.sendScanPayload(event.payload);
        await _localStorage.removeQueuedApiEvent(event.id);
      } on Exception {
        await _localStorage.updateQueuedApiEvent(
          event.copyWith(retryCount: event.retryCount + 1),
        );
      }
    }
  }
}

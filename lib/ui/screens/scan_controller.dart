import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';

import '../../models/scan_record.dart';
import '../../repository/scan_repository.dart';
import '../../services/ambient_light_service.dart';
import '../../services/connectivity_service.dart';

class ScanController extends ChangeNotifier {
  ScanController({
    required ScanRepository repository,
    required AmbientLightService ambientLightService,
    required ConnectivityService connectivityService,
  })  : _repository = repository,
        _ambientLightService = ambientLightService,
        _connectivityService = connectivityService;

  final ScanRepository _repository;
  final AmbientLightService _ambientLightService;
  final ConnectivityService _connectivityService;

  bool flashOn = false;
  bool autoFlashEnabled = true;
  String? errorMessage;
  String? lastScanMessage;
  bool processingScan = false;

  StreamSubscription<bool>? _lightSubscription;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;

  List<ScanRecord> get history => _repository.getHistory();

  void startBackgroundListeners(Future<void> Function(bool enabled) onAutoFlashChange) {
    _lightSubscription ??= _ambientLightService.lowLightStream().listen((isLowLight) {
      if (autoFlashEnabled && isLowLight && !flashOn) {
        flashOn = true;
        unawaited(onAutoFlashChange(true));
        notifyListeners();
      }
    });

    _connectivitySubscription ??= _connectivityService.statusStream.listen((_) {
      unawaited(_repository.retryQueuedEvents());
    });
  }

  Future<void> processScan(String rawValue) async {
    if (processingScan) {
      return;
    }

    processingScan = true;
    errorMessage = null;
    notifyListeners();

    try {
      final record = await _repository.handleScan(rawValue);
      lastScanMessage = 'Saved: ${record.type.toUpperCase()}';
    } on Exception {
      errorMessage = 'SCAN PROCESSING FAILED';
    } finally {
      processingScan = false;
      notifyListeners();
    }
  }

  Future<void> processScannedBarcode(BarcodeCapture capture) async {
    if (capture.barcodes.isEmpty) {
      showError('INVALID QR CODE');
      return;
    }

    final value = capture.barcodes.first.rawValue;
    if (value == null || value.trim().isEmpty) {
      showError('INVALID QR CODE');
      return;
    }

    await processScan(value);
  }

  void setManualFlashState(bool enabled) {
    flashOn = enabled;
    autoFlashEnabled = false;
    notifyListeners();
  }

  void showError(String message) {
    errorMessage = message;
    notifyListeners();
  }

  @override
  void dispose() {
    _lightSubscription?.cancel();
    _connectivitySubscription?.cancel();
    super.dispose();
  }
}

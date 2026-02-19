import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:permission_handler/permission_handler.dart';

import 'history_screen.dart';
import 'scan_controller.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.controller});

  final ScanController controller;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    autoStart: false,
    detectionSpeed: DetectionSpeed.noDuplicates,
    facing: CameraFacing.back,
    torchEnabled: false,
  );

  final ImagePicker _imagePicker = ImagePicker();
  bool _cameraAllowed = false;

  @override
  void initState() {
    super.initState();
    widget.controller.startBackgroundListeners((enabled) {
      _scannerController.toggleTorch();
    });
    _initializeCameraPermission();
  }

  Future<void> _initializeCameraPermission() async {
    final status = await Permission.camera.request();
    if (!mounted) {
      return;
    }

    if (status.isGranted) {
      _cameraAllowed = true;
      await _scannerController.start();
      setState(() {});
      return;
    }

    _cameraAllowed = false;
    setState(() {});
    _showCameraDeniedDialog();
  }

  void _showCameraDeniedDialog() {
    showDialog<void>(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text('CAMERA ACCESS DENIED'),
          content: const Text(
            'CAMERA ACCESS IS REQUIRED FOR LIVE QR SCANNING. USE GALLERY SCAN INSTEAD.',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('OK'),
            ),
          ],
        );
      },
    );
  }

  Future<void> _scanFromGallery() async {
    final file = await _imagePicker.pickImage(source: ImageSource.gallery);
    if (file == null) {
      return;
    }

    final capture = await _scannerController.analyzeImage(file.path);
    if (capture == null || capture.barcodes.isEmpty) {
      widget.controller.showError('INVALID QR CODE');
      return;
    }

    await widget.controller.processScannedBarcode(capture);
  }

  Future<void> _toggleFlash() async {
    await _scannerController.toggleTorch();
    final enabled = _scannerController.torchState.value == TorchState.on;
    widget.controller.setManualFlashState(enabled);
  }

  @override
  void dispose() {
    _scannerController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.controller,
      builder: (context, _) {
        return Scaffold(
          appBar: AppBar(
            title: const Text('Masahiro'),
            actions: [
              IconButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(
                      builder: (_) => HistoryScreen(controller: widget.controller),
                    ),
                  );
                },
                icon: const Icon(Icons.history),
              ),
            ],
          ),
          body: Column(
            children: [
              Expanded(
                child: _cameraAllowed
                    ? MobileScanner(
                        controller: _scannerController,
                        onDetect: widget.controller.processScannedBarcode,
                      )
                    : const Center(
                        child: Padding(
                          padding: EdgeInsets.all(24),
                          child: Text(
                            'CAMERA IS BLOCKED. LIVE SCANNING IS DISABLED.',
                            textAlign: TextAlign.center,
                          ),
                        ),
                      ),
              ),
              if (widget.controller.errorMessage != null)
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Text(
                    widget.controller.errorMessage!,
                    style: TextStyle(color: Theme.of(context).colorScheme.error),
                  ),
                ),
              if (widget.controller.lastScanMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(widget.controller.lastScanMessage!),
                ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: FilledButton.icon(
                        onPressed: _toggleFlash,
                        icon: Icon(widget.controller.flashOn
                            ? Icons.flash_on
                            : Icons.flash_off),
                        label: const Text('Flash'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: _scanFromGallery,
                        icon: const Icon(Icons.photo_library_outlined),
                        label: const Text('Gallery'),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

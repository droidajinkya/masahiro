import 'package:flutter/material.dart';

import 'repository/scan_repository.dart';
import 'services/ambient_light_service.dart';
import 'services/api_service.dart';
import 'services/connectivity_service.dart';
import 'storage/local_storage_service.dart';
import 'ui/screens/home_screen.dart';
import 'ui/screens/scan_controller.dart';

class MasahiroApp extends StatefulWidget {
  const MasahiroApp({super.key});

  @override
  State<MasahiroApp> createState() => _MasahiroAppState();
}

class _MasahiroAppState extends State<MasahiroApp> {
  late final LocalStorageService _localStorageService;
  late final ScanController _controller;
  bool _ready = false;

  @override
  void initState() {
    super.initState();
    _bootstrap();
  }

  Future<void> _bootstrap() async {
    _localStorageService = LocalStorageService();
    await _localStorageService.initialize();

    final connectivityService = ConnectivityService();
    final repository = ScanRepository(
      localStorage: _localStorageService,
      apiService: ApiService(),
      connectivityService: connectivityService,
    );

    _controller = ScanController(
      repository: repository,
      ambientLightService: AmbientLightService(),
      connectivityService: connectivityService,
    );

    await repository.retryQueuedEvents();

    if (!mounted) {
      return;
    }

    setState(() {
      _ready = true;
    });
  }

  @override
  void dispose() {
    if (_ready) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Masahiro',
      themeMode: ThemeMode.system,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.indigo),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.fromSeed(
          brightness: Brightness.dark,
          seedColor: Colors.indigo,
        ),
        useMaterial3: true,
      ),
      home: _ready
          ? HomeScreen(controller: _controller)
          : const Scaffold(body: Center(child: CircularProgressIndicator())),
    );
  }
}

# Masahiro

Offline-first Flutter QR scanner app for Android and iOS.

## Flutter Compatibility
This project is configured to be compatible with:
- Flutter 3.38.7 (stable)
- Dart 3.10.7

## Features
- Camera QR scanning using `mobile_scanner`
- Gallery image QR decoding using `image_picker`
- Auto flashlight enable in low-light (ambient lux stream) with manual flash toggle
- Offline-first sync flow:
  - Save scan locally (Hive)
  - Attempt backend send immediately
  - Queue API payload and retry automatically when connectivity restores
- Strict camera permission error message with gallery fallback
- Scan history and details view persisted across app restarts
- Light and dark theme via system theme mode

## Project Structure
- `lib/ui`: Screens and UI controller
- `lib/repository`: Core scan workflow orchestration
- `lib/services`: API, connectivity, and ambient-light integrations
- `lib/storage`: Hive local persistence
- `lib/models`: Data models for scan records and queued API events
- `lib/utils`: QR payload type parser

## Backend
The backend endpoint is currently a placeholder in `lib/services/api_service.dart`:

`https://example.com/api/qr-scan`

## Run
1. Install Flutter 3.38.7 stable (or newer compatible stable).
2. Run `flutter pub get`.
3. Run `flutter run`.

# Scanner Pro

A cross-platform QR code scanner app built with React Native + Expo.

## Tech Stack

- React Native + Expo (managed workflow)
- TypeScript
- React Navigation (Bottom Tabs)
- expo-camera / expo-barcode-scanner
- AsyncStorage

## Features

- Live camera QR scanning with animated viewfinder
- Scan from photo library
- Supports 9 QR types: URL, Wi-Fi, Contact (vCard), Payment (UPI), Email, Phone, SMS, Geo, Text
- Full scan history with search, filter chips, swipe-to-delete, bulk delete
- Saved/bookmarked scans
- Contextual action buttons per QR type
- Settings: auto-open URLs, vibrate, beep, save history toggle
- Dark theme with yellow-green (#C8FF00) accent
- Offline-first (all data stored locally)

## Getting Started

```bash
npm install
npx expo start
```

## Project Structure

```
App.tsx
src/
  constants/     # colors, QR type definitions
  utils/         # QR parser, AsyncStorage helpers
  hooks/         # useScanner, useScanHistory
  components/    # TypeIcon, FilterChips, ViewFinder, ScanCard, ScanResultSheet
  screens/       # Scan, History, Saved, Settings
  navigation/    # Bottom tab navigator
```

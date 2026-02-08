# Building DTS for Mobile and Desktop

This document describes how to package the existing React app as mobile (Android/iOS) and desktop (Windows/macOS/Linux) apps.

Prerequisites:
- Node.js and npm installed
- Java JDK + Android SDK (for Android builds)
- Xcode (for iOS/macOS builds) — requires a Mac

1) Prepare web build

```bash
npm install
npm run build:web
```

2) Capacitor (Android / iOS)

Install Capacitor CLI once:

```bash
npm install --save @capacitor/core
npm install --save-dev @capacitor/cli
npx cap init
```

Then copy the web build and add platforms:

```bash
npm run cap:copy
npm run cap:add:android
npm run cap:open:android   # opens Android Studio
# For iOS (on Mac):
npm run cap:add:ios
npm run cap:open:ios       # opens Xcode
```

Build APK from Android Studio (or use `./gradlew assembleRelease`).

3) Electron (Windows / macOS / Linux)

Install dev deps and build:

```bash
npm install --save-dev electron electron-builder
npm run electron:build
```

Notes:
- iOS packaging and notarization require an Apple Developer account and a Mac.
- Windows/macOS installer signing is optional but recommended for distribution.

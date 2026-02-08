# DTS – ABB VFD Service System
## Simple Downloadable Application for Windows & Android

---

## 📱 Quick Start

This is a **standalone application** that works on both phones and laptops. No internet required (except for local network connection between devices).

### System Requirements:
- **Windows 10/11** (64-bit) for laptop
- **Android 7.0+** for phone

---

## 💻 Windows Installation

### Download
- File: `DTS Setup 0.1.0.exe`
- Location: `c:\Users\DAS\dts-frontend\dist\DTS Setup 0.1.0.exe`

### Install Steps:
1. Download `DTS Setup 0.1.0.exe`
2. Double-click to run installer
3. Follow installation prompts
4. Application launches automatically after installation
5. **Backend service starts automatically** on port 5000

### First Time Setup:
1. Open the DTS application on your laptop
2. The backend server will initialize the database automatically
3. You can now create jobs and manage them

---

## 📱 Android Installation (APK)

### Building APK:
Since building APK requires Android Studio and Gradle, here are two options:

#### Option 1: Build on Your Machine (Requires Android Development Tools)
```bash
cd c:\Users\DAS\dts-frontend
npx cap open android
```
This opens Android Studio. From there:
1. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. APK will be generated in: `android/app/build/outputs/apk/release/app-release.apk`
3. Transfer this APK to your Android phone
4. Install the APK on your phone

#### Option 2: Using Gradle Command (If you have Android SDK installed)
```bash
cd c:\Users\DAS\dts-frontend\android
./gradlew assembleRelease
```
APK location: `app/build/outputs/apk/release/app-release.apk`

---

## 🚀 How to Use

### On Windows Laptop (Partner):
1. **Open DTS Application**
   - Click "+ New Job" button
   - Fill in Client Info:
     - Entry Date
     - Make / Model / Serial No
     - Fault description
     - Client Name
   - Click **"Save Client Info"** → Job is saved

### On Android Phone (Technician):
1. **Install the app** (from APK)
2. **Open DTS Application**
3. Look for the job in the Jobs list
4. Click "Edit" to fill Technician Checks:
   - Input / Output / Choke / Control Board status
   - Warranty dates
   - Checked by / Repaired by names
5. Click **"Save Technician Checks"** → Data is saved
6. Back on laptop, click "PDF" to generate warranty report

---

## 📊 Features

✅ **Two Simple Forms:**
- Client Info Form (Job details)
- Technician Checks Form (Service checklist)

✅ **PDF Generation:**
- Professional inspection & service report
- Warranty report with dates
- Dispatch date tracking

✅ **Google Sheets Sync:**
- Click "📊 Sync to Google Sheets" to auto-upload jobs

✅ **Responsive Design:**
- Works on any screen size
- Mobile-optimized for technicians
- Desktop-optimized for partners

✅ **No Authentication:**
- Everyone can use it
- No passwords or codes required
- Share the app with your team

---

## 🔧 Troubleshooting

### Windows:
- **App won't start?** → Check if backend is running on port 5000
- **Can't find installer?** → Look in `c:\Users\DAS\dts-frontend\dist\`
- **Database errors?** → Delete `src/dts.db` and restart app

### Android:
- **Can't install APK?** → Enable "Unknown Sources" in Settings
- **Connection refused?** → Make sure Windows backend is running on same network
- **Backend not found?** → Change `http://localhost:5000` to your laptop's IP address in `src/App.js` (e.g., `http://192.168.1.10:5000`)

---

## 📂 File Locations

| What | Where |
|------|-------|
| Windows Installer | `c:\Users\DAS\dts-frontend\dist\DTS Setup 0.1.0.exe` |
| APK Project | `c:\Users\DAS\dts-frontend\android\` |
| Backend Server | `c:\Users\DAS\dts-service-software\src\server.js` |
| Database | Created automatically (SQLite) |

---

## 🌍 Network Setup (Phone ↔ Laptop)

If technician phone is on different network from laptop:

1. Find laptop IP: Open Terminal/CMD, type `ipconfig`, find IPv4 address (e.g., 192.168.1.10)
2. Edit `src/App.js` on development machine
3. Change: `http://localhost:5000` → `http://192.168.1.10:5000`
4. Rebuild APK with updated address
5. Install new APK on phone

---

## 📞 Support

  For issues:
1. Check database exists: `src/dts.db`
2. Verify backend running on port 5000
3. Check network connectivity between devices
4. Review browser console (F12) for errors

---

## 📦 Files to Share with Others

To share this application with your team:

1. **Windows Users:** Share `DTS Setup 0.1.0.exe`
   - They run the installer
   - They get a working Windows desktop app

2. **Android Users:** Share the APK file
   - They install via USB or file transfer
   - They get a working mobile app

Both apps connect to the same backend server (runs on Windows laptop).

---

**Version:** 0.1.0  
**Date:** February 7, 2026  
**Status:** Ready to Download & Use ✅

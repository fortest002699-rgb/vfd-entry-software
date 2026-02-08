# VFD Entry Software - Complete Setup Guide

## 🚀 Application Overview
VFD Entry Software is a responsive, multi-device compatible application for managing VFD (Variable Frequency Drive) repair jobs. It includes real-time data entry, PDF generation, and Google Sheets synchronization.

## 📋 Features

### 1. **Responsive Layout**
- **Mobile (< 768px)**: Vertical button layout, optimized for touch
- **Tablet (768px - 1024px)**: Two-column forms
- **Desktop (> 1024px)**: Full horizontal button layout with multi-column grids

### 2. **Main Features**
- ✅ New Job Creation with auto-generated job numbers
- ✅ Client Information Form (Job No, Entry Date, Make, Model, Serial, Client Name)
- ✅ Technician Checks Form with 8 check items (Input, Output, Chock, Control Boards, Fan, Power Card)
- ✅ Repair Details (Repaired By, Date of Repairing)
- ✅ Warranty Tracking (Start Date, End Date)
- ✅ Job Status Tracking (Received → Inspected → Complete)
- ✅ Job Details Table with Edit, Tech Check, and PDF buttons
- ✅ 4-Segment PDF Generation (Job Info, Device Specs, Technician Checks, Repair & Warranty Details)
- ✅ Google Sheets Synchronization
- ✅ Real-time Data Refresh

### 3. **Data Management**
- All data stored in localStorage for offline access
- Automatic saving on every change
- Pending sync queue for failed syncs

## 🏗️ Project Structure

```
src/
├── components/
│   ├── Header.js                    # Top navigation and buttons
│   ├── ClientInfoForm.js            # Client information form modal
│   ├── TechnicianChecksForm.js      # Technician checks form modal
│   ├── JobDetailsBox.js             # Jobs listing table
│   └── PDFGeneratorModal.js         # PDF generation with 4 segments
├── utils/
│   └── googleSheetsSync.js          # Google Sheets synchronization utility
├── App.js                           # Main application component
├── App.css                          # Responsive styling
└── index.js                         # React entry point
```

## 📦 Dependencies

### Core Dependencies
- `react` - UI framework
- `react-dom` - React DOM rendering
- `jspdf` - PDF generation
- `html2canvas` - HTML to canvas conversion
- `firebase` - Backend services

### Development Dependencies
- `react-scripts` - Create React App build tool
- `@testing-library/react` - Testing utilities

## 🔧 Installation & Setup

### 1. Install Dependencies
```bash
cd c:\Users\DAS\dts-frontend
npm install
```

### 2. Install PDF Libraries (if not already installed)
```bash
npm install jspdf html2canvas
```

### 3. Firebase Configuration
The Firebase configuration is already set in `src/firebase.js`:
- Project ID: `dts-service-577a4`
- API Key: Present in firebase.js
- Firestore Database: Ready to use
- Cloud Functions: Available

### 4. Google Sheets Setup (Optional)
To enable Google Sheets sync:
1. Create a Google Service Account
2. Add service account key to backend
3. Create a Google Sheet for job data
4. Update `SPREADSHEET_ID` in backend Google Sheets route

## 🎯 How to Use

### Starting the Application
```bash
npm start
```
The application will open at `http://localhost:3000`

### Creating a New Job
1. Click "➕ New Job" button
2. Fill in Client Information form
3. Click "💾 Save Client Info"
4. Job appears in Job Details table with status "Received"

### Adding Technician Checks
1. In Job Details table, click "🔧 Tech Check" button
2. Fill in all technician check fields
3. Click "💾 Save Technician Checks"
4. Job status updates to "Inspected"

### Generating PDF
1. In Job Details table, click "📄 PDF" button
2. Review the 4 segments that will be included
3. Click "📥 Download PDF"
4. Job status updates to "Complete"

### Syncing to Google Sheets
1. Click "☁️ Sync to Google Sheet" button
2. All jobs will be uploaded to connected Google Sheet
3. If sync fails, data is queued locally

### Refreshing Data
1. Click "🔄 Refresh" button
2. Page reloads and fetches latest data

## 📊 Job Status Flow

```
New Job Creation
       ↓
   RECEIVED (Client Info saved)
       ↓
   INSPECTED (Technician Checks saved)
       ↓
   COMPLETE (PDF generated)
```

## 🎨 Responsive Design Classes

### Mobile Optimizations
- Full-width buttons stacked vertically
- Single-column form layouts
- Reduced padding and font sizes
- Touch-friendly interface

### Tablet Optimizations
- Two-column form layouts
- Flexible button arrangements

### Desktop Optimizations
- Three+ column form layouts
- Horizontal button bars
- Full table display with all columns

## 💾 Local Storage

Data is automatically saved to localStorage under the key: `vfdJobs`

Example data structure:
```javascript
{
  jobId: "JOB-1707312345-123",
  jobNo: "JOB-1707312345-123",
  entryDate: "2024-02-06",
  make: "ABB",
  modelNo: "ACS580",
  serialNo: "SN123456",
  clientName: "John Doe",
  status: "Received",
  input: "ok",
  output: "ok",
  // ... more fields
}
```

## 🔄 API Endpoints

### Sync to Google Sheets
- **Endpoint**: `/api/sync`
- **Method**: POST
- **Body**: `{ jobs: [...] }`
- **Response**: `{ success: true, message: "..." }`

## 📱 Browser Support

- Chrome (Desktop & Mobile)
- Firefox (Desktop & Mobile)
- Safari (Desktop & Mobile)
- Edge (Desktop)

## 🐛 Troubleshooting

### PDF not generating
- Ensure jsPDF is installed: `npm install jspdf`
- Check browser console for errors
- Verify job data is complete

### Google Sheets sync not working
- Check internet connection
- Verify backend API is running
- Check service account credentials
- Review console logs for errors

### Data not persisting
- Check if localStorage is enabled in browser
- Check browser storage quota
- Try clearing cache and reloading

### Responsive layout issues
- Clear browser cache
- Try zooming to 100%
- Check media query breakpoints in App.css

## 📝 Default Values

- **Job Number Format**: `JOB-{timestamp}-{random}`
- **Entry Date**: Current date
- **Status Options**: "Received", "Inspected", "Complete"
- **Check Status**: "ok" or "notok"

## 🔐 Data Security

- Data stored locally in browser's localStorage
- No data sent to backend unless explicitly synced
- Firebase authentication available for future expansion
- Service account security for Google Sheets

## 📞 Support

For issues or feature requests, check:
1. Browser console for errors
2. Firebase error messages
3. Network tab for API calls
4. localStorage data integrity

## 📄 License

This project is part of DAS Techno Services and is confidential.

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0
**Status**: Production Ready

# Google Sheets Sync Setup Guide

This guide shows you how to configure the VFD Entry Software to sync data with your Google Sheet.

## Quick Summary

The app supports **3 sync methods** (in order of preference):

1. ✅ **Webhook** (Easiest - Zapier/Make.com - No coding)
2. ✅ **CSV Export** (Always available - Download & upload manually)
3. ⚙️ **Backend API** (Advanced - Requires backend implementation)

---

## Method 1: Webhook Sync (RECOMMENDED - Easiest)

This method uses **Zapier** or **Make.com** to automatically send data to Google Sheets without any backend coding.

### What you need:
- Your Google Sheet URL
- A Zapier or Make.com account (free tier works)

### Setup Steps:

#### Step 1: Get your Google Sheet ID
1. Open your Google Sheet
2. Copy the URL: `https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit`
3. Save the `YOUR_SHEET_ID` part

#### Step 2: Create a Zapier/Make.com Webhook (Choose One)

**Using Zapier:**
1. Go to https://zapier.com and sign up (free)
2. Create a New Zap → Trigger: Webhooks by Zapier → "Catch Raw Hook"
3. Copy the Webhook URL provided
4. Add Action: Google Sheets → "Create Spreadsheet Row"
5. Connect your Google account
6. Select your spreadsheet and sheet
7. Map the fields:
   - `Job No` → Job No
   - `Client Name` → Client Name
   - `Entry Date` → Entry Date
   - etc.
8. Turn on the Zap

**Using Make.com:**
1. Go to https://make.com and sign up (free)
2. Create New Scenario → Add Webhook trigger
3. Copy the Webhook URL
4. Add Google Sheets module → "Add a row"
5. Connect your Google account
6. Map the fields as shown above

#### Step 3: Configure the App

1. In the app, click **"Sync to Google Sheet"** button
2. A dialog will appear asking for configuration
3. Paste your Webhook URL
4. Click **"Save Configuration"**

#### Step 4: Test It
1. Create a test job in the app
2. Click **"Sync to Google Sheet"**
3. Check your Google Sheet - the data should appear!

---

## Method 2: CSV Export (Fallback - Always Works)

If webhook sync isn't working, the app automatically exports data as CSV.

### How it works:
1. Click **"Sync to Google Sheet"** button
2. A CSV file downloads automatically
3. Go to your Google Sheet
4. Click "File" → "Import" → "Upload"
5. Select the CSV file
6. Choose "Replace all values" or "Append to current sheet"

**Advantages:**
- ✅ No setup required
- ✅ Works offline
- ✅ Manual control over data

**CSV Columns:**
```
Job No, Client Name, Entry Date, Make, Model No, Serial No, Status, 
Dispatch Date, Inspection Report, Service Report, Testing Report, 
Warranty Report, Created At
```

---

## Method 3: Backend API (Advanced)

For enterprise deployments with your own backend server.

### Backend Implementation

The app will POST to `/api/sync-sheets` with this data:

```javascript
POST /api/sync-sheets
{
  "jobs": [
    {
      "jobNo": "JOB-123456-ABC",
      "clientName": "Client Name",
      "entryDate": "2025-02-08",
      "make": "Make",
      "modelNo": "Model",
      "serialNo": "Serial",
      "status": "Complete",
      "dispatchDate": "2025-02-08",
      "inspection_report": "Report content...",
      "service_report": "Report content...",
      "testing_report": "Report content...",
      "warranty_report": "Report content..."
    }
  ],
  "sheetId": "YOUR_SHEET_ID",
  "apiKey": "YOUR_API_KEY"
}
```

### Example Node.js/Express Backend:

```javascript
// backend/routes/sync.js
const express = require('express');
const { google } = require('googleapis');
const router = express.Router();

router.post('/api/sync-sheets', async (req, res) => {
  try {
    const { jobs, sheetId } = req.body;
    
    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      keyFile: 'path/to/service-account.json',
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });
    
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Prepare rows for insertion
    const rows = jobs.map(job => [
      job.jobNo,
      job.clientName,
      job.entryDate,
      job.make,
      job.modelNo,
      job.serialNo,
      job.status,
      job.dispatchDate,
      job.inspection_report,
      job.service_report,
      job.testing_report,
      job.warranty_report
    ]);
    
    // Append to sheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet1!A:L',
      valueInputOption: 'RAW',
      requestBody: { values: rows }
    });
    
    res.json({ success: true, updated: response.data.updates.updatedRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

---

## Troubleshooting

### "Cannot read properties of undefined (reading 'sync-sheets')"
- **Solution:** Make sure webhook URL is configured correctly, or use CSV export

### Data not appearing in Google Sheet
- **Check 1:** Is the Zapier/Make.com zap turned on?
- **Check 2:** Check the zap history for errors
- **Check 3:** Make sure column mapping is correct
- **Check 4:** Try manually importing the CSV file

### CSV file downloads but won't import
- **Solution:** Make sure your Google Sheet has the same columns:
  - Job No
  - Client Name
  - Entry Date
  - Make
  - Model No
  - Serial No
  - Status
  - Dispatch Date
  - Inspection Report
  - Service Report
  - Testing Report
  - Warranty Report

### App says "Sync failed"
- CSV will automatically export instead
- Data is saved locally in browser
- Try again when connection is restored

---

## Data Mapping

When setting up webhook/API sync, map these app fields to your Google Sheet:

| App Field | Sheet Column | Type | Example |
|-----------|-------------|------|---------|
| jobNo | Job No | Text | JOB-123456-ABC |
| clientName | Client Name | Text | ABC Industries |
| entryDate | Entry Date | Date | 2025-02-08 |
| make | Make | Text | Siemens |
| modelNo | Model No | Text | MM440 |
| serialNo | Serial No | Text | 12345 |
| status | Status | Text | Complete |
| dispatchDate | Dispatch Date | Date | 2025-02-09 |
| inspection_report | Inspection Report | Text | Full inspection details... |
| service_report | Service Report | Text | Service performed... |
| testing_report | Testing Report | Text | Test results... |
| warranty_report | Warranty Report | Text | Warranty details... |

---

## Getting Help

### Check Browser Console for Errors:
1. Press `F12` to open Developer Tools
2. Go to Console tab
3. Look for red error messages
4. Copy and share the error message

### Common Error Messages:

**Error: "fetch to /api/sync-sheets failed"**
- Your backend `/api/sync-sheets` endpoint is not running
- Solution: Use webhook method instead

**Error: "Webhook request failed"**
- Your Zapier/Make.com webhook is inactive
- Solution: Check your zap status and turn it on

**Error: "CORS error"**
- Your backend is blocking requests from the frontend
- Solution: Add CORS headers: `Access-Control-Allow-Origin: *`

---

## Next Steps

1. **Choose your sync method** (Webhook recommended)
2. **Get your Google Sheet ID** from the sheet URL
3. **Set up Zapier/Make.com** webhook (if using Method 1)
4. **Click "Sync to Google Sheet"** in the app
5. **Test with one job** to make sure it works
6. **Review data in Google Sheet** to verify accuracy

---

## Questions?

Check `src/utils/googleSheetsSync.js` for the sync logic, or add a Settings modal to the app for easier configuration.

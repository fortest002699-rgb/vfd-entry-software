# Backend for VFD Entry Software - Google Sheets Sync

This small Express backend exposes `/api/sync-sheets` which appends rows to your Google Sheet using a Service Account.

Security: place the service account JSON file only on the server and do not commit it to source control.

## Setup

1. Copy your downloaded `service-account.json` into this `backend/` folder.
   - OR set env `SERVICE_ACCOUNT_JSON_BASE64` containing the base64-encoded JSON content.
2. Optionally set `SHEET_ID` environment variable to your sheet id (otherwise frontend must send it).

## Install & Run

Windows (PowerShell):

```powershell
cd backend
npm install
npm start
```

Linux / macOS:

```bash
cd backend
npm install
npm start
```

## API

POST /api/sync-sheets

Request body:

```json
{
  "jobs": [ {"jobNo":"JOB-...","clientName":"...","entryDate":"...","make":"...","modelNo":"...","serialNo":"...","dispatchDate":"..."} ],
  "sheetId": "13gxrOZy..."
}
```

Response:

```json
{ "success": true, "updates": { /* google response */ } }
```

## Notes
- The backend appends rows into `Sheet1!A:G` by default.
- Make sure the service account email (client_email from service-account.json) is given Editor access to the Google Sheet.
- This server is intentionally minimal — you can containerize it or integrate into your existing backend.

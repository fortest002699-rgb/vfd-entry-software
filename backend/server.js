const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));

// Helper: load service account credentials
function loadServiceAccount() {
  // Prefer environment-provided JSON (base64 encoded) for security
  if (process.env.SERVICE_ACCOUNT_JSON_BASE64) {
    const json = Buffer.from(process.env.SERVICE_ACCOUNT_JSON_BASE64, 'base64').toString('utf8');
    return JSON.parse(json);
  }

  // Otherwise, look for a service-account.json file in same folder
  const keyPath = path.join(__dirname, 'service-account.json');
  if (fs.existsSync(keyPath)) {
    const content = fs.readFileSync(keyPath, 'utf8');
    return JSON.parse(content);
  }

  throw new Error('Service account credentials not found. Provide SERVICE_ACCOUNT_JSON_BASE64 env or place service-account.json in backend folder.');
}

// Append only client info + dispatch date to sheet
app.post('/api/sync-sheets', async (req, res) => {
  try {
    const { jobs, sheetId } = req.body;
    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ error: 'jobs array is required' });
    }

    const SA = loadServiceAccount();

    const auth = new google.auth.GoogleAuth({
      credentials: SA,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = sheetId || process.env.SHEET_ID;
    if (!spreadsheetId) return res.status(400).json({ error: 'sheetId is required in request body or set SHEET_ID env' });

    // Map jobs to rows: Job No, Client Name, Entry Date, Make, Model No, Serial No, Dispatch Date
    const rows = jobs.map(job => [
      job.jobNo || job.jobId || '',
      job.clientName || '',
      job.entryDate || '',
      job.make || '',
      job.modelNo || job.modelNo || '',
      job.serialNo || '',
      job.dispatchDate || ''
    ]);

    // Get the first sheet name if it exists
    let sheetName = 'Sheet1';
    try {
      const sheetMetadata = await sheets.spreadsheets.get({ spreadsheetId });
      if (sheetMetadata.data.sheets && sheetMetadata.data.sheets.length > 0) {
        sheetName = sheetMetadata.data.sheets[0].properties.title;
      }
    } catch (e) {
      console.log('Could not fetch sheet metadata, using Sheet1 as fallback');
    }

    // Append rows to the sheet; append to A1 but let Google decide the insertion
    const range = `${sheetName}!A1`;

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'RAW',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: rows }
    });

    return res.json({ success: true, updates: response.data.updates || null });
  } catch (error) {
    console.error('sync-sheets error:', error.message || error);
    return res.status(500).json({ error: error.message || String(error) });
  }
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Sheets sync backend running on port ${PORT}`));

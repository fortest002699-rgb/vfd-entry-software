const { google } = require('googleapis');

/**
 * Vercel Serverless: /api/sync-sheets
 * Expects JSON POST: { jobs: [{ jobNo, clientName, entryDate, make, modelNo, serialNo, dispatchDate }, ...], sheetId }
 */
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const body = req.body || {};
    const jobs = Array.isArray(body.jobs) ? body.jobs : [];
    const sheetId = body.sheetId || process.env.GOOGLE_SHEET_ID;

    if (!sheetId) return res.status(400).json({ error: 'Missing sheetId' });
    if (!jobs.length) return res.status(400).json({ error: 'No jobs to sync' });

    // Parse service account JSON from env (supports raw JSON or base64)
    let svc = process.env.SERVICE_ACCOUNT_JSON || process.env.SERVICE_ACCOUNT;
    if (!svc) return res.status(500).json({ error: 'Service account not configured' });

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(svc);
    } catch (err) {
      // maybe base64
      try {
        serviceAccount = JSON.parse(Buffer.from(svc, 'base64').toString('utf8'));
      } catch (err2) {
        return res.status(500).json({ error: 'Invalid SERVICE_ACCOUNT_JSON' });
      }
    }

    const jwt = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    await jwt.authorize();
    const sheets = google.sheets({ version: 'v4', auth: jwt });

    // Prepare rows (headerless) — keep column order matching frontend expectations
    const values = jobs.map(j => [
      j.jobNo || j.jobId || '',
      j.clientName || '',
      j.entryDate || '',
      j.make || '',
      j.modelNo || '',
      j.serialNo || '',
      j.dispatchDate || ''
    ]);

    const appendRes = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'A1',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values }
    });

    return res.status(200).json({ success: true, updates: appendRes.data });
  } catch (error) {
    console.error('sync-sheets error:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
};
const { google } = require('googleapis');

const sheets = google.sheets('v4');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { jobs, sheetId } = req.body;

    // Get service account from environment variable
    const serviceAccountJson = process.env.SERVICE_ACCOUNT_JSON;
    if (!serviceAccountJson) {
      return res.status(500).json({
        success: false,
        error: 'SERVICE_ACCOUNT_JSON environment variable not set'
      });
    }

    const serviceAccount = JSON.parse(serviceAccountJson);

    // Create auth client
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheetsClient = sheets.spreadsheets;

    // Get sheet metadata to find sheet name
    const metadata = await sheetsClient.get({
      auth,
      spreadsheetId: sheetId,
    });

    const sheetName = metadata.data.sheets[0].properties.title;

    // Prepare rows for sync
    const values = jobs.map(job => [
      job.jobNo || job.jobId || '',
      job.clientName || '',
      job.entryDate || '',
      job.make || '',
      job.modelNo || '',
      job.serialNo || '',
      job.dispatchDate || ''
    ]);

    // Append to sheet
    const result = await sheetsClient.values.append({
      auth,
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    return res.status(200).json({
      success: true,
      updates: {
        updatedRange: result.data.updates.updatedRange,
        updatedRows: result.data.updates.updatedRows,
        updatedColumns: result.data.updates.updatedColumns
      }
    });
  } catch (error) {
    console.error('Sync error:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

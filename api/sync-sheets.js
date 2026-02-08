/**
 * Temporary diagnostic handler: echoes incoming payload.
 * Replaces full Google Sheets logic for initial verification.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const body = req.body || {};
    const jobs = Array.isArray(body.jobs) ? body.jobs : [];
    const sheetId = body.sheetId || process.env.GOOGLE_SHEET_ID || null;
    return res.status(200).json({ success: true, received: jobs.length, sheetId, exampleJob: jobs[0] || null });
  } catch (err) {
    console.error('diagnostic handler error', err);
    return res.status(500).json({ error: String(err) });
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

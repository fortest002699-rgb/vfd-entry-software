/**
 * Robust Vercel serverless handler for /api/sync-sheets
 * - Reads raw body safely
 * - Parses incoming JSON with fallback handling
 * - Validates and attempts to parse SERVICE_ACCOUNT_JSON with helpful diagnostics
 * - Appends rows to Google Sheets using googleapis when possible
 */
const { google } = require('googleapis');
const sheets = google.sheets('v4');

const mask = (str, head = 6, tail = 6) => {
  if (!str) return '';
  if (str.length <= head + tail) return str;
  return str.slice(0, head) + '...' + str.slice(-tail);
};

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Read raw body
  let raw;
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    raw = Buffer.concat(chunks);
  } catch (err) {
    console.error('Error reading raw body:', err);
    res.status(500).json({ success: false, error: 'Failed to read request body' });
    return;
  }

  const text = raw.toString('utf8');

  // Try to parse JSON body robustly
  let body = null;
  const contentType = (req.headers['content-type'] || '').toLowerCase();
  try {
    if (contentType.includes('application/json')) {
      body = JSON.parse(text);
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      // Fallback: attempt to JSON.parse anyway (handles cases where middleware didn't run)
      body = JSON.parse(text);
    }
  } catch (parseErr) {
    console.error('Body JSON parse error:', parseErr);
    // Return helpful diagnostic including first bytes (hex) and text sample
    res.status(500).json({
      success: false,
      error: `Expected property name or '}' in JSON at position - ${parseErr.message}`,
      rawLength: raw.length,
      sample: text.slice(0, 500),
      hexSample: raw.slice(0, Math.min(200, raw.length)).toString('hex')
    });
    return;
  }

  // Validate body
  const jobs = (body && body.jobs) || [];
  const sheetId = (body && body.sheetId) || process.env.DEFAULT_SHEET_ID;

  // Inspect SERVICE_ACCOUNT_JSON env
  const serviceAccountRaw = process.env.SERVICE_ACCOUNT_JSON || '';
  let serviceAccount = null;
  let saParseError = null;
  try {
    serviceAccount = JSON.parse(serviceAccountRaw);
  } catch (e1) {
    // Try common fallback: if value is a quoted JSON string, unquote and unescape
    try {
      const cleaned = serviceAccountRaw.trim().replace(/^\"|\"$/g, '').replace(/\\n/g, '\n');
      serviceAccount = JSON.parse(cleaned);
    } catch (e2) {
      saParseError = e2.message || String(e2);
    }
  }

  if (!serviceAccount) {
    console.error('SERVICE_ACCOUNT_JSON parse failed:', saParseError);
    res.status(500).json({
      success: false,
      error: `SERVICE_ACCOUNT_JSON parse failed: ${saParseError || 'not set'}`,
      serviceAccountPreview: serviceAccountRaw ? {
        client_email: (serviceAccountRaw.match(/\"client_email\"\s*:\s*\"([^\"]+)\"/) || [])[1] || null,
        private_key_start: serviceAccountRaw ? mask((serviceAccountRaw.match(/-----BEGIN PRIVATE KEY-----(?:\\n)?([\s\S]*?)-----END PRIVATE KEY-----/) || [])[1] || '') : null,
        length: serviceAccountRaw.length
      } : null
    });
    return;
  }

  // Now perform Google Sheets append
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheetsClient = sheets.spreadsheets;

    // Get first sheet name
    const metadata = await sheetsClient.get({
      auth,
      spreadsheetId: sheetId
    });

    const sheetName = metadata.data.sheets[0].properties.title;

    const values = (jobs || []).map(job => [
      job.jobNo || job.jobId || '',
      job.clientName || '',
      job.entryDate || '',
      job.make || '',
      job.modelNo || '',
      job.serialNo || '',
      job.dispatchDate || ''
    ]);

    const result = await sheetsClient.values.append({
      auth,
      spreadsheetId: sheetId,
      range: `${sheetName}!A1`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values }
    });

    res.status(200).json({
      success: true,
      updates: result.data.updates || null
    });
  } catch (err) {
    console.error('Sync error:', err);
    res.status(500).json({ success: false, error: err.message || String(err) });
  }
};

const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const db = require("../db/database");

// 🔐 LOAD SERVICE ACCOUNT KEY
const auth = new google.auth.GoogleAuth({
  keyFile: "service-account.json", // keep in backend root
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const SPREADSHEET_ID = "PASTE_YOUR_SHEET_ID_HERE";
const SHEET_NAME = "Jobs";

// 🔁 SYNC JOBS → GOOGLE SHEETS
router.post("/sync", async (req, res) => {
  try {
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });

    db.all(`SELECT * FROM jobs ORDER BY id ASC`, async (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // 🧱 HEADER ROW
      const headers = Object.keys(rows[0] || {});
      const values = [
        headers,
        ...rows.map(row => headers.map(h => row[h] ?? "")),
      ];

      // 🧹 CLEAR OLD DATA
      await sheets.spreadsheets.values.clear({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A:Z`,
      });

      // ✍ WRITE NEW DATA
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      res.json({
        success: true,
        message: "Jobs synced to Google Sheets successfully",
        total: rows.length,
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Google Sheets sync failed" });
  }
});

module.exports = router;

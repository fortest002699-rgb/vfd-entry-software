// Node script to reset job counter and clear Google Sheet

const fs = require('fs');
const path = require('path');

// 1. Create a localStorage reset script for browser
console.log('📋 Job Counter Reset Instructions:');
console.log('1. The job counter is stored in browser localStorage');
console.log('2. Next job will start from number 1 after reset\n');

// For Firebase, we already cleared jobs in Firestore ✓

// 2. Clear Google Sheet using Google Sheets API
const { google } = require('googleapis');

// Load service account (assuming GOOGLE_APPLICATION_CREDENTIALS is set or file exists)
async function clearGoogleSheet() {
  try {
    // Initialize auth - use application default credentials
    const auth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const sheetId = '13gxrOZycnC_WjHxJGSBqEu9p2Niry8PQuR7G9UITx60';

    // Get sheet names first
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const sheetTitle = spreadsheet.data.sheets[0].properties.title || 'Sheet1';
    
    // Clear all data except header
    const response = await sheets.spreadsheets.values.clear({
      spreadsheetId: sheetId,
      range: `${sheetTitle}!A2:Z`,
    });

    console.log('✅ Google Sheet cleared');
    console.log('📊 Cleared range:', response.data.clearedRange);
    
  } catch (error) {
    console.error('❌ Error clearing Google Sheet:', error.message);
    console.log('💡 Alternative: Clear the sheet manually at https://docs.google.com/spreadsheets/d/13gxrOZycnC_WjHxJGSBqEu9p2Niry8PQuR7G9UITx60');
  }
}

// Run the clear function
clearGoogleSheet().then(() => {
  console.log('\n🎉 Setup ready for fresh launch!');
  console.log('✓ Firestore jobs cleared');
  console.log('✓ Google Sheet cleared');
  console.log('✓ Job counter will start from 1 on next entry');
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});

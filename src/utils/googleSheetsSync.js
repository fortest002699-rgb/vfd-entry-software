/**
 * Google Sheets Sync Utility
 * Handles syncing job data to Google Sheets
 * Supports: CSV Export, Webhook (Zapier/Make), Backend API
 */

/**
 * Export data as CSV for manual upload
 */
export const exportDataAsCSV = (jobsData) => {
  try {
    // Define CSV headers
    const headers = [
      'Job No',
      'Client Name',
      'Entry Date',
      'Make',
      'Model No',
      'Serial No',
      'Status',
      'Dispatch Date',
      'Inspection Report',
      'Service Report',
      'Testing Report',
      'Warranty Report',
      'Created At'
    ];

    // Create CSV rows
    const rows = jobsData.map(job => [
      job.jobNo || job.jobId || '',
      job.clientName || '',
      job.entryDate || '',
      job.make || '',
      job.modelNo || '',
      job.serialNo || '',
      job.status || '',
      job.dispatchDate || '',
      `"${(job.inspection_report || '').replace(/"/g, '""')}"`,
      `"${(job.service_report || '').replace(/"/g, '""')}"`,
      `"${(job.testing_report || '').replace(/"/g, '""')}"`,
      `"${(job.warranty_report || '').replace(/"/g, '""')}"`,
      job.createdAt || ''
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `VFD_Jobs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true,
      message: 'CSV exported successfully. You can import this into Google Sheets.'
    };
  } catch (error) {
    console.error('CSV export error:', error);
    return {
      success: false,
      message: 'Failed to export CSV: ' + error.message,
      error
    };
  }
};

/**
 * Main sync function - sends only client info + dispatch date to Google Sheet via backend API
 */
export const syncToGoogleSheets = async (jobsData) => {
  try {
    // Prepare minimal rows: only client info + dispatch date
    const minimalJobs = jobsData.map(job => ({
      jobNo: job.jobNo || job.jobId || '',
      clientName: job.clientName || '',
      entryDate: job.entryDate || '',
      make: job.make || '',
      modelNo: job.modelNo || '',
      serialNo: job.serialNo || '',
      dispatchDate: job.dispatchDate || ''
    }));

    // POST to Vercel serverless function
    const response = await fetch('/api/sync-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobs: minimalJobs,
        sheetId: '13gxrOZycnC_WjHxJGSBqEu9p2Niry8PQuR7G9UITx60'
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Backend error: ${response.status} ${text}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return {
        success: true,
        message: `✅ Data synced to Google Sheet! Updated range: ${result.updates?.updatedRange || 'N/A'}`
      };
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      message: `❌ Sync failed: ${error.message}`,
      error: error.message
    };
  }
};

/**
 * Save Google Sheets configuration
 */
export const saveGoogleSheetsConfig = (config) => {
  if (config.sheetId) {
    localStorage.setItem('googleSheetId', config.sheetId);
  }
  if (config.apiKey) {
    localStorage.setItem('googleApiKey', config.apiKey);
  }
  if (config.webhookUrl) {
    localStorage.setItem('webhookUrl', config.webhookUrl);
    localStorage.setItem('useWebhook', 'true');
  }
};

/**
 * Get current Google Sheets configuration
 */
export const getGoogleSheetsConfig = () => {
  return {
    sheetId: localStorage.getItem('googleSheetId') || '',
    apiKey: localStorage.getItem('googleApiKey') || '',
    webhookUrl: localStorage.getItem('webhookUrl') || '',
    useWebhook: localStorage.getItem('useWebhook') === 'true'
  };
};

/**
 * Check if there are pending syncs
 */
export const getPendingSyncs = () => {
  const pending = localStorage.getItem('vfdJobsPending');
  return pending ? JSON.parse(pending) : null;
};

/**
 * Clear pending syncs after successful sync
 */
export const clearPendingSyncs = () => {
  localStorage.removeItem('vfdJobsPending');
};

/**
 * Format data for Google Sheets
 */
export const formatDataForSheets = (jobsData) => {
  return jobsData.map(job => ({
    'Job No': job.jobNo || job.jobId,
    'Entry Date': job.entryDate || '',
    'Client Name': job.clientName || '',
    'Make': job.make || '',
    'Model No': job.modelNo || '',
    'Serial No': job.serialNo || '',
    'Status': job.status || '',
    'Inspection Report': job.inspection_report || '',
    'Service Report': job.service_report || '',
    'Testing Report': job.testing_report || '',
    'Warranty Report': job.warranty_report || ''
  }));
};

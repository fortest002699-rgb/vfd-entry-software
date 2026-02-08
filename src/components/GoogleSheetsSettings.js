import React, { useState, useEffect } from 'react';
import { saveGoogleSheetsConfig, getGoogleSheetsConfig } from '../utils/googleSheetsSync';
import '../styles/GoogleSheetsSettings.css';

function GoogleSheetsSettings({ isOpen, onClose }) {
  const [config, setConfig] = useState({
    sheetId: '',
    webhookUrl: '',
    useWebhook: false
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('webhook');

  useEffect(() => {
    if (isOpen) {
      const currentConfig = getGoogleSheetsConfig();
      setConfig({
        sheetId: currentConfig.sheetId || '',
        webhookUrl: currentConfig.webhookUrl || '',
        useWebhook: currentConfig.useWebhook || false
      });
      setSaved(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    // Validate at least one method is configured
    if (!config.webhookUrl && !config.sheetId) {
      alert('Please configure at least one sync method (Webhook or Sheet ID)');
      return;
    }

    saveGoogleSheetsConfig({
      sheetId: config.sheetId,
      webhookUrl: config.webhookUrl,
      useWebhook: config.useWebhook && !!config.webhookUrl
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="gs-settings-overlay" onClick={onClose}>
      <div className="gs-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="gs-settings-header">
          <h2>Google Sheets Sync Configuration</h2>
          <button className="gs-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="gs-tabs">
          <button
            className={`gs-tab ${activeTab === 'webhook' ? 'active' : ''}`}
            onClick={() => setActiveTab('webhook')}
          >
            Webhook (Easy)
          </button>
          <button
            className={`gs-tab ${activeTab === 'csv' ? 'active' : ''}`}
            onClick={() => setActiveTab('csv')}
          >
            CSV Export
          </button>
          <button
            className={`gs-tab ${activeTab === 'help' ? 'active' : ''}`}
            onClick={() => setActiveTab('help')}
          >
            Help
          </button>
        </div>

        <div className="gs-content">
          {/* Webhook Tab */}
          {activeTab === 'webhook' && (
            <div className="gs-tab-content">
              <h3>⚡ Webhook Method (Recommended)</h3>
              <p className="gs-description">
                Connect your Google Sheet using Zapier or Make.com webhooks. 
                No backend coding required!
              </p>

              <div className="gs-form-group">
                <label>Webhook URL</label>
                <input
                  type="text"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                  value={config.webhookUrl}
                  onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                  className="gs-input"
                />
                <p className="gs-hint">
                  Get this URL from Zapier or Make.com webhook configuration
                </p>
              </div>

              <div className="gs-form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={config.useWebhook && !!config.webhookUrl}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      useWebhook: e.target.checked && !!config.webhookUrl 
                    })}
                    disabled={!config.webhookUrl}
                  />
                  Use webhook for sync
                </label>
              </div>

              <div className="gs-info-box">
                <strong>Setup Instructions:</strong>
                <ol>
                  <li>Sign up at <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">Zapier.com</a> or <a href="https://make.com" target="_blank" rel="noopener noreferrer">Make.com</a></li>
                  <li>Create a webhook trigger and get the Webhook URL</li>
                  <li>Connect it to Google Sheets (Create Row action)</li>
                  <li>Paste the webhook URL here</li>
                  <li>Click Save</li>
                </ol>
              </div>
            </div>
          )}

          {/* CSV Tab */}
          {activeTab === 'csv' && (
            <div className="gs-tab-content">
              <h3>📥 CSV Export (Always Available)</h3>
              <p className="gs-description">
                Export your data as CSV and upload manually to Google Sheets. 
                Great for offline work!
              </p>

              <div className="gs-info-box">
                <strong>How it works:</strong>
                <ul>
                  <li>Click "Sync to Google Sheet" in the app</li>
                  <li>A CSV file downloads automatically</li>
                  <li>Go to your Google Sheet</li>
                  <li>Click File → Import → Upload CSV</li>
                  <li>Choose "Replace all values" or "Append"</li>
                </ul>
              </div>

              <div className="gs-info-box" style={{ marginTop: '20px' }}>
                <strong>CSV Columns:</strong>
                <code>Job No, Client Name, Entry Date, Make, Model No, Serial No, Status, Dispatch Date, Inspection Report, Service Report, Testing Report, Warranty Report</code>
              </div>

              <p style={{ marginTop: '20px', fontStyle: 'italic', color: '#666' }}>
                ✓ CSV export is the fallback if webhook sync fails
              </p>
            </div>
          )}

          {/* Help Tab */}
          {activeTab === 'help' && (
            <div className="gs-tab-content">
              <h3>❓ Help & Troubleshooting</h3>

              <div className="gs-qa">
                <div className="gs-qa-item">
                  <h4>Should I use Webhook or CSV?</h4>
                  <p>
                    <strong>Webhook:</strong> Best for automatic sync in real-time<br/>
                    <strong>CSV:</strong> Best for manual control or backup
                  </p>
                </div>

                <div className="gs-qa-item">
                  <h4>The webhook isn't working. What do I do?</h4>
                  <p>
                    1. Check if your Zapier/Make.com zap is enabled<br/>
                    2. Check the zap history for errors<br/>
                    3. Delete the webhook URL and click Save<br/>
                    4. The app will fall back to CSV export
                  </p>
                </div>

                <div className="gs-qa-item">
                  <h4>Can I use both webhook AND CSV?</h4>
                  <p>
                    Yes! The app tries webhook first, then falls back to CSV if needed.
                    Perfect for reliability.
                  </p>
                </div>

                <div className="gs-qa-item">
                  <h4>My data is syncing but columns don't match</h4>
                  <p>
                    Make sure your Google Sheet has these columns:<br/>
                    Job No, Client Name, Entry Date, Make, Model No, Serial No, 
                    Status, Dispatch Date, Inspection Report, Service Report, 
                    Testing Report, Warranty Report
                  </p>
                </div>

                <div className="gs-qa-item">
                  <h4>Is my data safe?</h4>
                  <p>
                    Yes! Data is stored locally on your device and only sent 
                    to your configured webhook. Never shared with us.
                  </p>
                </div>
              </div>

              <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#e8f4f8', borderRadius: '4px' }}>
                For more details, see <code>GOOGLE_SHEETS_SETUP.md</code>
              </p>
            </div>
          )}
        </div>

        {saved && (
          <div className="gs-success-message">
            ✓ Configuration saved successfully!
          </div>
        )}

        <div className="gs-footer">
          <button className="gs-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {activeTab !== 'help' && (
            <button className="gs-btn-primary" onClick={handleSave}>
              Save Configuration
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default GoogleSheetsSettings;

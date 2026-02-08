import React from 'react';

const Header = ({ onNewJob, onSyncSheets, onRefresh, isMobile }) => {
  return (
    <header className="header">
      <h1>🚀 VFD ENTRY SOFTWARE</h1>
      <div className="header-buttons">
        <button className="btn btn-primary" onClick={onNewJob}>
          ➕ New Job
        </button>
        <button className="btn btn-success" onClick={onSyncSheets}>
          ☁️ Sync to Google Sheet
        </button>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
      </div>
    </header>
  );
};

export default Header;

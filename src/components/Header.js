import React from 'react';

const Header = ({ onNewJob, onSyncSheets, onClearJobs, onRefresh, onLogout, isMobile }) => {
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
        <button className="btn btn-warning" onClick={onClearJobs} title="Clear all jobs">
          🗑️ Clear Jobs
        </button>
        <button className="btn btn-secondary" onClick={onRefresh}>
          🔄 Refresh
        </button>
        <button className="btn btn-danger" onClick={onLogout} title="Logout">
          🔓 Logout
        </button>
      </div>
    </header>
  );
};

export default Header;

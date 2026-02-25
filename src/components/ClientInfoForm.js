import React, { useState } from 'react';

const ClientInfoForm = ({ jobId, initialData, onSave, onClose }) => {
  const [unlocked, setUnlocked] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authPass, setAuthPass] = useState('');

  const [formData, setFormData] = useState(
    initialData || {
      jobNo: jobId,
      entryDate: new Date().toISOString().split('T')[0],
      make: '',
      modelNo: '',
      serialNo: '',
      clientName: ''
    }
  );

  // Compute expected admin password per job:
  // - If serial number has last 3 chars, password = <last3>..@admin
  // - Otherwise for new jobs, password = 'new..@admin'
  const computeExpectedPassword = (serial) => {
    if (!serial) return 'new..@admin';
    const s = String(serial).trim();
    if (s.length >= 3) return `${s.slice(-3)}..@admin`;
    return 'new..@admin';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Require unlock before saving
    if (!unlocked) {
      setAuthError('Please unlock client details first');
      return;
    }

    // Validation
    if (!formData.clientName.trim()) {
      alert('Please enter client name');
      return;
    }

    onSave({
      jobId: jobId,
      jobNo: formData.jobNo,
      entryDate: formData.entryDate,
      make: formData.make,
      modelNo: formData.modelNo,
      serialNo: formData.serialNo,
      clientName: formData.clientName
    });
  };

  const handleUnlock = (e) => {
    e.preventDefault();
    const serialForCheck = formData.serialNo || (initialData && initialData.serialNo) || '';
    const expected = computeExpectedPassword(serialForCheck);
    if (authPass === expected) {
      setUnlocked(true);
      setAuthError('');
      setAuthPass('');
    } else {
      setAuthError('Incorrect password');
      setAuthPass('');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Client Information</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* If not unlocked, show lock screen */}
        {!unlocked && (
          <div style={{ padding: 16 }}>
            <p style={{ marginBottom: 8 }}>🔒 Client details are protected. Enter admin password to view or edit.</p>
            <form onSubmit={handleUnlock}>
              <input
                type="password"
                placeholder="Admin password"
                value={authPass}
                onChange={(e) => setAuthPass(e.target.value)}
                style={{ padding: 8, width: '100%', marginBottom: 8 }}
                autoFocus
              />
              {authError && <div style={{ color: 'red', marginBottom: 8 }}>{authError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-success" type="submit">Unlock</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
              </div>
            </form>
          </div>
        )}

        {unlocked && (
          <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Job No. (Auto-generated)</label>
            <input
              type="text"
              name="jobNo"
              value={formData.jobNo}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Entry Date</label>
              <input
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Make</label>
              <input
                type="text"
                name="make"
                placeholder="Enter make"
                value={formData.make}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Model No.</label>
              <input
                type="text"
                name="modelNo"
                placeholder="Enter model number"
                value={formData.modelNo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Serial No.</label>
              <input
                type="text"
                name="serialNo"
                placeholder="Enter serial number"
                value={formData.serialNo}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Client Name *</label>
            <input
              type="text"
              name="clientName"
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

            <div className="form-buttons">
              <button type="submit" className="btn btn-success">
                💾 Save Client Info
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                ✕ Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ClientInfoForm;

import React, { useState } from 'react';

const ClientInfoForm = ({ jobId, initialData, onSave, onClose }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Client Information</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

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
      </div>
    </div>
  );
};

export default ClientInfoForm;

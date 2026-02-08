import React, { useState } from 'react';

const TechnicianChecksForm = ({ jobId, initialData, onSave, onClose }) => {
  const [formData, setFormData] = useState(
    initialData ? {
      input: initialData.input || '',
      output: initialData.output || '',
      chock: initialData.chock || '',
      controlBoard1: initialData.controlBoard1 || '',
      keypad: initialData.keypad || '',
      controlBoardSupply: initialData.controlBoardSupply || '',
      fan: initialData.fan || '',
      powerCardCondition: initialData.powerCardCondition || '',
      remarks: initialData.remarks || '',
      checkedBy: initialData.checkedBy || '',
      repairedBy: initialData.repairedBy || '',
      dateOfRepairing: initialData.dateOfRepairing || new Date().toISOString().split('T')[0],
      warrantyStartDate: initialData.warrantyStartDate || '',
      warrantyEndDate: initialData.warrantyEndDate || ''
    } : {
      input: '',
      output: '',
      chock: '',
      controlBoard1: '',
      keypad: '',
      controlBoardSupply: '',
      fan: '',
      powerCardCondition: '',
      remarks: '',
      checkedBy: '',
      repairedBy: '',
      dateOfRepairing: new Date().toISOString().split('T')[0],
      warrantyStartDate: '',
      warrantyEndDate: ''
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
    onSave(formData);
  };

  const statusOptions = [
    { value: '', label: '-- Select --' },
    { value: 'ok', label: '✅ OK' },
    { value: 'notok', label: '❌ Not OK' }
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔧 Technician Checks</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* CHECKS SECTION */}
          <div className="form-section-title">Quick Checks</div>

          <div className="form-row">
            <div className="form-group">
              <label>1. Input</label>
              <select name="input" value={formData.input} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>2. Output</label>
              <select name="output" value={formData.output} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>3. Chock</label>
              <select name="chock" value={formData.chock} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>4. Control Board</label>
              <select name="controlBoard1" value={formData.controlBoard1} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>5. Keypad</label>
              <select name="keypad" value={formData.keypad} onChange={handleChange}>
                <option value="">-- Select --</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            <div className="form-group">
              <label>6. Control Board with Supply</label>
              <select name="controlBoardSupply" value={formData.controlBoardSupply} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>7. Fan</label>
              <select name="fan" value={formData.fan} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>8. Power Card Condition</label>
              <select name="powerCardCondition" value={formData.powerCardCondition} onChange={handleChange}>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>9. Remarks</label>
            <textarea
              name="remarks"
              placeholder="Enter any remarks"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>10. Checked By</label>
            <input
              type="text"
              name="checkedBy"
              placeholder="Technician name"
              value={formData.checkedBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-divider"></div>

          <div className="form-section-title">Repair Details</div>

          <div className="form-group">
            <label>11. Repaired By</label>
            <input
              type="text"
              name="repairedBy"
              placeholder="Repairer name"
              value={formData.repairedBy}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>12. Date of Repairing</label>
            <input
              type="date"
              name="dateOfRepairing"
              value={formData.dateOfRepairing}
              onChange={handleChange}
            />
          </div>

          <div className="form-divider"></div>

          <div className="form-section-title">⚖️ Warranty Details</div>

          <div className="form-row">
            <div className="form-group">
              <label>Warranty Start Date</label>
              <input
                type="date"
                name="warrantyStartDate"
                value={formData.warrantyStartDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Warranty End Date</label>
              <input
                type="date"
                name="warrantyEndDate"
                value={formData.warrantyEndDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn btn-success">
              💾 Save Technician Checks
            </button>
            <button type="button" className="btn btn-danger" onClick={onClose}>
              ✕ Close Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TechnicianChecksForm;

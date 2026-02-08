import React from 'react';

const JobDetailsBox = ({ jobs, onEdit, onPDF, onTechChecks }) => {
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Received':
        return 'status-received';
      case 'Inspected':
        return 'status-inspected';
      case 'Complete':
        return 'status-complete';
      default:
        return 'status-received';
    }
  };

  return (
    <div className="job-details-container">
      <h2>📊 Job Details</h2>

      {jobs.length === 0 ? (
        <div className="no-data">
          No jobs yet. Click "New Job" button to create one.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="jobs-table">
            <thead>
              <tr>
                <th>Job No.</th>
                <th>Client Name</th>
                <th>Serial No.</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job.jobId}>
                  <td>{job.jobNo || job.jobId}</td>
                  <td>{job.clientName}</td>
                  <td>{job.serialNo}</td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(job.status)}`}>
                      {job.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-primary"
                        onClick={() => onEdit(job.jobId)}
                        title="Edit job details"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={() => onTechChecks(job.jobId)}
                        title="Open technician checks form"
                      >
                        🔧 Tech Check
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => onPDF(job.jobId)}
                        title="Generate and view PDF"
                      >
                        📄 PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default JobDetailsBox;

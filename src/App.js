import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import ClientInfoForm from './components/ClientInfoForm';
import TechnicianChecksForm from './components/TechnicianChecksForm';
import JobDetailsBox from './components/JobDetailsBox';
import PDFGeneratorModal from './components/PDFGeneratorModal';
import GoogleSheetsSettings from './components/GoogleSheetsSettings';
import { syncToGoogleSheets } from './utils/googleSheetsSync';

function App() {
  const [jobs, setJobs] = useState(() => {
    try {
      const s = localStorage.getItem('vfdJobs');
      return s ? JSON.parse(s) : [];
    } catch (e) {
      console.error('Failed to parse stored jobs on init', e);
      return [];
    }
  });
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTechForm, setShowTechForm] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showGoogleSheetsSettings, setShowGoogleSheetsSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // (Initialization moved into useState to avoid overwriting localStorage on mount)

  // Save jobs to localStorage
  useEffect(() => {
    localStorage.setItem('vfdJobs', JSON.stringify(jobs));
  }, [jobs]);

  // Generate sequential job number
  const generateJobNumber = () => {
    let counter = parseInt(localStorage.getItem('vfdJobCounter') || '0', 10);
    counter += 1;
    localStorage.setItem('vfdJobCounter', counter.toString());
    return counter.toString();
  };

  // Handle new job
  const handleNewJob = () => {
    const newJobId = generateJobNumber();
    setCurrentJobId(newJobId);
    setEditingJobId(null);
    setShowClientForm(true);
  };

  // Handle save client info
  const handleSaveClientInfo = (clientData) => {
    const existingJobIndex = jobs.findIndex(j => j.jobId === currentJobId);
    
    if (existingJobIndex >= 0) {
      // Update existing job
      const updatedJobs = [...jobs];
      updatedJobs[existingJobIndex] = {
        ...updatedJobs[existingJobIndex],
        ...clientData,
        status: 'Received'
      };
      setJobs(updatedJobs);
    } else {
      // Create new job
      const newJob = {
        jobId: currentJobId,
        ...clientData,
        status: 'Received',
        createdAt: new Date().toISOString()
      };
      setJobs([...jobs, newJob]);
    }
    
    setShowClientForm(false);
  };

  // Handle save technician checks
  const handleSaveTechChecks = (techData) => {
    const updatedJobs = jobs.map(job =>
      job.jobId === currentJobId
        ? { ...job, ...techData, status: 'Inspected' }
        : job
    );
    setJobs(updatedJobs);
    setShowTechForm(false);
  };

  // Handle edit job
  const handleEditJob = (jobId) => {
    setCurrentJobId(jobId);
    setEditingJobId(jobId);
    setShowClientForm(true);
  };

  // Handle PDF generation
  const handleGeneratePDF = (jobId) => {
    setCurrentJobId(jobId);
    setShowPDFModal(true);
  };

  // Handle PDF save - update status and dispatch date
  const handlePDFSave = (reportData) => {
    const updatedJobs = jobs.map(job =>
      job.jobId === currentJobId
        ? {
            ...job,
            status: 'Complete',
            dispatchDate: new Date().toISOString().split('T')[0],
            inspection_report: reportData.inspection_report || '',
            service_report: reportData.service_report || '',
            testing_report: reportData.testing_report || '',
            warranty_report: reportData.warranty_report || ''
          }
        : job
    );
    setJobs(updatedJobs);
  };

  // Handle open technician checks
  const handleOpenTechForm = (jobId) => {
    setCurrentJobId(jobId);
    setShowTechForm(true);
  };

  // Handle sync to Google Sheets
  const handleSyncToGoogleSheets = async () => {
    try {
      const result = await syncToGoogleSheets(jobs);
      alert(result.message);
    } catch (error) {
      console.error('Sync error:', error);
      alert('Failed to sync to Google Sheets');
    }
  };

  // Handle open Google Sheets settings
  const handleOpenGoogleSheetsSettings = () => {
    setShowGoogleSheetsSettings(true);
  };

  // Handle refresh
  const handleRefresh = () => {
    window.location.reload();
  };

  const currentJob = jobs.find(j => j.jobId === currentJobId);

  // Filter jobs based on search query
  const filteredJobs = jobs.filter(job => {
    const query = searchQuery.toLowerCase();
    return (
      (job.clientName && job.clientName.toLowerCase().includes(query)) ||
      (job.jobId && job.jobId.toLowerCase().includes(query)) ||
      (job.serialNo && job.serialNo.toLowerCase().includes(query))
    );
  });

  return (
    <div className="app-container">
      <Header
        onNewJob={handleNewJob}
        onSyncSheets={handleSyncToGoogleSheets}
        onOpenSettings={handleOpenGoogleSheetsSettings}
        onRefresh={handleRefresh}
        isMobile={isMobile}
      />

      <main className="main-content">
        {showClientForm && (
          <ClientInfoForm
            jobId={currentJobId}
            initialData={editingJobId ? currentJob : null}
            onSave={handleSaveClientInfo}
            onClose={() => setShowClientForm(false)}
          />
        )}

        {showTechForm && (
          <TechnicianChecksForm
            jobId={currentJobId}
            initialData={currentJob}
            onSave={handleSaveTechChecks}
            onClose={() => setShowTechForm(false)}
          />
        )}

        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search by Client Name, Job No, or Serial No..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        <JobDetailsBox
          jobs={filteredJobs}
          onEdit={handleEditJob}
          onPDF={handleGeneratePDF}
          onTechChecks={handleOpenTechForm}
        />
      </main>

      {showPDFModal && (
        <PDFGeneratorModal
          jobData={currentJob}
          onClose={() => setShowPDFModal(false)}
          onGeneratePDF={handlePDFSave}
        />
      )}

      <GoogleSheetsSettings
        isOpen={showGoogleSheetsSettings}
        onClose={() => setShowGoogleSheetsSettings(false)}
      />
      {/* Jobs are visible in the main JobDetailsBox; no separate history modal */}
    </div>
  );
}

export default App;

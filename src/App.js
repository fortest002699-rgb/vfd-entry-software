import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import PasswordModal from './components/PasswordModal';
import ClientInfoForm from './components/ClientInfoForm';
import TechnicianChecksForm from './components/TechnicianChecksForm';
import JobDetailsBox from './components/JobDetailsBox';
import PDFGeneratorModal from './components/PDFGeneratorModal';
import { syncToGoogleSheets } from './utils/googleSheetsSync';
import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  updateDoc
} from 'firebase/firestore';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('vfdAppLoggedIn') === 'true';
  });
  const [jobs, setJobs] = useState([]);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showTechForm, setShowTechForm] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [showPDFPasswordModal, setShowPDFPasswordModal] = useState(false);
  const [pdfJobIdToUnlock, setPdfJobIdToUnlock] = useState(null);
  const [editingJobId, setEditingJobId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle login
  const handleLogin = () => {
    localStorage.setItem('vfdAppLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('vfdAppLoggedIn');
    setIsLoggedIn(false);
  };

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

  // Firestore realtime sync: subscribe to 'jobs' collection
  useEffect(() => {
    const q = query(collection(db, 'jobs'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ _id: d.id, ...d.data() }));
      setJobs(list);

      // Auto-reset job counter if database is empty
      if (list.length === 0) {
        const counter = parseInt(localStorage.getItem('vfdJobCounter') || '0', 10);
        if (counter > 0) {
          console.log('📊 Database is empty, resetting job counter to 0');
          localStorage.setItem('vfdJobCounter', '0');
        }
      }
    }, (err) => {
      console.error('Firestore onSnapshot error', err);
    });

    return () => unsub();
  }, []);

  // Generate sequential job number
  // Preview next job number without committing
  const getPreviewJobNumber = () => {
    const counter = parseInt(localStorage.getItem('vfdJobCounter') || '0', 10);
    return (counter + 1).toString();
  };

  // Reserve and commit job number (call when saving)
  const reserveJobNumber = () => {
    let counter = parseInt(localStorage.getItem('vfdJobCounter') || '0', 10);
    counter += 1;
    localStorage.setItem('vfdJobCounter', counter.toString());
    return counter.toString();
  };

  // Handle new job
  const handleNewJob = () => {
    // show preview job number but do NOT commit it yet
    const previewId = getPreviewJobNumber();
    setCurrentJobId(previewId);
    setEditingJobId(null);
    setShowClientForm(true);
  };

  // Handle save client info
  const handleSaveClientInfo = async (clientData) => {
    try {
      // find if existing Firestore doc for this jobId
      let existing = jobs.find(j => j.jobId === currentJobId);
      if (existing && existing._id) {
        const docRef = doc(db, 'jobs', existing._id);
        await updateDoc(docRef, {
          ...clientData,
          status: 'Received'
        });
      } else {
        // commit a new job number (reserve) and create new doc
        const committedJobId = reserveJobNumber();
        const newDoc = {
          jobId: committedJobId,
          ...clientData,
          status: 'Received',
          createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'jobs'), newDoc);
        // update currentJobId so UI reflects committed id
        setCurrentJobId(committedJobId);
        // refresh existing reference
        existing = { jobId: committedJobId };
      }
    } catch (err) {
      console.error('Failed to save client info to Firestore', err);
      // Fallback to localStorage
      // fallback: try to reserve a job number locally and store
      const committedJobId = reserveJobNumber();
      const existingJobIndex = jobs.findIndex(j => j.jobId === committedJobId);
      if (existingJobIndex >= 0) {
        const updatedJobs = [...jobs];
        updatedJobs[existingJobIndex] = {
          ...updatedJobs[existingJobIndex],
          ...clientData,
          status: 'Received'
        };
        setJobs(updatedJobs);
      } else {
        const newJob = {
          jobId: committedJobId,
          ...clientData,
          status: 'Received',
          createdAt: new Date().toISOString()
        };
        setJobs([...jobs, newJob]);
        setCurrentJobId(committedJobId);
      }
    }

    setShowClientForm(false);
  };

  // Handle save technician checks
  const handleSaveTechChecks = (techData) => {
    (async () => {
      try {
        const existing = jobs.find(j => j.jobId === currentJobId);
        if (existing && existing._id) {
          const docRef = doc(db, 'jobs', existing._id);
          await updateDoc(docRef, { ...techData, status: 'Inspected' });
        } else {
          // fallback: update local
          const updatedJobs = jobs.map(job =>
            job.jobId === currentJobId
              ? { ...job, ...techData, status: 'Inspected' }
              : job
          );
          setJobs(updatedJobs);
        }
      } catch (err) {
        console.error('Failed to save tech checks to Firestore', err);
      }
      setShowTechForm(false);
    })();
  };

  // Handle edit job
  const handleEditJob = (jobId) => {
    setCurrentJobId(jobId);
    setEditingJobId(jobId);
    setShowClientForm(true);
  };

// Handle PDF generation (password protected)
   const handleGeneratePDF = (jobId) => {
     setPdfJobIdToUnlock(jobId);
     setShowPDFPasswordModal(true);
   };

  // Handle PDF password confirmation
  const handlePDFPasswordConfirmed = () => {
    setCurrentJobId(pdfJobIdToUnlock);
    setShowPDFModal(true);
    setShowPDFPasswordModal(false);
    setPdfJobIdToUnlock(null);
  };

  // Handle PDF save - update status and dispatch date
  const handlePDFSave = (reportData) => {
    (async () => {
      try {
        const existing = jobs.find(j => j.jobId === currentJobId);
        if (existing && existing._id) {
          const docRef = doc(db, 'jobs', existing._id);
          await updateDoc(docRef, {
            status: 'Complete',
            dispatchDate: new Date().toISOString().split('T')[0],
            inspection_report: reportData.inspection_report || '',
            service_report: reportData.service_report || '',
            testing_report: reportData.testing_report || '',
            warranty_report: reportData.warranty_report || ''
          });
        } else {
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
        }
      } catch (err) {
        console.error('Failed to update PDF save to Firestore', err);
      }
    })();
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

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      <Header
        onNewJob={handleNewJob}
        onSyncSheets={handleSyncToGoogleSheets}
        onRefresh={handleRefresh}
        onLogout={handleLogout}
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

      {showPDFPasswordModal && (
        <PasswordModal
          title="🔐 PDF Password"
          correctPassword="pdf..@admin"
          onSubmit={handlePDFPasswordConfirmed}
          onCancel={() => {
            setShowPDFPasswordModal(false);
            setPdfJobIdToUnlock(null);
          }}
        />
      )}

      {showPDFModal && (
        <PDFGeneratorModal
          jobData={currentJob}
          onClose={() => setShowPDFModal(false)}
          onGeneratePDF={handlePDFSave}
        />
      )}

      {/* Jobs are visible in the main JobDetailsBox; no separate history modal */}
    </div>
  );
}

export default App;

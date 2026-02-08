import React, { useEffect, useState } from "react";
import { db, functions, callFunction } from "./firebase";
import { collection, onSnapshot, query, where, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

// ==================== ERROR BOUNDARY ====================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ERROR BOUNDARY CAUGHT:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: "20px", textAlign: "center", background: "#fff8f0"}}>
          <h2>⚠️ Oops! Something went wrong</h2>
          <p style={{color: "#666"}}>Error: {this.state.error?.message}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{padding: "10px 20px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer"}}
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ================= DEVICE TYPE DETECTION ================= */
const isMobileDevice = () => {
  try {
    if (typeof window !== "undefined" && window.Capacitor) {
      return true;
    }
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  } catch (e) {
    return false;
  }
};

/* ================= PDF VIEWER MODAL ================= */
const PdfViewer = ({ pdfData, isOpen, onClose, filename }) => {
  const [pdfUrl, setPdfUrl] = React.useState(null);

  React.useEffect(() => {
    if (isOpen && pdfData) {
      try {
        const url = typeof pdfData === "string" 
          ? pdfData 
          : URL.createObjectURL(new Blob([pdfData], { type: "application/pdf" }));
        setPdfUrl(url);

        return () => {
          if (url && !url.startsWith("http")) {
            setTimeout(() => URL.revokeObjectURL(url), 100);
          }
        };
      } catch (err) {
        console.error("PDF error:", err);
      }
    }
  }, [isOpen, pdfData]);

  if (!isOpen) return null;

  return (
    <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000}}>
      <div style={{background: "white", borderRadius: "8px", width: "90%", maxWidth: "900px", maxHeight: "90vh", overflow: "auto"}}>
        <div style={{display: "flex", justifyContent: "space-between", padding: "10px", borderBottom: "1px solid #ccc"}}>
          <h3>{filename}</h3>
          <button onClick={onClose} style={{cursor: "pointer", background: "none", border: "none", fontSize: "20px"}}>✕</button>
        </div>
        {pdfUrl && (
          <iframe
            title="PDF Viewer"
            src={pdfUrl}
            style={{width: "100%", height: "100%", minHeight: "500px", border: "none"}}
          />
        )}
      </div>
    </div>
  );
};

/* ================= MAIN APP COMPONENT ================= */
function App() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const [backendStatus, setBackendStatus] = useState("🔍 Connecting to Firebase...");
  const [showSettings, setShowSettings] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [selectedPdf, setSelectedPdf] = useState(null);

  // ==================== INITIALIZE FIREBASE ====================
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        setBackendStatus("🔍 Connecting to Firebase...");
        
        // Test Firebase connection
        await fetch("/__/firebase/init");
        
        setBackendStatus("⏳ Fetching jobs...");
        
        // Setup real-time jobs listener
        const q = query(collection(db, "jobs"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const jobsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setJobs(jobsList);
          setBackendStatus("✅ Connected!");
          setError(null);
          setIsLoadingBackend(false);
          setLoading(false);
        }, (err) => {
          console.error("Error fetching jobs:", err);
          setError(err.message);
          setBackendStatus("❌ Connection error");
          setIsLoadingBackend(false);
          setLoading(false);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Firebase initialization error:", err);
        setError(err.message);
        setBackendStatus("❌ Firebase error");
        setIsLoadingBackend(false);
        setLoading(false);
      }
    };

    const unsubscribe = initializeFirebase();
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // ==================== CRUD OPERATIONS ====================
  const createJob = async (jobData) => {
    try {
      await addDoc(collection(db, "jobs"), {
        ...jobData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setError(null);
    } catch (err) {
      console.error("Error creating job:", err);
      setError(err.message);
    }
  };

  const updateJob = async (jobId, updates) => {
    try {
      const jobRef = doc(db, "jobs", jobId);
      await updateDoc(jobRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setError(null);
    } catch (err) {
      console.error("Error updating job:", err);
      setError(err.message);
    }
  };

  const deleteJob = async (jobId) => {
    try {
      await deleteDoc(doc(db, "jobs", jobId));
      setError(null);
    } catch (err) {
      console.error("Error deleting job:", err);
      setError(err.message);
    }
  };

  const generatePdf = async (job) => {
    try {
      setBackendStatus("🔄 Generating PDF...");
      const generatePdfFn = httpsCallable(functions, "generatePdf");
      const result = await generatePdfFn({ jobId: job.id, jobData: job });
      setBackendStatus("✅ PDF generated!");
      setSelectedPdf({ data: result.data, filename: `Job_${job.jobNumber}.pdf` });
      setPdfViewerOpen(true);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setError(err.message);
      setBackendStatus("❌ PDF generation failed");
    }
  };

  // ==================== RENDER ====================
  return (
    <ErrorBoundary>
      <div style={{minHeight: "100vh", background: "#f8f9fa", padding: "20px"}}>
        {/* Loading Screen */}
        {isLoadingBackend && (
          <div style={{
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            color: "white", zIndex: 999
          }}>
            <div style={{
              border: "6px solid rgba(255,255,255,0.3)",
              borderTop: "6px solid #fff",
              borderRadius: "50%",
              width: "50px", height: "50px",
              animation: "spin 1s linear infinite"
            }}/>
            <div style={{marginTop: "20px", fontSize: "18px"}}>{backendStatus}</div>
          </div>
        )}

        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: "20px", background: "white", padding: "15px", borderRadius: "8px"
        }}>
          <h1 style={{margin: 0, color: "#333"}}>📊 DTS Jobs Manager</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: "#007bff", color: "white", border: "none",
              padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontSize: "16px"
            }}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div style={{
            background: "white", padding: "20px", borderRadius: "8px",
            marginBottom: "20px", border: "1px solid #ddd"
          }}>
            <h3>Settings</h3>
            <p>Firebase Configuration: <strong>dts-service-577a4</strong></p>
            <p style={{color: "#666", fontSize: "14px"}}>
              ✅ Real-time sync enabled via Firestore<br/>
              ✅ Cloud Functions backend active<br/>
              ✅ Works on all networks automatically
            </p>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                background: "#28a745", color: "white", border: "none",
                padding: "8px 16px", borderRadius: "5px", cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div style={{
            background: "#f8d7da", color: "#721c24", padding: "15px",
            borderRadius: "5px", marginBottom: "20px"
          }}>
            ❌ {error}
          </div>
        )}

        {/* Jobs Table */}
        {!loading ? (
          <div style={{
            background: "white", borderRadius: "8px", padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{marginTop: 0}}>Jobs ({jobs.length})</h2>
            {jobs.length === 0 ? (
              <p style={{color: "#999"}}>No jobs yet. Create one to get started!</p>
            ) : (
              <div style={{overflowX: "auto"}}>
                <table style={{width: "100%", borderCollapse: "collapse"}}>
                  <thead>
                    <tr style={{borderBottom: "2px solid #ddd"}}>
                      <th style={{textAlign: "left", padding: "10px"}}>Job #</th>
                      <th style={{textAlign: "left", padding: "10px"}}>Client</th>
                      <th style={{textAlign: "left", padding: "10px"}}>Status</th>
                      <th style={{textAlign: "left", padding: "10px"}}>Amount</th>
                      <th style={{textAlign: "center", padding: "10px"}}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map(job => (
                      <tr key={job.id} style={{borderBottom: "1px solid #eee"}}>
                        <td style={{padding: "10px"}}>{job.jobNumber}</td>
                        <td style={{padding: "10px"}}>{job.clientName}</td>
                        <td style={{padding: "10px"}}>
                          <span style={{
                            background: job.status === "completed" ? "#d4edda" : "#fff3cd",
                            color: job.status === "completed" ? "#155724" : "#856404",
                            padding: "4px 8px", borderRadius: "4px", fontSize: "12px"
                          }}>
                            {job.status}
                          </span>
                        </td>
                        <td style={{padding: "10px"}}>₹{job.amount}</td>
                        <td style={{padding: "10px", textAlign: "center"}}>
                          <button
                            onClick={() => generatePdf(job)}
                            style={{background: "#007bff", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer", marginRight: "5px"}}
                          >
                            📄 PDF
                          </button>
                          <button
                            onClick={() => deleteJob(job.id)}
                            style={{background: "#dc3545", color: "white", border: "none", padding: "5px 10px", borderRadius: "4px", cursor: "pointer"}}
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div style={{textAlign: "center", padding: "40px"}}>Loading jobs...</div>
        )}

        {/* PDF Viewer */}
        {selectedPdf && (
          <PdfViewer
            pdfData={selectedPdf.data}
            filename={selectedPdf.filename}
            isOpen={pdfViewerOpen}
            onClose={() => setPdfViewerOpen(false)}
          />
        )}

        {/* Styles */}
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </ErrorBoundary>
  );
}

export default App;

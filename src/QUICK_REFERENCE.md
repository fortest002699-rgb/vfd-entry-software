# VFD Entry Software - Quick Reference Card

## 🚀 Quick Start

### Installation
```bash
cd c:\Users\DAS\dts-frontend
npm install
npm start
```

### Build for Production
```bash
npm run build
```

---

## 📁 Project Structure at a Glance

```
src/
├── components/              # React Components
│   ├── Header.js           # Navigation header
│   ├── ClientInfoForm.js   # Client data form
│   ├── TechnicianChecksForm.js  # Tech checks form
│   ├── JobDetailsBox.js    # Jobs listing table
│   └── PDFGeneratorModal.js  # PDF generation
│
├── utils/                  # Utilities
│   └── googleSheetsSync.js # Google Sheets sync
│
├── App.js                  # Main app component (State management)
├── App.css                 # Responsive stylesheets
└── index.js                # React entry point
```

---

## 🎯 Key Files to Edit

### Add New Form Field
**File**: `src/components/ClientInfoForm.js` or `src/components/TechnicianChecksForm.js`
```javascript
// Add to form JSX:
<div className="form-group">
  <label>New Field</label>
  <input type="text" name="fieldName" onChange={handleChange} />
</div>

// Add to formData state:
const [formData, setFormData] = useState({
  ...others,
  fieldName: ''
});
```

### Change Button Text
**File**: `src/components/Header.js`
```javascript
<button className="btn btn-primary" onClick={onNewJob}>
  New Text Here  // Change this
</button>
```

### Modify Styles
**File**: `src/App.css`
Look for class names matching the component and update CSS.

### Add New PDF Segment
**File**: `src/components/PDFGeneratorModal.js`
```javascript
// Add new segment section in generatePDF():
// ===== SEGMENT X: NAME =====
addSegmentHeader(pdf, 'Segment X: Title', margin, yPosition);
yPosition += 8;
// ... add content ...
```

---

## 🔌 API Integration Points

### Google Sheets Sync
**File**: `src/utils/googleSheetsSync.js`
```javascript
// Modify syncToGoogleSheets() function
export const syncToGoogleSheets = async (jobsData) => {
  // Add custom logic here
};
```

### Add Backend API Call
**File**: `src/App.js`
```javascript
// Add new function:
const handleNewAction = async () => {
  try {
    const response = await fetch('/api/endpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data })
    });
    const result = await response.json();
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📊 State Management

### Main App State (in App.js)
```javascript
const [jobs, setJobs] = useState([]);           // All jobs
const [showClientForm, setShowClientForm] = useState(false);
const [showTechForm, setShowTechForm] = useState(false);
const [currentJobId, setCurrentJobId] = useState(null);
const [showPDFModal, setShowPDFModal] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
```

### Data Persistence
```javascript
// Save to localStorage when jobs change
useEffect(() => {
  localStorage.setItem('vfdJobs', JSON.stringify(jobs));
}, [jobs]);

// Load from localStorage on mount
useEffect(() => {
  const savedJobs = localStorage.getItem('vfdJobs');
  if (savedJobs) setJobs(JSON.parse(savedJobs));
}, []);
```

---

## 🎨 CSS Class Names

### Containers
- `.app-container` - Main app wrapper
- `.header` - Header section
- `.main-content` - Main content area
- `.form-container` - Form wrapper
- `.job-details-container` - Jobs table wrapper

### Styling
- `.form-group` - Single form field
- `.form-row` - Row of form fields
- `.form-divider` - Horizontal line divider
- `.form-section-title` - Section heading
- `.status-badge` - Status indicator
- `.modal-overlay` - Modal background
- `.modal-content` - Modal container

### Buttons
- `.btn` - Base button style
- `.btn-primary` - Blue/primary button
- `.btn-success` - Green/success button
- `.btn-danger` - Red/danger button
- `.btn-secondary` - Gray/secondary button

---

## 🔧 Common Tasks

### Change Status Colors
**File**: `src/App.css`
```css
.status-received {
  background: #d4edda;
  color: #155724;
}
.status-inspected {
  background: #fff3cd;
  color: #856404;
}
.status-complete {
  background: #d1ecf1;
  color: #0c5460;
}
```

### Add New Dropdown Options
**File**: `src/components/TechnicianChecksForm.js`
```javascript
const statusOptions = [
  { value: '', label: '-- Select --' },
  { value: 'ok', label: '✅ OK' },
  { value: 'notok', label: '❌ Not OK' }
  // Add more options here
];
```

### Modify Mobile Breakpoint
**File**: `src/App.css`
```css
/* Change from 768px to desired breakpoint */
@media (max-width: 768px) {
  /* Mobile styles here */
}
```

---

## 🐛 Debugging Tips

### Check Console
Press F12 → Console tab for errors

### Check Storage
```javascript
// In browser console:
JSON.parse(localStorage.getItem('vfdJobs'))
```

### Check State
Add console.log in component:
```javascript
useEffect(() => {
  console.log('Jobs updated:', jobs);
}, [jobs]);
```

### Network Requests
Press F12 → Network tab → Perform action → View requests

---

## 📦 Dependencies and Versions

```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "jspdf": "latest",
  "html2canvas": "latest",
  "firebase": "^10.7.0"
}
```

---

## 🚀 Deployment

### Build Production Version
```bash
npm run build
# Creates /build folder with optimized files
```

### Deploy to Firebase
```bash
npm run firebase:deploy
# Requires Firebase CLI installed and configured
```

### Deploy to Other Hosts
1. Run `npm run build`
2. Copy `/build` folder contents
3. Upload to your hosting service

---

## 🔐 Environment Variables (if needed)

Create `.env` file in root:
```
REACT_APP_FIREBASE_API_KEY=your_key_here
REACT_APP_GOOGLE_SHEETS_ID=your_sheet_id
```

Access in code:
```javascript
const apiKey = process.env.REACT_APP_FIREBASE_API_KEY;
```

---

## 📝 Testing the App

### Manual Test Checklist

- [ ] Create new job - verify Job No. is generated
- [ ] Fill client info - verify all fields save
- [ ] Edit existing job - verify changes persist
- [ ] Open tech checks - verify form loads
- [ ] Save tech checks - verify status changes
- [ ] Generate PDF - verify 4 segments included
- [ ] Sync to sheets - verify in Google Sheets
- [ ] Test on mobile - verify responsive layout
- [ ] Test on tablet - verify tablet layout
- [ ] Test offline - verify data persists
- [ ] Refresh page - verify data reloads
- [ ] Delete job - verify removal

---

## 📞 Code Examples

### Create New Job Programmatically
```javascript
const newJob = {
  jobId: generateJobNumber(),
  clientName: 'John Doe',
  serialNo: 'SN123',
  status: 'Received'
};
setJobs([...jobs, newJob]);
```

### Update Existing Job
```javascript
const updated = jobs.map(job =>
  job.jobId === targetId
    ? { ...job, status: 'Inspected' }
    : job
);
setJobs(updated);
```

### Filter Jobs by Status
```javascript
const receivedJobs = jobs.filter(job => job.status === 'Received');
```

---

## 🎯 Performance Tips

1. Use localStorage for offline access
2. Lazy load PDF generation
3. Debounce form inputs if auto-saving
4. Use React.memo for static components
5. Optimize images/assets

---

## 📚 Resources

- React Docs: https://react.dev
- jsPDF Docs: https://github.com/parallax/jsPDF
- Firebase Docs: https://firebase.google.com/docs
- MDN Web Docs: https://developer.mozilla.org

---

**Quick Reference Version**: 1.0.0
**Last Updated**: February 8, 2026

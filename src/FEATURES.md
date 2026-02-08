# VFD Entry Software - Features Documentation

## 🎯 Core Features

### 1. Header Section - Navigation & Actions
**Visible On**: All Devices (Responsive)

**Components**:
- **Title**: "🚀 VFD ENTRY SOFTWARE" (center-aligned)
- **Buttons** (Responsive Layout):
  - **Mobile**: Stacked vertically, full-width
  - **Tablet**: Horizontal with wrapping
  - **Desktop**: Horizontal in line

**Buttons**:
1. **➕ New Job**
   - Creates new job with auto-generated Job Number
   - Opens Client Information form
   - Status: NEW

2. **☁️ Sync to Google Sheet**
   - Uploads all jobs to Google Sheets
   - Shows success/failure message
   - Queues failed syncs locally

3. **🔄 Refresh**
   - Reloads page and refreshes data
   - Preserves local storage data

---

## 📋 Form 1: Client Information

**Triggered By**: "New Job" button or "Edit" action

**Fields**:
1. **Job No. (Auto-generated)** - Read-only
   - Format: JOB-{timestamp}-{random}
   - Example: JOB-1707312345-789

2. **Entry Date** - Date picker
   - Default: Current date
   - Required: Yes

3. **Make** - Text input
   - Example: "ABB", "Siemens", "VEX"
   - Required: No

4. **Model No.** - Text input
   - Example: "ACS580", "ACE580"
   - Required: No

5. **Serial No.** - Text input
   - Example: "5103456789"
   - Required: No

6. **Client Name** - Text input
   - Required: Yes (Validation)
   - Error shown if empty

**Buttons**:
- **💾 Save Client Info** - Saves job with "Received" status
- **✕ Cancel** - Closes form without saving

**Status After Save**: "Received"

---

## 🔧 Form 2: Technician Checks

**Triggered By**: "Tech Check" button in Job Details

**Section 1: Quick Checks** (8 Items)

Each has dropdown: "-- Select --" / "✅ OK" / "❌ Not OK"

1. **Input** - Check input status
2. **Output** - Check output status
3. **Chock** - Check chocking mechanism
4. **Control Board 1** - First control board status
5. **Control Board 2** - Second control board status
6. **Control Board with Supply** - Control board power supply
7. **Fan** - Fan operation status
8. **Power Card Condition** - Power card health

---

**Section 2: Additional Details**

9. **Remarks** - Text area
   - For any observations
   - Multi-line input

10. **Checked By** - Text input
    - Technician name

---

**Section 3: Repair Details** (After divider line)

11. **Repaired By** - Text input
    - Repairer name

12. **Date of Repairing** - Date picker
    - Date when repair was done
    - Default: Current date

---

**Section 4: Warranty Details** (After divider line)

13. **Warranty Start Date** - Date picker
    - When warranty begins

14. **Warranty End Date** - Date picker
    - When warranty expires

**Buttons**:
- **💾 Save Technician Checks** - Saves form, sets status to "Inspected"
- **✕ Close Form** - Closes form without saving

**Status After Save**: "Inspected"

---

## 📊 Job Details Box

**Shows**: Table of all jobs with following columns:

| Column | Content |
|--------|---------|
| Job No. | Auto-generated job number |
| Client Name | Client's name from Client Info form |
| Serial No. | Device serial number |
| Status | Current job status (badge-styled) |
| Action | Buttons for job operations |

**Status Badges**:
- 🟢 **Received** - Client info saved (green background)
- 🟡 **Inspected** - Technician checks saved (yellow background)
- 🔵 **Complete** - PDF generated (blue background)

**Action Buttons** (Per Job):
1. **✏️ Edit** - Opens Client Info form for editing
2. **🔧 Tech Check** - Opens Technician Checks form
3. **📄 PDF** - Generates and downloads PDF

**Features**:
- Empty state message if no jobs
- Responsive table (scrollable on small screens)
- Hover effects on rows
- Color-coded status badges

---

## 📄 PDF Generation - 4 Segments

**PDF Name**: Job_{JobNo}.pdf

**Triggered By**: "📄 PDF" button

**Modal**: Shows confirmation with 4 segments preview

**PDF Structure**:

### Segment 1: Job Information
Contains:
- Job No.
- Entry Date
- Client Name
- Make

### Segment 2: Device Specifications
Contains:
- Model No.
- Serial No.

### Segment 3: Technician Checks
Contains:
- Input (✓ OK / ✗ NOT OK)
- Output (✓ OK / ✗ NOT OK)
- Chock (✓ OK / ✗ NOT OK)
- Control Board 1 (✓ OK / ✗ NOT OK)
- Control Board 2 (✓ OK / ✗ NOT OK)
- Control Board with Supply (✓ OK / ✗ NOT OK)
- Fan (✓ OK / ✗ NOT OK)
- Power Card Condition (✓ OK / ✗ NOT OK)
- Remarks (if available)

### Segment 4: Repair & Warranty Details
Contains:
- Checked By
- Repaired By
- Date of Repairing
- Warranty Start Date
- Warranty End Date
- Job Status: Complete

**Features**:
- Professional formatting with headers
- Color-coded status indicators (Green OK, Red NOT OK)
- Multi-page support if needed
- Generation timestamp in footer
- Auto-downloads as PDF file

**Status After PDF**: "Complete"

---

## 💾 Data Storage & Sync

### Local Storage
- **Key**: `vfdJobs`
- **Format**: JSON array of job objects
- **Persistence**: Automatic on every change
- **Access**: Available offline

### Google Sheets Sync
- **Endpoint**: `/api/sync`
- **Method**: POST
- **Trigger**: "Sync to Google Sheet" button
- **Fallback**: If sync fails, data stored in `vfdJobsPending` key
- **Auto-retry**: Not automatic (manual retry via button)

### Data Structure
```javascript
{
  jobId: "JOB-1707312345-789",
  jobNo: "JOB-1707312345-789",
  entryDate: "2024-02-06",
  make: "ABB",
  modelNo: "ACS580",
  serialNo: "SN123456",
  clientName: "John Doe",
  status: "Received" | "Inspected" | "Complete",
  
  // Technician Checks
  input: "ok" | "notok" | "",
  output: "ok" | "notok" | "",
  chock: "ok" | "notok" | "",
  controlBoard1: "ok" | "notok" | "",
  controlBoard2: "ok" | "notok" | "",
  controlBoardSupply: "ok" | "notok" | "",
  fan: "ok" | "notok" | "",
  powerCardCondition: "ok" | "notok" | "",
  remarks: "Any notes",
  checkedBy: "Technician Name",
  repairedBy: "Repairer Name",
  dateOfRepairing: "2024-02-06",
  warrantyStartDate: "2024-02-06",
  warrantyEndDate: "2025-02-06",
  
  createdAt: "2024-02-06T10:30:00.000Z"
}
```

---

## 📱 Responsive Breakpoints

### Mobile Devices (< 768px)
- Full-width buttons stacked vertically
- Single-column form layouts
- Smaller fonts and padding
- Touch-optimized tap targets
- Table horizontally scrollable

### Tablets (768px - 1024px)
- Flexible button arrangements
- Two-column form layouts
- Balanced spacing

### Desktop (> 1024px)
- Horizontal button bars
- Multi-column form layouts
- Full table display
- Maximum width container for readability

---

## 🎨 Color Scheme

| Element | Color | RGB |
|---------|-------|-----|
| Header Background | Dark Blue-Gray | #2c3e50 |
| Primary Button | Light Blue | #3498db |
| Success Button | Green | #27ae60 |
| Danger Button | Red | #e74c3c |
| Secondary Button | Gray | #95a5a6 |
| Received Badge | Light Green | #d4edda |
| Inspected Badge | Light Yellow | #fff3cd |
| Complete Badge | Light Blue | #d1ecf1 |
| Border Color | Light Gray | #ecf0f1 |
| Text Primary | Dark Gray | #2c3e50 |
| Text Secondary | Medium Gray | #7f8c8d |

---

## ⌨️ Keyboard Navigation

- Tab: Navigate between form fields
- Enter: Submit form in modals
- Escape: May close modals (if implemented)
- Focus indicators visible on all interactive elements

---

## 🔄 Workflow - Complete User Journey

1. **User Opens App**
   - Sees Header with 3 buttons and Job Details (empty initially)

2. **User Clicks "New Job"**
   - Client Info form opens
   - Auto-generated Job No. shown
   - Current date pre-filled

3. **User Fills Client Form**
   - Enters: Make, Model, Serial, Client Name

4. **User Clicks "Save Client Info"**
   - Job appears in table with "Received" status
   - Form closes
   - Job No, Client Name, Serial No. visible

5. **User Clicks "Tech Check" on Job**
   - Technician Checks form opens
   - Pre-fills existing data if available

6. **User Fills Tech Checks**
   - Selects OK/Not OK for each item
   - Enters Remarks, names, dates

7. **User Clicks "Save Technician Checks"**
   - Job status changes to "Inspected"
   - Form closes

8. **User Clicks "PDF" on Job**
   - PDF generation modal shows preview
   - User confirms

9. **System Generates PDF**
   - 4 segments created
   - File downloads
   - Job status changes to "Complete"

10. **User Clicks "Sync to Google Sheet"**
    - All jobs upload to Google Sheets
    - Success/failure message shown

---

## ✅ Validation Rules

| Field | Required | Validation |
|-------|----------|-----------|
| Entry Date | Yes | Valid date |
| Client Name | Yes | Not empty |
| Make | No | Any text |
| Model No | No | Any text |
| Serial No | No | Any text |
| Remarks | No | Any text |
| Checked By | No | Any text |
| Repaired By | No | Any text |
| Warranty Dates | No | Valid dates |

---

## 🚀 Quick Actions Summary

| Action | Button/Trigger | Result |
|--------|-----------------|--------|
| Create Job | ➕ New Job | Opens form, generates Job No |
| Save Client | 💾 Save Client Info | Status → Received |
| Open Tech Form | 🔧 Tech Check | Opens technician checks |
| Save Tech Checks | 💾 Save Technician Checks | Status → Inspected |
| Edit Job | ✏️ Edit | Opens client form for edit |
| Generate PDF | 📄 PDF | Status → Complete, downloads file |
| Sync Data | ☁️ Sync to Google Sheet | Uploads to Google Sheets |
| Refresh | 🔄 Refresh | Reloads page |

---

**Last Updated**: February 8, 2026
**Version**: 1.0.0

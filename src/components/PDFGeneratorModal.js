import React, { useState } from 'react';
import { jsPDF } from 'jspdf';

const PDFGeneratorModal = ({ jobData, onClose, onGeneratePDF }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [reports, setReports] = useState({
    inspection_report: '',
    service_report: '',
    testing_report: '',
    warranty_report: ''
  });

  const inspectionTemplate = `After detailed inspection and diagnostic evaluation, the unit was found to have internal electrical malfunction.

Necessary diagnostic checks were carried out to identify the root cause.

(Detailed internal inspection checklists are maintained for internal service records and are not included in this report.)`;

  const serviceTemplate = `The following service actions were performed:

• Internal electrical section serviced  
• Defective components replaced  
• Internal connections cleaned and secured  
• Cooling system checked and restored  
• Complete functional verification completed  

All repairs were carried out using standard industrial service procedures.`;

  const testingTemplate = `The drive was tested under controlled conditions with rated input supply.

Test Results:
- Drive operates normally  
- No abnormal heating observed  
- Output parameters within permissible limits  
- Unit successfully passed load testing`;

  const warrantyTemplate = `The repair is covered under warranty against workmanship-related defects.

WARRANTY PERIOD:
Start Date: ${jobData?.warrantyStartDate || 'N/A'}
End Date: ${jobData?.warrantyEndDate || 'N/A'}

Warranty does not cover physical damage, mishandling, improper installation, or electrical misuse.`;

  const handleReportChange = (e, reportType) => {
    const { value } = e.target;
    setReports({
      ...reports,
      [reportType]: value
    });
  };

  const generatePDFContent = (isPreviewMode = false) => {
    return new Promise((resolve) => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const contentWidth = pdf.internal.pageSize.getWidth() - 2 * margin;
        let yPosition = 20;

        // Helper function to add text with word wrap
        const addWrappedText = (text, fontSize = 10, isBold = false) => {
          pdf.setFontSize(fontSize);
          pdf.setFont('Helvetica', isBold ? 'bold' : 'normal');
          
          // Split by paragraphs first, then by lines
          const paragraphs = text.split('\n\n');
          paragraphs.forEach((paragraph, pIndex) => {
            const lines = pdf.splitTextToSize(paragraph.trim(), contentWidth);
            lines.forEach((line, lineIndex) => {
              if (yPosition > pageHeight - 20) {
                pdf.addPage();
                yPosition = 20;
              }
              pdf.text(line, margin, yPosition);
              yPosition += 6;
            });
            // Add space between paragraphs
            if (pIndex < paragraphs.length - 1) {
              yPosition += 4;
            }
          });
        };

        // ===== HEADER =====
        pdf.setFontSize(16);
        pdf.setFont('Helvetica', 'bold');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const centerX = pageWidth / 2;
        pdf.text('VFD REPORT', centerX, yPosition, { align: 'center' });
        yPosition += 15;

        // Divider line
        pdf.setDrawColor(50, 50, 50);
        pdf.line(margin, yPosition, pdf.internal.pageSize.getWidth() - margin, yPosition);
        yPosition += 10;

        // ===== JOB DETAILS (CLIENT INFO ONLY) =====
        pdf.setFontSize(12);
        pdf.setFont('Helvetica', 'bold');
        pdf.text('JOB DETAILS', margin, yPosition);
        yPosition += 8;
        pdf.setFont('Helvetica', 'normal');

        const jobDetails = [
          ['Job No.', jobData?.jobNo || jobData?.jobId || '-'],
          ['Client Name', jobData?.clientName || '-'],
          ['Entry Date', jobData?.entryDate || '-'],
          ['Make', jobData?.make || '-'],
          ['Model No.', jobData?.modelNo || '-'],
          ['Serial No.', jobData?.serialNo || '-']
        ];

        jobDetails.forEach(([label, value]) => {
          pdf.setFontSize(10);
          pdf.text(`${label.padEnd(15)}: ${String(value)}`, margin + 2, yPosition);
          yPosition += 6;
        });

        yPosition += 8;

        // Divider line
        pdf.setDrawColor(50, 50, 50);
        pdf.line(margin, yPosition, pdf.internal.pageSize.getWidth() - margin, yPosition);
        yPosition += 10;

        // ===== REPORT SECTIONS =====
        const sections = [
          {
            title: 'INSPECTION REPORT',
            template: inspectionTemplate,
            reportKey: 'inspection_report'
          },
          {
            title: 'SERVICE REPORT',
            template: serviceTemplate,
            reportKey: 'service_report'
          },
          {
            title: 'TESTING REPORT',
            template: testingTemplate,
            reportKey: 'testing_report'
          },
          {
            title: 'WARRANTY REPORT',
            template: warrantyTemplate,
            reportKey: 'warranty_report'
          }
        ];

        sections.forEach(section => {
          if (yPosition > pageHeight - 60) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFontSize(12);
          pdf.setFont('Helvetica', 'bold');
          pdf.text(section.title, margin, yPosition);
          yPosition += 10;

          const content = reports[section.reportKey]
            ? section.template + '\n\nAdditional Remarks:\n' + reports[section.reportKey]
            : section.template;

          addWrappedText(content, 10, false);
          yPosition += 10;
        });

        // ===== DECLARATION =====
        if (yPosition > pageHeight - 40) {
          pdf.addPage();
          yPosition = 20;
        }

        pdf.setFontSize(12);
        pdf.setFont('Helvetica', 'bold');
        pdf.text('DECLARATION', margin, yPosition);
        yPosition += 8;

        const declaration = `The above-mentioned equipment has been inspected, repaired, and tested as per standard service practices and is found to be in satisfactory working condition at the time of dispatch.`;
        addWrappedText(declaration, 10.5, false);

        yPosition += 15;

        // ===== FOOTER =====
        pdf.setFontSize(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.text('For DAS TECHNO SERVICES', margin, yPosition);
        yPosition += 10;

        pdf.setFont('Helvetica', 'normal');
        pdf.text('Authorized Signatory', margin, yPosition);
        yPosition += 12;

        pdf.setFontSize(9);
        pdf.text('Contact: +91 8401534497 / 8320534497', margin, yPosition);
        yPosition += 4;
        pdf.text('Email: dts@dastechnoservices.com', margin, yPosition);
        yPosition += 4;
        pdf.text('Shivri, Maharashtra', margin, yPosition);

        // Add timestamp
        yPosition += 10;
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        const timestamp = new Date().toLocaleString();
        pdf.text(
          `Generated: ${timestamp} ${isPreviewMode ? '(PREVIEW)' : ''}`,
          margin,
          pageHeight - 10,
          { align: 'center' }
        );

        resolve(pdf);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
        resolve(null);
      }
    });
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDFContent(true);
      if (pdf) {
        // Create blob and object URL for better PDF rendering
        const blob = pdf.output('blob');
        const url = URL.createObjectURL(blob);
        setShowPreview(url);
      }
    } catch (error) {
      console.error('Preview error:', error);
      alert('Error generating preview.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const pdf = await generatePDFContent(false);
      if (pdf) {
        pdf.save(`Job_${jobData?.jobNo || jobData?.jobId}.pdf`);
        
        // Call parent callback to update status
        if (onGeneratePDF) {
          onGeneratePDF(reports);
        }

        alert('PDF generated and downloaded successfully!');
        setShowPreview(false);
        onClose();
      }
    } catch (error) {
      console.error('Generate error:', error);
      alert('Error generating PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (showPreview) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ 
          maxWidth: '95vw', 
          maxHeight: '95vh',
          width: '1000px',
          display: 'flex',
          flexDirection: 'column',
          padding: 0
        }}>
          <div className="modal-header" style={{ borderBottom: '2px solid #ecf0f1', padding: '15px 30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <h2 style={{ margin: 0 }}>📄 PDF Preview - Complete Report</h2>
              <button className="modal-close" onClick={() => setShowPreview(false)}>✕</button>
            </div>
          </div>

          <div style={{ 
            flex: 1, 
            overflow: 'auto',
            padding: '20px',
            background: '#f5f5f5'
          }}>
            <embed
              src={showPreview}
              type="application/pdf"
              style={{
                width: '100%',
                minHeight: '1400px',
                height: 'auto',
                border: 'none',
                borderRadius: '6px'
              }}
              title="PDF Preview"
            />
          </div>

          <div className="form-buttons" style={{ 
            marginTop: 0,
            padding: '20px 30px',
            borderTop: '2px solid #ecf0f1',
            background: 'white',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}>
            <button
              className="btn btn-success"
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{ minWidth: '150px' }}
            >
              {isGenerating ? '⏳ Generating...' : '✅ Generate & Download'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                // Clean up the blob URL when closing
                if (showPreview) {
                  URL.revokeObjectURL(showPreview);
                }
                setShowPreview(false);
              }}
              disabled={isGenerating}
              style={{ minWidth: '120px' }}
            >
              ← Back to Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '95vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2>📋 VFD Service Report</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ marginBottom: '20px', background: '#f0f8ff', padding: '12px', borderRadius: '6px', borderLeft: '4px solid #3498db' }}>
          <strong>📌 Job Details (Client Information):</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#555' }}>
            Job No: {jobData?.jobNo || jobData?.jobId} | Client: {jobData?.clientName} | Serial: {jobData?.serialNo}
          </p>
        </div>

        <form>
          {/* INSPECTION REPORT */}
          <div className="form-group">
            <label><strong>🔍 INSPECTION REPORT</strong></label>
            <textarea
              value={reports.inspection_report}
              onChange={(e) => handleReportChange(e, 'inspection_report')}
              placeholder="Enter additional inspection remarks..."
              style={{ minHeight: '100px' }}
            />
            <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
              Template will be combined with your remarks
            </small>
          </div>

          {/* SERVICE REPORT */}
          <div className="form-group">
            <label><strong>🔧 SERVICE REPORT</strong></label>
            <textarea
              value={reports.service_report}
              onChange={(e) => handleReportChange(e, 'service_report')}
              placeholder="Enter additional service details..."
              style={{ minHeight: '100px' }}
            />
            <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
              Template will be combined with your remarks
            </small>
          </div>

          {/* TESTING REPORT */}
          <div className="form-group">
            <label><strong>✅ TESTING REPORT</strong></label>
            <textarea
              value={reports.testing_report}
              onChange={(e) => handleReportChange(e, 'testing_report')}
              placeholder="Enter additional testing observations..."
              style={{ minHeight: '100px' }}
            />
            <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
              Template will be combined with your remarks
            </small>
          </div>

          {/* WARRANTY REPORT */}
          <div className="form-group">
            <label><strong>⚖️ WARRANTY REPORT</strong></label>
            <textarea
              value={reports.warranty_report}
              onChange={(e) => handleReportChange(e, 'warranty_report')}
              placeholder="Enter additional warranty details..."
              style={{ minHeight: '100px' }}
            />
            <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
              Template will be combined with your remarks
            </small>
          </div>

          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #27ae60' }}>
            <strong style={{ color: '#27ae60' }}>✓ Status Update:</strong>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
              After generating PDF, job status will be updated to <strong>Complete</strong>
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#2e7d32' }}>
              Dispatch date will be auto-filled: <strong>{new Date().toISOString().split('T')[0]}</strong>
            </p>
          </div>

          <div className="form-buttons">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handlePreview}
              disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.6 : 1 }}
            >
              {isGenerating ? '⏳ Generating Preview...' : '👁️ Preview Report'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleGenerate}
              disabled={isGenerating}
              style={{ opacity: isGenerating ? 0.6 : 1 }}
            >
              {isGenerating ? '⏳ Generating...' : '📥 Generate & Download'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isGenerating}
            >
              ✕ Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PDFGeneratorModal;

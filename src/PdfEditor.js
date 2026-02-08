const express = require("express");
const PDFDocument = require("pdfkit");
const db = require("../db/database");

const router = express.Router();

/**
 * COMMON PDF GENERATOR
 */
function generatePDF(res, job, reports, mode = "preview") {
  const doc = new PDFDocument({ size: "A4", margin: 40 });

  // Correct headers
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    mode === "preview"
      ? `inline; filename=Job_${job.job_no}_PREVIEW.pdf`
      : `attachment; filename=Job_${job.job_no}.pdf`
  );

  doc.pipe(res);

  const today = new Date().toLocaleDateString();

  // ---------------- DEFAULT PROFESSIONAL TEMPLATES ----------------
  const defaultReports = {
    inspection_report:
      "Drive disassembled, cleaned, and inspected for any visible damage. Any abnormality noted is recorded above.",
    service_report:
      "All parts were serviced according to standard procedures. Drive reassembled and prepared for testing.",
    testing_report: `Drive tested on standard load trial. All parameters within manufacturer specification. Test successfully completed on ${today}.`,
    warranty_report: `Warranty valid from ${job.warranty_start || "[START DATE]"} to ${job.warranty_end || "[END DATE]"} as per company policy. Terms and conditions apply.`,
  };

  // Merge user input with defaults
  const finalReports = {
    inspection_report: reports.inspection_report || defaultReports.inspection_report,
    service_report: reports.service_report || defaultReports.service_report,
    testing_report: reports.testing_report || defaultReports.testing_report,
    warranty_report: reports.warranty_report || defaultReports.warranty_report,
  };

  // ---------------- HEADER ----------------
  doc.fontSize(18).text("DAS TECHNO SERVICES", { align: "center", underline: true }).moveDown(0.3);
  doc.fontSize(12).text("ABB VFD INSPECTION & SERVICE REPORT", { align: "center" }).moveDown(1.5);

  // ---------------- JOB DETAILS ----------------
  doc.fontSize(10)
    .text(`Job No       : ${job.job_no}`)
    .text(`Client Name  : ${job.client_name}`)
    .text(`Entry Date   : ${job.entry_date}`)
    .text(`Make         : ${job.make}`)
    .text(`Model No     : ${job.model_no}`)
    .text(`Serial No    : ${job.serial_no}`)
    .text(`Fault        : ${job.fault}`)
    .moveDown(1.2);

  // ---------------- INSPECTION ----------------
  doc.fontSize(13).text("INSPECTION REPORT", { underline: true }).moveDown(0.4)
    .fontSize(11).text(finalReports.inspection_report).moveDown(1);

  // ---------------- SERVICE ----------------
  doc.fontSize(13).text("SERVICE REPORT", { underline: true }).moveDown(0.4)
    .fontSize(11).text(finalReports.service_report).moveDown(1);

  // ---------------- TESTING ----------------
  doc.fontSize(13).text("TESTING REPORT", { underline: true }).moveDown(0.4)
    .fontSize(11).text(finalReports.testing_report).moveDown(1);

  // ---------------- WARRANTY ----------------
  doc.fontSize(13).text("WARRANTY REPORT", { underline: true }).moveDown(0.4)
    .fontSize(11).text(finalReports.warranty_report).moveDown(2);

  // ---------------- FOOTER ----------------
  doc.fontSize(9).text("This is a system-generated service report.", { align: "center" })
    .moveDown(0.2).text("DAS TECHNO SERVICES", { align: "center" });

  doc.end();
}

/**
 * PREVIEW PDF (NO DB SAVE)
 */
router.post("/preview/:id", (req, res) => {
  const jobId = req.params.id;
  const reports = req.body;

  db.get("SELECT * FROM jobs WHERE id=?", [jobId], (err, job) => {
    if (err || !job) {
      return res.status(404).json({ error: "Job not found" });
    }
    generatePDF(res, job, reports, "preview");
  });
});

/**
 * FINAL PDF (SAVE + DOWNLOAD)
 */
router.post("/generate/:id", (req, res) => {
  const jobId = req.params.id;
  const reports = req.body;

  db.run(
    `
    UPDATE jobs SET
      inspection_report=?,
      service_report=?,
      testing_report=?,
      warranty_report=?,
      job_status='COMPLETED'
    WHERE id=?
  `,
    [
      reports.inspection_report,
      reports.service_report,
      reports.testing_report,
      reports.warranty_report,
      jobId,
    ],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      db.get("SELECT * FROM jobs WHERE id=?", [jobId], (err, job) => {
        if (err || !job) {
          return res.status(404).json({ error: "Job not found" });
        }
        generatePDF(res, job, reports, "generate");
      });
    }
  );
});

module.exports = router;

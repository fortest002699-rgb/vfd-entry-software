const express = require("express");
const db = require("../db/database");

const router = express.Router();

/* =========================
   CREATE JOB
   ========================= */
router.post("/", (req, res) => {
  const j = req.body;

  db.run(
    `
    INSERT INTO jobs (
      entry_date, job_no, make, model_no, serial_no, fault, client_name,
      input_choke, output_choke, choke, control_card, control_card_supply, fan, power_card,
      checked_by, repaired_by, repair_date, final_remarks, warranty_start, warranty_end,
      job_status, created_at
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
    [
      j.entry_date || "",
      j.job_no || "",
      j.make || "",
      j.model_no || "",
      j.serial_no || "",
      j.fault || "",
      j.client_name || "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      "JOB RECEIVED",
      new Date().toISOString(),
    ],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

/* =========================
   GET ALL
   ========================= */
router.get("/", (req, res) => {
  db.all("SELECT * FROM jobs ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

/* =========================
   GET SINGLE JOB
   ========================= */
router.get("/:id", (req, res) => {
  db.get("SELECT * FROM jobs WHERE id=?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Job not found" });
    res.json(row);
  });
});

/* =========================
   TECH UPDATE (FIXED)
   ========================= */
router.put("/:id", (req, res) => {
  const map = {
    input_status: "input_choke",
    output_status: "output_choke",
    choke: "choke",
    control_card: "control_card",
    control_card_supply: "control_card_supply",
    fan: "fan",
    power_card_condition: "power_card",
    remarks: "final_remarks",
    checked_by: "checked_by",
    repaired_by: "repaired_by",
    repairing_date: "repair_date",
    warranty_start: "warranty_start",
    warranty_end: "warranty_end",
    job_status: "job_status",
  };

  const fields = [];
  const values = [];

  Object.entries(map).forEach(([from, to]) => {
    if (req.body[from] !== undefined) {
      fields.push(`${to}=?`);
      values.push(req.body[from]);
    }
  });

  if (!fields.length) {
    return res.status(400).json({ error: "No valid technician fields" });
  }

  values.push(req.params.id);

  db.run(
    `UPDATE jobs SET ${fields.join(", ")} WHERE id=?`,
    values,
    function (err) {
      if (err) {
        console.error("❌ UPDATE ERROR:", err.message);
        console.error("❌ SQL:", `UPDATE jobs SET ${fields.join(", ")} WHERE id=?`);
        console.error("❌ VALUES:", values);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

module.exports = router;

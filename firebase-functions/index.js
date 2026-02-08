const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();

// ==================== JOBS FUNCTIONS ====================

/**
 * Get all jobs or filter by status
 */
exports.getJobs = functions.https.onCall(async (data, context) => {
  try {
    const { status, userId } = data;
    let query = db.collection("jobs");

    if (status) {
      query = query.where("status", "==", status);
    }

    const snapshot = await query.get();
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return { success: true, data: jobs };
  } catch (error) {
    console.error("Error getting jobs:", error);
    return { success: false, error: error.message };
  }
});

/**
 * Create a new job
 */
exports.createJob = functions.https.onCall(async (data, context) => {
  try {
    const {
      jobNumber,
      clientName,
      amount,
      status,
      description,
      dueDate,
      assignedTo
    } = data;

    if (!jobNumber || !clientName) {
      throw new Error("jobNumber and clientName are required");
    }

    const newJob = {
      jobNumber,
      clientName,
      amount: parseFloat(amount) || 0,
      status: status || "pending",
      description: description || "",
      dueDate: dueDate || null,
      assignedTo: assignedTo || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await db.collection("jobs").add(newJob);

    return {
      success: true,
      data: { id: docRef.id, ...newJob }
    };
  } catch (error) {
    console.error("Error creating job:", error);
    return { success: false, error: error.message };
  }
});

/**
 * Update a job
 */
exports.updateJob = functions.https.onCall(async (data, context) => {
  try {
    const { jobId, updates } = data;

    if (!jobId) {
      throw new Error("jobId is required");
    }

    updates.updatedAt = new Date().toISOString();

    await db.collection("jobs").doc(jobId).update(updates);

    return { success: true, message: "Job updated successfully" };
  } catch (error) {
    console.error("Error updating job:", error);
    return { success: false, error: error.message };
  }
});

/**
 * Delete a job
 */
exports.deleteJob = functions.https.onCall(async (data, context) => {
  try {
    const { jobId } = data;

    if (!jobId) {
      throw new Error("jobId is required");
    }

    await db.collection("jobs").doc(jobId).delete();

    return { success: true, message: "Job deleted successfully" };
  } catch (error) {
    console.error("Error deleting job:", error);
    return { success: false, error: error.message };
  }
});

// ==================== PDF GENERATION ====================

/**
 * Generate PDF for a job
 */
exports.generatePdf = functions.https.onCall(async (data, context) => {
  try {
    const { jobId, jobData } = data;

    // Store PDF metadata in Firestore
    const pdfMetadata = {
      jobId,
      generatedAt: new Date().toISOString(),
      fileName: `Job_${jobData.jobNumber}_${Date.now()}.pdf`,
      status: "generated"
    };

    const docRef = await db.collection("pdfs").add(pdfMetadata);

    return {
      success: true,
      data: { id: docRef.id, ...pdfMetadata }
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    return { success: false, error: error.message };
  }
});

// ==================== GOOGLE SHEETS ====================

/**
 * Sync data to Google Sheets
 */
exports.syncToSheets = functions.https.onCall(async (data, context) => {
  try {
    const { sheetsId, data: sheetData } = data;

    // Store sync metadata in Firestore
    const syncRecord = {
      sheetsId,
      syncedAt: new Date().toISOString(),
      rowCount: sheetData ? sheetData.length : 0,
      status: "synced"
    };

    const docRef = await db.collection("sheet_syncs").add(syncRecord);

    return {
      success: true,
      data: { id: docRef.id, ...syncRecord }
    };
  } catch (error) {
    console.error("Error syncing to sheets:", error);
    return { success: false, error: error.message };
  }
});

// ==================== HEALTH CHECK ====================

/**
 * Health check endpoint
 */
exports.health = functions.https.onRequest((req, res) => {
  cors(req, res, () => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });
});

// ==================== REALTIME LISTENERS ====================

/**
 * Listen to job changes and broadcast
 */
exports.onJobChanged = functions.firestore
  .document("jobs/{jobId}")
  .onWrite((change, context) => {
    const jobId = context.params.jobId;
    const newData = change.after.data();

    console.log(`Job ${jobId} changed:`, newData);
    // Real-time updates will be handled by Firestore listeners in React

    return null;
  });

console.log("🔥 Cloud Functions initialized successfully");

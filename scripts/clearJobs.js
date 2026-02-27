// Node script to delete all documents in the 'jobs' Firestore collection
// Usage: node scripts/clearJobs.js

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize default app, assumes FIREBASE_CONFIG or GOOGLE_APPLICATION_CREDENTIALS env var
initializeApp({
  credential: applicationDefault(),
});

const db = getFirestore();

async function clearJobs() {
  const snapshot = await db.collection('jobs').get();
  const batch = db.batch();
  snapshot.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
  console.log(`Deleted ${snapshot.size} documents from jobs collection.`);
}

clearJobs().catch(err => {
  console.error('Error clearing jobs:', err);
  process.exit(1);
});
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyDxgx4FOCv6WBTIvpK86ylQXB3doAKPrN8",
  authDomain: "dts-service-577a4.firebaseapp.com",
  projectId: "dts-service-577a4",
  storageBucket: "dts-service-577a4.firebasestorage.app",
  messagingSenderId: "367512934757",
  appId: "1:367512934757:web:3972d586dfe1671c27a98c",
  measurementId: "G-ST5YH955QK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const functions = getFunctions(app);

// Helper functions for API calls
export const callFunction = async (functionName, data) => {
  try {
    const fn = httpsCallable(functions, functionName);
    const result = await fn(data);
    return result.data;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
};

export default app;

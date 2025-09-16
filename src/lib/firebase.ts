import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  initializeAuth, 
  indexedDBLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  enableIndexedDbPersistence 
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check for missing environment variables
const missingVars = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// --- ⬇️ PERSISTENCE ADDITIONS START HERE ⬇️ ---

// 1. Initialize Auth with IndexedDB persistence
// This keeps the user signed in across browser sessions.
export const auth = initializeAuth(app, {
  persistence: indexedDBLocalPersistence
});

// 2. Initialize and enable Firestore with IndexedDB persistence
// This caches Firestore data for offline access.
export const db = getFirestore(app);
try {
  enableIndexedDbPersistence(db)
    .then(() => console.log("Firestore persistence enabled."))
    .catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn("Firestore persistence failed: can only be enabled in one tab at a time.");
      } else if (err.code === 'unimplemented') {
        console.log("Firestore persistence is not available in this browser.");
      }
    });
} catch (error) {
  console.error("Error enabling Firestore persistence:", error);
}

// --- ⬆️ PERSISTENCE ADDITIONS END HERE ⬆️ ---

// Initialize other Firebase services
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
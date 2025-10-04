import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider
} from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import admin from 'firebase-admin';

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

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

/**
 * Enables Firestore offline persistence.
 * This function should only be called on the client side.
 */
export const enablePersistence = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log("Firestore persistence enabled successfully.");
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence failed: Multiple tabs open. Persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.error('Firestore persistence failed: The current browser does not support all of the features required.');
    } else {
      console.error('An error occurred while enabling Firestore persistence:', error);
    }
  }
};

// Initialize other Firebase services
export const storage = getStorage(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Initialize Firebase Admin SDK
let adminApp: admin.app.App;
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Use service account key from environment variable (JSON string)
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    adminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: firebaseConfig.projectId,
    });
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Use individual environment variables
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    // Use default credentials (for Google Cloud environments)
    adminApp = admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
  }
} else {
  adminApp = admin.app();
}

// Initialize Admin Firestore
export const adminDb = admin.firestore(adminApp);

export default app;
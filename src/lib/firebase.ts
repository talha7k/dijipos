import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
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
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Firebase: Missing environment variables:', missingVars);
  throw new Error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
}

console.log('Firebase: All environment variables present');

// Initialize Firebase
console.log('Firebase: Initializing app with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});
const app = initializeApp(firebaseConfig);
console.log('Firebase: App initialized successfully');

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
console.log('Firebase: Services initialized - auth:', !!auth, 'db:', !!db, 'storage:', !!storage);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;
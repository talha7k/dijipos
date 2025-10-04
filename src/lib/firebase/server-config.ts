import admin from 'firebase-admin';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

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

export default adminApp;
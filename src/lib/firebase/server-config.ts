import admin from 'firebase-admin';

const firebaseConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase Admin SDK
let adminApp: admin.app.App;
if (!admin.apps.length) {
  console.log('Initializing Firebase Admin SDK...');
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  console.log('FIREBASE_SERVICE_ACCOUNT_EMAIL exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL);
  console.log('FIREBASE_PRIVATE_KEY exists:', !!process.env.FIREBASE_PRIVATE_KEY);

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      console.log('Using service account key from environment variable');
      // Use service account key from environment variable (JSON string)
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      console.log('Service account parsed successfully, project_id:', serviceAccount.project_id);
      adminApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: firebaseConfig.projectId,
      });
      console.log('Firebase Admin SDK initialized with service account key');
    } catch (error) {
      console.error('Error parsing service account key:', error);
      throw error;
    }
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    console.log('Using individual environment variables');
    // Use individual environment variables
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseConfig.projectId,
        clientEmail: process.env.FIREBASE_SERVICE_ACCOUNT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log('Firebase Admin SDK initialized with individual variables');
  } else {
    console.log('No service account credentials found, falling back to default credentials');
    // Use default credentials (for Google Cloud environments)
    adminApp = admin.initializeApp({
      projectId: firebaseConfig.projectId,
    });
    console.log('Firebase Admin SDK initialized with default credentials');
  }
} else {
  adminApp = admin.app();
  console.log('Firebase Admin SDK already initialized');
}

// Initialize Admin Firestore
export const adminDb = admin.firestore(adminApp);

export default adminApp;
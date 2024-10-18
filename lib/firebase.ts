import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOH9nqX9dZWVYqiMYyDfV-zcFKGPFgWMQ",
  authDomain: "dijipos-efce6.firebaseapp.com",
  projectId: "dijipos-efce6",
  storageBucket: "dijipos-efce6.appspot.com",
  messagingSenderId: "2654101329",
  appId: "1:2654101329:web:f1358b51c64aa0573d3d70",
  measurementId: "G-GJ4BMXWYW0"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
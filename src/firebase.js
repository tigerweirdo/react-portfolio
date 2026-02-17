import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCEnUhLvqbZTFfLFhsDUUORyWbYFHG0V18",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "portfolio-b0e27.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "portfolio-b0e27",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "gs://portfolio-b0e27.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "247723789432",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:247723789432:web:59e198796f96dee415f18d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
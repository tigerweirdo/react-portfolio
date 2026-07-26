import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

// NOT: firebase/auth ve firebase/storage yalnızca admin tarafında kullanılıyor.
// Public bundle'a girmemeleri için ayrı modüllerdeler (./firebase-auth,
// ./firebase-storage). Burada import ETMİYORUZ.
//
// Buradaki değerler Firebase'in "web app config"idir; tasarımı gereği
// istemciye açıktır ve gizli anahtar değildir. Asıl koruma firestore.rules
// ve storage.rules dosyalarındadır.
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCEnUhLvqbZTFfLFhsDUUORyWbYFHG0V18",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "portfolio-b0e27.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "portfolio-b0e27",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "portfolio-b0e27.appspot.com",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "247723789432",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:247723789432:web:59e198796f96dee415f18d"
};

let app = null;
let db = null;
let firebaseEnabled = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  firebaseEnabled = true;
} catch (error) {
  console.warn("[Firebase] Başlatılamadı, site Firebase'siz çalışacak:", error.message);
  app = null;
  db = null;
  firebaseEnabled = false;
}

export { app, db, firebaseEnabled };

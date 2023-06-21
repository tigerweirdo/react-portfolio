
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCEnUhLvqbZTFfLFhsDUUORyWbYFHG0V18",
  authDomain: "portfolio-b0e27.firebaseapp.com",
  projectId: "portfolio-b0e27",
  storageBucket: "gs://portfolio-b0e27.appspot.com",
  messagingSenderId: "247723789432",
  appId: "1:247723789432:web:59e198796f96dee415f18d"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);


export const signInWithGoogle = () => signInWithPopup(auth, provider);
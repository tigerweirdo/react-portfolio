import { getStorage } from 'firebase/storage';
import { app, firebaseEnabled } from './firebase';

// firebase/storage SDK'sını yalnızca bu modülü import eden (admin) chunk'lar yükler.
// Böylece public Portfolio chunk'ı gereksiz Storage SDK'sını taşımaz.
let storage = null;

if (firebaseEnabled && app) {
  try {
    storage = getStorage(app);
  } catch (error) {
    console.warn('[Firebase] Storage init failed:', error.message);
    storage = null;
  }
}

export { storage };

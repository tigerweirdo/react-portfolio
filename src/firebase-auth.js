import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { app, firebaseEnabled } from './firebase';

// firebase/auth SDK'sını yalnızca bu modülü import eden (admin) chunk'lar yükler.
// Public sayfa artık hiç oturum açmıyor: portfolyo verisi kurallar gereği
// herkese açık okunabilir.
let auth = null;

if (firebaseEnabled && app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.warn('[Firebase] Auth başlatılamadı:', error.message);
    auth = null;
  }
}

export { auth };

/** Admin oturum durumunu dinler. Aboneliği iptal eden fonksiyonu döndürür. */
export const subscribeToAuth = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
};

export const signInAdmin = (email, password) => {
  if (!auth) {
    return Promise.reject(new Error('auth/unavailable'));
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutAdmin = () => (auth ? signOut(auth) : Promise.resolve());

/**
 * Yazma işlemlerinden önce çağrılır. Eskiden burada anonim giriş yapılıyordu;
 * bu, siteye giren herkese Firestore yazma yetkisi veriyordu. Artık yalnızca
 * gerçek admin oturumu kabul ediliyor.
 */
export const requireAdmin = () => {
  if (!auth?.currentUser) {
    throw new Error('Bu işlem için admin oturumu gerekiyor.');
  }
  return auth.currentUser;
};

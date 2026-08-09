import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  indexedDBLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

if (!isFirebaseConfigured) {
  console.warn(
    "Firebase is not configured. Add the VITE_FIREBASE_* values to client/.env.local if you wish to use Firebase features."
  );
}

export const firebaseApp = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

let firebaseAnalytics = null;
if (typeof window !== "undefined" && firebaseApp) {
  try {
    firebaseAnalytics = getAnalytics(firebaseApp);
  } catch {
    firebaseAnalytics = null;
  }
}

export { firebaseAnalytics };

export const firebaseAuth = firebaseApp ? getAuth(firebaseApp) : null;
let firebaseAuthReadyResolve;
const firebaseAuthReady = new Promise((resolve) => {
  firebaseAuthReadyResolve = resolve;
});

const initializeFirebaseAuth = async () => {
  if (!firebaseAuth) {
    firebaseAuthReadyResolve?.(null);
    return;
  }
  await setPersistence(firebaseAuth, indexedDBLocalPersistence);
  onAuthStateChanged(firebaseAuth, () => {
    firebaseAuthReadyResolve?.(firebaseAuth.currentUser);
    firebaseAuthReadyResolve = null;
  });
};

void initializeFirebaseAuth();

export const waitForFirebaseAuth = () => firebaseAuthReady;

export const getFirebaseIdToken = async () => {
  await waitForFirebaseAuth();
  return firebaseAuth?.currentUser ? firebaseAuth.currentUser.getIdToken() : "";
};

export { signInWithEmailAndPassword, signOut };

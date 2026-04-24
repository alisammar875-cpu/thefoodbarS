import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDmiGtND8DDnQT1ml0iqwW_0VaNJfP5aq4",
  authDomain: "thefoodbar-d7ffd.firebaseapp.com",
  projectId: "thefoodbar-d7ffd",
  storageBucket: "thefoodbar-d7ffd.firebasestorage.app",
  messagingSenderId: "510471626",
  appId: "1:510471626:web:aadd97e8641cb5659df333",
  measurementId: "G-7JQB9NF5Q0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const auth = getAuth(app);
export const db = getFirestore(app);

export { analytics };
export default app;

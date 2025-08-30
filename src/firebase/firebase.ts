/**
 * Firebase web client initialization.
 * Safe to commit: this contains only public web config (NOT secrets).
 * Fill the placeholders with your project's values from Firebase console.
 */
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '<YOUR_API_KEY>',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '<YOUR_PROJECT>.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '<YOUR_PROJECT_ID>',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '<YOUR_PROJECT>.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '<SENDER_ID>',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '<APP_ID>',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app

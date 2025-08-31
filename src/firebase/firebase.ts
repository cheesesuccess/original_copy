/**
 * Firebase web client initialization.
 * Safe to commit: this contains only public web config (NOT secrets).
 * Fill the placeholders with your project's values from Firebase console.
 */
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyC63LVrCNZ2mk8t3jbqvpbDDErdXasu0Nc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'myfirst-4103c.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'myfirst-4103c',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'myfirst-4103c.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '630575055900',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:630575055900:web:85a0470b7b15dcf1174bd9',
}

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
export const auth = getAuth(app)
export default app

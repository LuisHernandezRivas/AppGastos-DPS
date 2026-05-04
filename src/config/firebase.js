import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBeye5EYTzGk4b232tIcE5Ny7Axf4wpbE",
  authDomain: "appgastos-dps.firebaseapp.com",
  projectId: "appgastos-dps",
  storageBucket: "appgastos-dps.firebasestorage.app",
  messagingSenderId: "225988814905",
  appId: "1:225988814905:web:6a46a4ee4af9cdcb495fe8",
  measurementId: "G-4D3QTJSD61"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
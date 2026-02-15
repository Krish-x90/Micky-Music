import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCoOd0M9r2gYEFBVSv5FJkBCMlCURP4FEM",
  authDomain: "micky-music.firebaseapp.com",
  projectId: "micky-music",
  storageBucket: "micky-music.firebasestorage.app",
  messagingSenderId: "299907693249",
  appId: "1:299907693249:web:3caa47d4a37c9fa8e57240"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
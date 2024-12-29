import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyDdnLFIn9MUvdUwR42NpyRnJ1UH0GL_WwM",
    authDomain: "notion-clone-project-2ce93.firebaseapp.com",
    projectId: "notion-clone-project-2ce93",
    storageBucket: "notion-clone-project-2ce93.firebasestorage.app",
    messagingSenderId: "180357364112",
    appId: "1:180357364112:web:8a23976f2ed77c46e09b15",
    measurementId: "G-K7X7FTCLYQ"
  };
  
  // Initialize Firebase
 const app = getApps().length ===0 ? initializeApp(firebaseConfig) : getApp();
 const db = getFirestore(app);

 export {db};
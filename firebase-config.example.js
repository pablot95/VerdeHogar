// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
// ⚠️ INSTRUCCIONES:
// 1. Copia este archivo y renómbralo a "firebase-config.js"
// 2. Rellena los valores reales desde Firebase Console
// 3. Este archivo NO se subirá a GitHub (está en .gitignore)
//
// 📍 Obtener credenciales:
// https://console.firebase.google.com/project/TU-PROYECTO/settings/general
//
const firebaseConfig = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export for use in other files
export { db, collection, addDoc, serverTimestamp };

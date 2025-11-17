// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB8RmLCZkzPDNTy5R9FjPEwIt0KBv3emxA",
  authDomain: "hogarverde-489e9.firebaseapp.com",
  projectId: "hogarverde-489e9",
  storageBucket: "hogarverde-489e9.firebasestorage.app",
  messagingSenderId: "624499647908",
  appId: "1:624499647908:web:88d9699f38c60bd7080d31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export for use in other files
export { db, collection, addDoc, serverTimestamp };

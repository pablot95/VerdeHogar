// Firebase initialization - Shared across all pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, doc, updateDoc, increment, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-functions.js";

const firebaseConfig = {
  apiKey: "AIzaSyB8RmLCZkzPDNTy5R9FjPEwIt0KBv3emxA",
  authDomain: "hogarverde-489e9.firebaseapp.com",
  projectId: "hogarverde-489e9",
  storageBucket: "hogarverde-489e9.appspot.com",
  messagingSenderId: "624499647908",
  appId: "1:624499647908:web:88d9699f38c60bd7080d31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const functions = getFunctions(app);

// Export to global scope for compatibility with existing code
window.firebaseDB = db;
window.firebaseCollection = collection;
window.firebaseAddDoc = addDoc;
window.firebaseServerTimestamp = serverTimestamp;
window.firebaseGetDocs = getDocs;
window.firebaseDoc = doc;
window.firebaseUpdateDoc = updateDoc;
window.firebaseIncrement = increment;
window.firebaseQuery = query;
window.firebaseWhere = where;
window.firebaseApp = app;
window.firebaseFunctions = functions;
window.firebaseHttpsCallable = httpsCallable;

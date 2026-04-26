// ============================================
// FIREBASE CONFIGURATION
// Initialize Firebase with your project credentials
// Replace these values with your Firebase project details
// ============================================

// Firebase configuration object
// Get these values from your Firebase Console:
// Project Settings > Your apps > Web app config


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyADtiJf0hgmqGgvHPOTp3KnSE1CQPpdXyA",
  authDomain: "dolf-81f73.firebaseapp.com",
  projectId: "dolf-81f73",
  storageBucket: "dolf-81f73.firebasestorage.app",
  messagingSenderId: "610405379750",
  appId: "1:610405379750:web:cefbf5171c8eacd15cce67",
  measurementId: "G-B2FGGGRKTH"
};
// Initialize Firebase
// Note: This assumes Firebase SDK is loaded via CDN in HTML
let app;
let auth;
let database;

try {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    database = firebase.database();
} catch (error) {
    console.error("Error initializing Firebase:", error);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { app, auth, database, firebaseConfig };
}
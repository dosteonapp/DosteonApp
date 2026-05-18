// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCr_mAolxcPuqcAM4wjPKP8vfc_8GWgrbE",
    authDomain: "dosteon-370c0.firebaseapp.com",
    projectId: "dosteon-370c0",
    storageBucket: "dosteon-370c0.firebasestorage.app",
    messagingSenderId: "491857386625",
    appId: "1:491857386625:web:29b283fbd1063ad8ae8180",
    measurementId: "G-D0R44VF124"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

// Analytics is only available in the browser
let analytics = null;
if (typeof window !== "undefined") {
    isSupported().then((supported) => {
        if (supported) {
            analytics = getAnalytics(app);
        }
    });
}

export { app, auth, analytics };
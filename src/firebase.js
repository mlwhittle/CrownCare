import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyD2BTZNtKWFsmqnOTTvbd3Dfsj2GorWN-s",
    authDomain: "crowncare-116e4.firebaseapp.com",
    projectId: "crowncare-116e4",
    storageBucket: "crowncare-116e4.firebasestorage.app",
    messagingSenderId: "368231456323",
    appId: "1:368231456323:web:4b428e19de81766fb23ef6",
    measurementId: "G-ZGR9CSDH9H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, analytics, db, auth };

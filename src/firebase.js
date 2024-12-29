// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDAdD3B31mEkQkb79KcBbn3ckldSHyvLeI",
    authDomain: "codes-30d72.firebaseapp.com",
    projectId: "codes-30d72",
    storageBucket: "codes-30d72.firebasestorage.app",
    messagingSenderId: "106982165210",
    appId: "1:106982165210:web:55ee039a35c365496d73e3",
    measurementId: "G-9F7LJCRYR4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

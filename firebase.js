// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmBP4kVbbjM4q_Yec5s9NFd-T-7O1yvso",
    authDomain: "hspantryapp-9188a.firebaseapp.com",
    projectId: "hspantryapp-9188a",
    storageBucket: "hspantryapp-9188a.appspot.com",
    messagingSenderId: "159465706602",
    appId: "1:159465706602:web:77af1d25f83b897b432613"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { app, firestore }
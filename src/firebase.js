import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDEQUi1wP0HjD9pK69o6y-c5Z6Rg9WFFzU",
    authDomain: "cashflow-f56c9.firebaseapp.com",
    projectId: "cashflow-f56c9",
    storageBucket: "cashflow-f56c9.firebasestorage.app",
    messagingSenderId: "540267620485",
    appId: "1:540267620485:web:3da6549a10e24170c6e1ec",
    measurementId: "G-ZTQ26517BB"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

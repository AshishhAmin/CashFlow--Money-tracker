import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    deleteUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function signup(email, password, name) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user document in Firestore
        await setDoc(doc(db, "users", result.user.uid), {
            profile: {
                name: name,
                email: email,
                bio: 'Financial Enthusiast',
                phone: ''
            },
            preferences: {
                currency: { code: 'INR', symbol: '₹' },
                theme: { id: 'green', name: 'Neon Green', rgb: '46 204 113' },
                notifications: { push: true, transactions: true }
            },
            security: { appLock: false }
        });

        await updateProfile(result.user, { displayName: name });
        return result;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    async function googleSignIn() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        // Check if user doc exists, if not create it
        const docRef = doc(db, "users", result.user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(docRef, {
                profile: {
                    name: result.user.displayName,
                    email: result.user.email,
                    photoURL: result.user.photoURL,
                    bio: 'Financial Enthusiast',
                    phone: ''
                },
                preferences: {
                    currency: { code: 'INR', symbol: '₹' },
                    theme: { id: 'green', name: 'Neon Green', rgb: '46 204 113' },
                    notifications: { push: true, transactions: true }
                },
                security: { appLock: false }
            });
        } else {
            // Document exists - check if we need to sync Google Photo
            // Force update photoURL from Google if it exists
            if (result.user.photoURL) {
                await setDoc(docRef, {
                    profile: {
                        ...docSnap.data().profile,
                        photoURL: result.user.photoURL
                    }
                }, { merge: true });
            }
        }
        return result;
    }

    function logout() {
        return signOut(auth);
    }

    async function deleteAccount() {
        // 1. Delete Firestore Data
        const userRef = doc(db, "users", currentUser.uid);
        await deleteDoc(userRef);

        // 2. Delete Auth User
        // Note: This requires recent login. If it fails, the UI should prompt to re-login.
        await deleteUser(currentUser);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        googleSignIn,
        deleteAccount
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

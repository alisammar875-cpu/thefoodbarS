import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updatePassword as fbUpdatePassword
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

import Preloader from '../components/Preloader';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (user) => {
    if (!user) {
      setUserProfile(null);
      setIsAdmin(false);
      return;
    }
    try {
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data);
        setIsAdmin(data.role === 'admin');
      } else {
        // First-time Google sign-in or admin seed
        const isAdminEmail = user.email === 'admin@thefoodbar.com';
        const newProfile = {
          uid: user.uid,
          name: user.displayName || (isAdminEmail ? 'Admin' : 'Customer'),
          email: user.email,
          phone: '',
          role: isAdminEmail ? 'admin' : 'customer',
          addresses: [],
          totalOrders: 0,
          totalSpent: 0,
          loyaltyPoints: 0,
          createdAt: new Date().toISOString(),
          lastOrderAt: null
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile);
        setIsAdmin(isAdminEmail);
      }
    } catch (error) {
      // Silent fail — profile will be null
    }
  };

  useEffect(() => {
    // Safety timeout to prevent permanent blank screen if Firebase fails/hangs
    const timer = setTimeout(() => {
      if (loading) setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearTimeout(timer);
      setCurrentUser(user);
      await fetchProfile(user);
      setLoading(false);
    });
    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [loading]);

  const signup = async (email, password, name, phone) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    const userData = {
      uid: user.uid,
      name,
      email,
      phone,
      role: 'customer',
      addresses: [],
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0,
      createdAt: new Date().toISOString(),
      lastOrderAt: null
    };
    await setDoc(doc(db, 'users', user.uid), userData);
    setUserProfile(userData);
    return user;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await fetchProfile(result.user);
    return result.user;
  };

  const logout = () => {
    setUserProfile(null);
    setIsAdmin(false);
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const updateProfile = async (data) => {
    if (!currentUser) return;
    const docRef = doc(db, 'users', currentUser.uid);
    await updateDoc(docRef, data);
    setUserProfile(prev => ({ ...prev, ...data }));
  };

  const updateLoyaltyPoints = async (amount) => {
    if (!currentUser || !userProfile) return;
    const newPoints = (userProfile.loyaltyPoints || 0) + amount;
    const docRef = doc(db, 'users', currentUser.uid);
    await updateDoc(docRef, { loyaltyPoints: newPoints });
    setUserProfile(prev => ({ ...prev, loyaltyPoints: newPoints }));
  };

  const updateUserPassword = async (newPassword) => {
    if (!currentUser) return;
    return fbUpdatePassword(currentUser, newPassword);
  };

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateProfile,
    updateLoyaltyPoints,
    updateUserPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <Preloader /> : children}
    </AuthContext.Provider>
  );
}

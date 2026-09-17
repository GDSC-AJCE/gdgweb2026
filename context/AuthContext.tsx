"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, googleProvider, db } from "@/lib/firebase";
import { isAdminEmail } from "@/lib/constants";
import Onboarding from "@/components/Onboarding";

interface AuthContextType {
  user: User | null;
  userData: any | null;
  isAdmin: boolean;
  loading: boolean;
  googleSignIn: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  googleSignIn: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const googleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Google sign in failed:", error);
      if (error?.code === "auth/configuration-not-found") {
        window.alert(
          "Firebase Authentication is not yet activated on your project.\n\n" +
          "1. Open Firebase Console: https://console.firebase.google.com/project/gdg-community-ajce/authentication\n" +
          "2. Click 'Get Started'\n" +
          "3. Enable 'Google' sign-in provider and click Save."
        );
      } else if (error?.code === "auth/popup-blocked") {
        window.alert("Login popup was blocked by your browser. Please allow popups for this site and try again.");
      }
      setLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const email = currentUser.email?.toLowerCase() || "";
        const isMasterAdmin = isAdminEmail(email);
        const userRef = doc(db, "users", currentUser.uid);

        const unsubUserData = onSnapshot(
          userRef,
          async (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data();
              const hasAdminFlag = isMasterAdmin || Boolean(data.is_admin || data.isAdmin || data.role === "admin");

              setUserData({
                ...data,
                role: isMasterAdmin ? "admin" : (data.role || "member"),
                is_admin: hasAdminFlag,
                isAdmin: hasAdminFlag,
              });

              // Ensure master admin has admin role & is_admin persisted in Firestore
              if (isMasterAdmin && (!data.is_admin || data.role !== "admin")) {
                try {
                  await setDoc(
                    userRef,
                    {
                      role: "admin",
                      is_admin: true,
                      isAdmin: true,
                      updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                  );
                } catch (syncErr) {
                  console.warn("Could not sync admin flags to Firestore:", syncErr);
                }
              }
            } else {
              // User document does not exist yet in Firestore
              if (isMasterAdmin) {
                // Auto-create complete admin user document so organizer enters instantly without onboarding friction
                const initialAdminData = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName || "Chapter Lead Organizer",
                  name: currentUser.displayName || "Chapter Lead Organizer",
                  fullName: currentUser.displayName || "Chapter Lead Organizer",
                  photoURL: currentUser.photoURL,
                  role: "admin",
                  is_admin: true,
                  isAdmin: true,
                  department: "Computer Science & Engineering",
                  graduationYear: 2026,
                  phoneNumber: "+91 99999 99999",
                  college: "Amal Jyothi College of Engineering",
                  onboardingCompleted: true,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp(),
                };

                try {
                  await setDoc(userRef, initialAdminData);
                } catch (writeErr) {
                  console.error("Auto-provisioning admin doc failed:", writeErr);
                }

                setUserData(initialAdminData);
              } else {
                setUserData(null);
              }
            }
            setLoading(false);
          },
          (error) => {
            console.error("Firestore user onSnapshot error:", error);
            if (isMasterAdmin) {
              setUserData({
                uid: currentUser.uid,
                email: currentUser.email,
                displayName: currentUser.displayName || "Chapter Lead Organizer",
                name: currentUser.displayName || "Chapter Lead Organizer",
                role: "admin",
                is_admin: true,
                isAdmin: true,
                department: "Computer Science & Engineering",
                graduationYear: 2026,
                phoneNumber: "+91 99999 99999",
                college: "Amal Jyothi College of Engineering",
              });
            }
            setLoading(false);
          }
        );

        return () => unsubUserData();
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const isMasterAdmin = isAdminEmail(user?.email);

  // Profile completion check (Designated admin always bypasses onboarding)
  const isProfileComplete = Boolean(
    isMasterAdmin ||
    (userData?.department && userData?.graduationYear && userData?.phoneNumber)
  );

  const isAdmin = Boolean(
    isMasterAdmin ||
    userData?.isAdmin ||
    userData?.is_admin ||
    userData?.role === "admin"
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        isAdmin,
        loading,
        googleSignIn,
        logOut,
      }}
    >
      {!loading && user && !isProfileComplete ? (
        <Onboarding user={user} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


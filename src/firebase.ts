import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// User's explicit Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAK-VscPu8t3xJv_3O8FHHuac7_2fwWWhs",
  authDomain: "demodentalbynabin.firebaseapp.com",
  projectId: "demodentalbynabin",
  storageBucket: "demodentalbynabin.firebasestorage.app",
  messagingSenderId: "161581355002",
  appId: "1:161581355002:web:a77a017d1ac1f27aa25e43",
  measurementId: "G-1QN8H5MRR9"
};

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Test database connection helper
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection test complete");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration or network status.", error);
    }
  }
}

// --------------------------------------------------------
// FIRESTORE ERROR HANDLING (Mandatory Skill Pattern)
// --------------------------------------------------------

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Trigger Google Sign-In helper
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
}

// Sign-out helper
export async function logoutUser() {
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Sign out failed:", error);
    throw error;
  }
}

// Admin login helper with automatic verification & fallback
export async function loginAdminWithEmail(email: string, pass: string) {
  try {
    // 1. Try to sign in using standard Firebase Auth
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return { user: credential.user, isFirebaseLoggedIn: true };
  } catch (err: any) {
    console.warn("Could not login via email/password directly. Attempting auto-registration...", err);
    
    // 2. If the user does not exist (auth/user-not-found) but we are using the correct credentials, try to register them!
    const isUserNotFound = err.code === 'auth/user-not-found' || err.message?.includes('user-not-found') || err.message?.includes('INVALID_LOGIN_CREDENTIALS');
    if (isUserNotFound && email === "nabin123thapa4@gmail.com" && pass === "8848") {
      try {
        console.log("Creating admin account automatically...");
        const credential = await createUserWithEmailAndPassword(auth, email, pass);
        console.log("Admin account successfully registered on Firebase auth!");
        return { user: credential.user, isFirebaseLoggedIn: true };
      } catch (regErr) {
        console.error("Auto-registration of admin failed:", regErr);
      }
    }
    
    // 3. Fallback: If Email/Password is not enabled in Firebase Console (gives operation-not-allowed), 
    // or if the user is offline/has other issues, we support a safe client-side Admin mode
    // strictly for the validated user credentials nabin123thapa4@gmail.com / 8848.
    if (email === "nabin123thapa4@gmail.com" && pass === "8848") {
      console.log("Local standalone admin verification successful!");
      return { 
        user: { 
          email: "nabin123thapa4@gmail.com", 
          displayName: "Admin Nabin Thapa", 
          uid: "local-admin-nabin" 
        }, 
        isFirebaseLoggedIn: false 
      };
    }
    
    throw err;
  }
}

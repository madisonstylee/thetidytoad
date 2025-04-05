// Import Firebase v9 SDK
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  createUserWithEmailAndPassword, 
  deleteUser,
  signInWithEmailAndPassword
} = require('firebase/auth');
const { 
  getFirestore, 
  doc, 
  setDoc, 
  deleteDoc,
  connectFirestoreEmulator
} = require('firebase/firestore');
const { 
  getStorage, 
  ref, 
  uploadString, 
  deleteObject,
  connectStorageEmulator
} = require('firebase/storage');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

// Read the .env file directly
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the .env file content
const envVars = {};
envContent.split('\n').forEach(line => {
  if (line.startsWith('#') || !line.trim()) return;
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

// Firebase configuration from parsed .env file
const firebaseConfig = {
  apiKey: envVars.REACT_APP_FIREBASE_API_KEY,
  authDomain: envVars.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: envVars.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.REACT_APP_FIREBASE_APP_ID,
  measurementId: envVars.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Check Firebase Authentication and return a user credential
async function checkAuth() {
  try {
    console.log('Checking Firebase Authentication...');
    
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!';
    
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    console.log('✅ Firebase Authentication is working!');
    
    return userCredential;
  } catch (error) {
    console.error('❌ Firebase Authentication error:', error.message);
    if (error.code === 'auth/operation-not-allowed') {
      console.error('❌ Email/Password authentication is not enabled in Firebase Console');
    }
    throw error;
  }
}

// Check Firestore Database
async function checkFirestore(userCredential) {
  try {
    console.log('Checking Firestore Database...');
    
    const testDocRef = doc(db, 'test', 'test');
    
    if (!userCredential.user) {
      throw new Error('No authenticated user available');
    }
    
    await setDoc(testDocRef, { 
      test: true,
      timestamp: new Date().toISOString()
    });
    console.log('✅ Firestore Database is working!');
    
    await deleteDoc(testDocRef);
    console.log('✅ Test document deleted successfully');
  } catch (error) {
    console.error('❌ Firestore Database error:', error.message);
    if (error.code === 'permission-denied') {
      console.error('❌ Firestore security rules are not set up correctly or authentication failed');
    }
    throw error;
  }
}

// Check Firebase Storage
async function checkStorage(userCredential) {
  try {
    console.log('Checking Firebase Storage...');
    
    const testRef = ref(storage, `test-${Date.now()}.txt`);
    
    if (!userCredential.user) {
      throw new Error('No authenticated user available');
    }
    
    await uploadString(testRef, 'test');
    console.log('✅ Firebase Storage is working!');
    
    await deleteObject(testRef);
    console.log('✅ Test file deleted successfully');
  } catch (error) {
    console.error('❌ Firebase Storage error:', error.message);
    if (error.code === 'storage/unauthorized') {
      console.error('❌ Firebase Storage security rules are not set up correctly or authentication failed');
    } else if (error.code === 'storage/retry-limit-exceeded') {
      console.error('❌ Storage operation timed out; check network or configuration');
    }
    throw error;
  }
}

// Clean up: Delete the test user
async function cleanup(userCredential) {
  try {
    if (userCredential && userCredential.user) {
      await deleteUser(userCredential.user);
      console.log('✅ Test user deleted successfully');
    }
  } catch (error) {
    console.error('❌ Error deleting test user:', error.message);
  }
}

// Run all checks
async function runChecks() {
  console.log('Checking Firebase setup...');
  console.log('Firebase configuration:', firebaseConfig);
  
  let userCredential = null;
  try {
    userCredential = await checkAuth();
    await checkFirestore(userCredential);
    await checkStorage(userCredential); // Added Storage check
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  } finally {
    await cleanup(userCredential);
  }
  
  console.log('\nFirebase setup check completed!');
  console.log('\nIf you are still having issues with Firestore and Storage, try the following:');
  console.log('1. Make sure you have published the security rules in the Firebase Console');
  console.log('2. Try deploying the rules using the Firebase CLI:');
  console.log('   firebase deploy --only firestore:rules,storage:rules');
  console.log('3. Check if your Firebase project has the correct permissions');
  console.log('4. Make sure your Firebase project is on the Blaze (pay-as-you-go) plan, as some features require this plan');
  
  process.exit(0);
}

runChecks();
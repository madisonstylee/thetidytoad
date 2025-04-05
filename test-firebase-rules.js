/**
 * The Tidy Toad - Firebase Rules Testing Script
 * 
 * This script helps you test your Firebase security rules locally using the Firebase emulator suite.
 * It will start the Firebase emulators for Firestore and Storage, and run tests against your rules.
 * 
 * Prerequisites:
 * 1. Firebase CLI installed: npm install -g firebase-tools
 * 2. Firebase emulators installed: firebase setup:emulators:firestore and firebase setup:emulators:storage
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { initializeApp } = require('firebase/app');
const { 
  getAuth, 
  connectAuthEmulator,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} = require('firebase/auth');
const { 
  getFirestore, 
  connectFirestoreEmulator,
  doc,
  setDoc,
  getDoc,
  deleteDoc
} = require('firebase/firestore');
const { 
  getStorage, 
  connectStorageEmulator,
  ref,
  uploadString,
  getDownloadURL,
  deleteObject
} = require('firebase/storage');

// Load environment variables from .env file
require('dotenv').config();

// Read the .env file directly
const envPath = path.resolve(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');

// Parse the .env file content
const envVars = {};
envContent.split('\n').forEach(line => {
  // Skip comments and empty lines
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

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Start Firebase emulators
function startEmulators() {
  console.log('Starting Firebase emulators...');
  try {
    // Start emulators in the background
    const child = require('child_process').spawn('firebase', ['emulators:start', '--only', 'auth,firestore,storage'], {
      detached: true,
      stdio: 'inherit'
    });
    
    // Don't wait for the child process to exit
    child.unref();
    
    // Wait for emulators to start
    console.log('Waiting for emulators to start...');
    execSync('sleep 5');
    
    return true;
  } catch (error) {
    console.error('Error starting Firebase emulators:', error.message);
    return false;
  }
}

// Initialize Firebase with emulators
function initializeFirebaseWithEmulators() {
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  
  // Connect to emulators
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  
  return { app, auth, db, storage };
}

// Test Firestore rules
async function testFirestoreRules(db, auth) {
  console.log('\nTesting Firestore security rules...');
  
  // Test 1: Unauthenticated user should not be able to read or write
  console.log('\nTest 1: Unauthenticated user should not be able to read or write');
  try {
    const testDocRef = doc(db, 'test', 'test1');
    await setDoc(testDocRef, { test: true });
    console.log('❌ Test 1 failed: Unauthenticated user was able to write to Firestore');
  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log('✅ Test 1 passed: Unauthenticated user was not able to write to Firestore');
    } else {
      console.error('❌ Test 1 error:', error.message);
    }
  }
  
  // Create a test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!';
  const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
  
  // Test 2: Authenticated user should be able to read and write
  console.log('\nTest 2: Authenticated user should be able to read and write');
  try {
    const testDocRef = doc(db, 'test', 'test2');
    await setDoc(testDocRef, { test: true });
    console.log('✅ Test 2 passed: Authenticated user was able to write to Firestore');
    
    // Clean up
    await deleteDoc(testDocRef);
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
  
  // Test 3: Authenticated user should be able to read their own data
  console.log('\nTest 3: Authenticated user should be able to read their own data');
  try {
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    await setDoc(userDocRef, { name: 'Test User' });
    
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      console.log('✅ Test 3 passed: Authenticated user was able to read their own data');
    } else {
      console.log('❌ Test 3 failed: Authenticated user was not able to read their own data');
    }
    
    // Clean up
    await deleteDoc(userDocRef);
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
  }
}

// Test Storage rules
async function testStorageRules(storage, auth) {
  console.log('\nTesting Storage security rules...');
  
  // Test 1: Unauthenticated user should not be able to upload
  console.log('\nTest 1: Unauthenticated user should not be able to upload');
  try {
    const testRef = ref(storage, 'test/test1.txt');
    await uploadString(testRef, 'test');
    console.log('❌ Test 1 failed: Unauthenticated user was able to upload to Storage');
  } catch (error) {
    if (error.code === 'storage/unauthorized') {
      console.log('✅ Test 1 passed: Unauthenticated user was not able to upload to Storage');
    } else {
      console.error('❌ Test 1 error:', error.message);
    }
  }
  
  // Create a test user
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123!';
  const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
  
  // Test 2: Authenticated user should be able to upload and download
  console.log('\nTest 2: Authenticated user should be able to upload and download');
  try {
    const testRef = ref(storage, 'test/test2.txt');
    await uploadString(testRef, 'test');
    console.log('✅ Test 2 passed: Authenticated user was able to upload to Storage');
    
    // Try to download
    const url = await getDownloadURL(testRef);
    console.log('✅ Test 2 passed: Authenticated user was able to get download URL');
    
    // Clean up
    await deleteObject(testRef);
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
  }
}

// Main function
async function main() {
  console.log('='.repeat(80));
  console.log('The Tidy Toad - Firebase Rules Testing Script');
  console.log('='.repeat(80));
  console.log();
  
  // Check if Firebase CLI is installed
  if (!checkFirebaseCLI()) {
    console.error('Firebase CLI is not installed!');
    console.error('Please install it by running: npm install -g firebase-tools');
    process.exit(1);
  }
  console.log('✅ Firebase CLI is installed!');
  
  // Start Firebase emulators
  if (!startEmulators()) {
    console.error('Failed to start Firebase emulators!');
    process.exit(1);
  }
  console.log('✅ Firebase emulators started!');
  
  // Initialize Firebase with emulators
  const { app, auth, db, storage } = initializeFirebaseWithEmulators();
  console.log('✅ Firebase initialized with emulators!');
  
  // Test Firestore rules
  await testFirestoreRules(db, auth);
  
  // Test Storage rules
  await testStorageRules(storage, auth);
  
  console.log('\nFirebase rules testing completed!');
  console.log('\nPress Ctrl+C to stop the Firebase emulators.');
}

// Run the main function
main().catch(console.error);

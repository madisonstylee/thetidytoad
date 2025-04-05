/**
 * The Tidy Toad - Firebase Plan Check Script
 * 
 * This script checks if your Firebase project is on the Blaze (pay-as-you-go) plan.
 * Some Firebase features, like certain Cloud Functions, require the Blaze plan.
 * 
 * Note: This script can only provide guidance, as there's no direct API to check the plan.
 * It will attempt to perform operations that are only available on the Blaze plan.
 */

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, deleteUser } = require('firebase/auth');
const { getFirestore, doc, setDoc, deleteDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Check if Firebase CLI is installed
function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if user is logged in to Firebase
function checkFirebaseLogin() {
  try {
    const output = execSync('firebase projects:list').toString();
    return output.includes('the-tidy-toad');
  } catch (error) {
    return false;
  }
}

// Check if Firebase Functions are enabled
function checkFirebaseFunctions() {
  try {
    // Check if the functions directory exists
    const functionsPath = path.resolve(__dirname, 'functions');
    if (!fs.existsSync(functionsPath)) {
      return false;
    }
    
    // Check if the functions/index.js file exists
    const functionsIndexPath = path.resolve(functionsPath, 'index.js');
    if (!fs.existsSync(functionsIndexPath)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Check if Firebase project is on the Blaze plan
async function checkBlazePlan() {
  console.log('Checking if Firebase project is on the Blaze (pay-as-you-go) plan...');
  
  // Check if Firebase CLI is installed
  if (!checkFirebaseCLI()) {
    console.error('Firebase CLI is not installed!');
    console.error('Please install it by running: npm install -g firebase-tools');
    return false;
  }
  
  // Check if user is logged in to Firebase
  if (!checkFirebaseLogin()) {
    console.error('You are not logged in to Firebase or the project "the-tidy-toad" is not accessible!');
    console.error('Please log in by running: firebase login');
    return false;
  }
  
  // Check if Firebase Functions are enabled
  const functionsEnabled = checkFirebaseFunctions();
  if (functionsEnabled) {
    console.log('✅ Firebase Functions are enabled, which suggests you might be on the Blaze plan.');
  } else {
    console.log('❌ Firebase Functions are not enabled. This doesn\'t necessarily mean you\'re not on the Blaze plan, but it\'s a good indicator.');
  }
  
  console.log('\nTo check your Firebase plan:');
  console.log('1. Go to the Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project "The Tidy Toad"');
  console.log('3. Click on "Upgrade" in the left sidebar');
  console.log('4. If you see "You\'re on the Blaze plan", then you\'re on the Blaze plan.');
  console.log('5. If you see "You\'re on the Spark plan", then you\'re on the free plan and might need to upgrade to use certain features.');
  
  return functionsEnabled;
}

// Main function
async function main() {
  console.log('='.repeat(80));
  console.log('The Tidy Toad - Firebase Plan Check Script');
  console.log('='.repeat(80));
  console.log();
  
  console.log('Firebase configuration:', firebaseConfig);
  console.log();
  
  await checkBlazePlan();
  
  console.log();
  console.log('Firebase plan check completed!');
  process.exit(0);
}

// Run the main function
main().catch(console.error);

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check if serviceAccountKey.json exists
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ serviceAccountKey.json not found!');
  console.error('Please follow the instructions in FIREBASE_SETUP.md to generate a service account key.');
  process.exit(1);
}

// Load the service account key
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
  console.log('✅ Service account key loaded successfully!');
} catch (error) {
  console.error('❌ Error loading service account key:', error.message);
  process.exit(1);
}

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin SDK initialized successfully!');
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  process.exit(1);
}

// Check Firestore
async function checkFirestore() {
  try {
    console.log('Checking Firestore Database...');
    
    // Get Firestore instance
    const db = admin.firestore();
    
    // Try to write to a test collection
    const testDoc = db.collection('test').doc('admin-test');
    
    try {
      await testDoc.set({ test: true, timestamp: admin.firestore.FieldValue.serverTimestamp() });
      console.log('✅ Firestore Database is working!');
      
      // Delete the test document
      await testDoc.delete();
      console.log('✅ Test document deleted successfully');
    } catch (error) {
      console.error('❌ Firestore Database error:', error.message);
    }
  } catch (error) {
    console.error('❌ Error checking Firestore Database:', error);
  }
}

// Check Authentication
async function checkAuth() {
  try {
    console.log('Checking Firebase Authentication...');
    
    // Get Auth instance
    const auth = admin.auth();
    
    // List users (limited to 1)
    try {
      const listUsersResult = await auth.listUsers(1);
      console.log(`✅ Firebase Authentication is working! Found ${listUsersResult.users.length} users.`);
    } catch (error) {
      console.error('❌ Firebase Authentication error:', error.message);
    }
  } catch (error) {
    console.error('❌ Error checking Firebase Authentication:', error);
  }
}

// Run all checks
async function runChecks() {
  console.log('Checking Firebase Admin SDK setup...');
  
  await checkFirestore();
  await checkAuth();
  
  console.log('Firebase Admin SDK setup check completed!');
  process.exit(0);
}

// Run the checks
runChecks();

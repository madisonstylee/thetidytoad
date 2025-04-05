/**
 * The Tidy Toad - Firebase Rules Deployment Script
 * 
 * This script deploys the Firestore and Storage security rules to your Firebase project.
 * It uses the Firebase CLI to deploy the rules, so you need to have the Firebase CLI installed
 * and be logged in to your Firebase account.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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

// Deploy Firestore rules
function deployFirestoreRules() {
  console.log('Deploying Firestore security rules...');
  try {
    const output = execSync('firebase deploy --only firestore:rules').toString();
    console.log(output);
    return true;
  } catch (error) {
    console.error('Error deploying Firestore rules:', error.message);
    return false;
  }
}

// Deploy Storage rules
function deployStorageRules() {
  console.log('Deploying Storage security rules...');
  try {
    const output = execSync('firebase deploy --only storage:rules').toString();
    console.log(output);
    return true;
  } catch (error) {
    console.error('Error deploying Storage rules:', error.message);
    return false;
  }
}

// Main function
async function main() {
  console.log('='.repeat(80));
  console.log('The Tidy Toad - Firebase Rules Deployment Script');
  console.log('='.repeat(80));
  console.log();

  // Check if Firebase CLI is installed
  if (!checkFirebaseCLI()) {
    console.error('Firebase CLI is not installed!');
    console.error('Please install it by running: npm install -g firebase-tools');
    process.exit(1);
  }
  console.log('✅ Firebase CLI is installed!');

  // Check if user is logged in to Firebase
  if (!checkFirebaseLogin()) {
    console.error('You are not logged in to Firebase or the project "the-tidy-toad" is not accessible!');
    console.error('Please log in by running: firebase login');
    process.exit(1);
  }
  console.log('✅ You are logged in to Firebase and have access to the project "the-tidy-toad"!');

  // Check if firestore.rules file exists
  const firestoreRulesPath = path.resolve(__dirname, 'firestore.rules');
  if (!fs.existsSync(firestoreRulesPath)) {
    console.error('firestore.rules file not found!');
    process.exit(1);
  }
  console.log('✅ firestore.rules file found!');

  // Check if storage.rules file exists
  const storageRulesPath = path.resolve(__dirname, 'storage.rules');
  if (!fs.existsSync(storageRulesPath)) {
    console.error('storage.rules file not found!');
    process.exit(1);
  }
  console.log('✅ storage.rules file found!');

  // Deploy Firestore rules
  console.log();
  console.log('Deploying Firestore rules...');
  const firestoreSuccess = deployFirestoreRules();
  if (firestoreSuccess) {
    console.log('✅ Firestore rules deployed successfully!');
  } else {
    console.error('❌ Failed to deploy Firestore rules!');
  }

  // Deploy Storage rules
  console.log();
  console.log('Deploying Storage rules...');
  const storageSuccess = deployStorageRules();
  if (storageSuccess) {
    console.log('✅ Storage rules deployed successfully!');
  } else {
    console.error('❌ Failed to deploy Storage rules!');
  }

  console.log();
  if (firestoreSuccess && storageSuccess) {
    console.log('✅ All rules deployed successfully!');
  } else {
    console.error('❌ Some rules failed to deploy!');
  }

  console.log();
  console.log('You can now run the check-firebase-setup.js script to verify that the rules are working:');
  console.log('node check-firebase-setup.js');
}

// Run the main function
main().catch(console.error);

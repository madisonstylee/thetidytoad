/**
 * The Tidy Toad - Firebase Project Setup Helper
 * 
 * This script helps you set up a Firebase project for The Tidy Toad application.
 * It will guide you through the process of creating a Firebase project, enabling
 * Authentication, creating a Firestore database, and setting up Storage.
 * 
 * Note: This script requires user interaction and cannot be run automatically.
 * You will need to follow the instructions and perform the actions manually.
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    crimson: '\x1b[38m'
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    crimson: '\x1b[48m'
  }
};

// Helper functions
function printHeader(text) {
  console.log('\n' + colors.fg.green + colors.bright + '='.repeat(80) + colors.reset);
  console.log(colors.fg.green + colors.bright + ' ' + text + colors.reset);
  console.log(colors.fg.green + colors.bright + '='.repeat(80) + colors.reset + '\n');
}

function printStep(number, text) {
  console.log(colors.fg.cyan + colors.bright + `Step ${number}: ${text}` + colors.reset);
}

function printSubStep(text) {
  console.log(colors.fg.yellow + '  • ' + text + colors.reset);
}

function printInfo(text) {
  console.log(colors.fg.white + '  ' + text + colors.reset);
}

function printWarning(text) {
  console.log(colors.fg.yellow + '  ⚠️  ' + text + colors.reset);
}

function printSuccess(text) {
  console.log(colors.fg.green + '  ✅ ' + text + colors.reset);
}

function printError(text) {
  console.log(colors.fg.red + '  ❌ ' + text + colors.reset);
}

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(colors.fg.magenta + question + colors.reset + ' ', (answer) => {
      resolve(answer);
    });
  });
}

// Main function
async function main() {
  printHeader('The Tidy Toad - Firebase Project Setup Helper');
  
  console.log('This script will guide you through the process of setting up a Firebase project');
  console.log('for The Tidy Toad application. You will need to perform the actions manually');
  console.log('by following the instructions provided.\n');
  
  // Step 1: Create a Firebase Project
  printStep(1, 'Create a Firebase Project');
  printSubStep('Go to the Firebase Console: https://console.firebase.google.com/');
  printSubStep('Click "Add project" and follow the steps to create a new project named "The Tidy Toad"');
  printSubStep('Once the project is created, click "Continue"');
  
  await askQuestion('Press Enter when you have completed Step 1...');
  printSuccess('Firebase Project created!');
  
  // Step 2: Enable Authentication
  printStep(2, 'Enable Authentication');
  printSubStep('In the Firebase Console, go to "Authentication" in the left sidebar');
  printSubStep('Click "Get started"');
  printSubStep('Click on the "Sign-in method" tab');
  printSubStep('Enable "Email/Password" authentication by clicking on it and toggling the switch');
  printSubStep('Click "Save"');
  
  await askQuestion('Press Enter when you have completed Step 2...');
  printSuccess('Authentication enabled!');
  
  // Step 3: Create Firestore Database
  printStep(3, 'Create Firestore Database');
  printSubStep('In the Firebase Console, go to "Firestore Database" in the left sidebar');
  printSubStep('Click "Create database"');
  printSubStep('Choose "Start in production mode" and click "Next"');
  printSubStep('Choose a location for your database (preferably one close to your users) and click "Enable"');
  
  await askQuestion('Press Enter when you have completed Step 3...');
  printSuccess('Firestore Database created!');
  
  // Step 4: Set Up Storage
  printStep(4, 'Set Up Storage');
  printSubStep('In the Firebase Console, go to "Storage" in the left sidebar');
  printSubStep('Click "Get started"');
  printSubStep('Click "Next"');
  printSubStep('Choose a location for your storage bucket (preferably the same as your Firestore database) and click "Done"');
  
  await askQuestion('Press Enter when you have completed Step 4...');
  printSuccess('Storage set up!');
  
  // Step 5: Deploy Security Rules
  printStep(5, 'Deploy Security Rules');
  printSubStep('In the Firebase Console, go to "Firestore Database" in the left sidebar');
  printSubStep('Click on the "Rules" tab');
  printSubStep('Replace the default rules with the following:');
  printInfo('```');
  printInfo('rules_version = \'2\';');
  printInfo('service cloud.firestore {');
  printInfo('  match /databases/{database}/documents {');
  printInfo('    match /{document=**} {');
  printInfo('      allow read, write: if request.auth != null;');
  printInfo('    }');
  printInfo('  }');
  printInfo('}');
  printInfo('```');
  printSubStep('Click "Publish"');
  
  printSubStep('Similarly, go to "Storage" in the left sidebar, click on the "Rules" tab, and replace the default rules with:');
  printInfo('```');
  printInfo('rules_version = \'2\';');
  printInfo('service firebase.storage {');
  printInfo('  match /b/{bucket}/o {');
  printInfo('    match /{allPaths=**} {');
  printInfo('      allow read, write: if request.auth != null;');
  printInfo('    }');
  printInfo('  }');
  printInfo('}');
  printInfo('```');
  printSubStep('Click "Publish"');
  
  await askQuestion('Press Enter when you have completed Step 5...');
  printSuccess('Security Rules deployed!');
  
  // Step 6: Generate a Service Account Key
  printStep(6, 'Generate a Service Account Key');
  printSubStep('In the Firebase Console, go to "Project settings" (gear icon in the top left)');
  printSubStep('Click on the "Service accounts" tab');
  printSubStep('Click "Generate new private key"');
  printSubStep('Save the JSON file as `serviceAccountKey.json` in the `Web Version/web-app` directory');
  
  await askQuestion('Press Enter when you have completed Step 6...');
  
  // Check if serviceAccountKey.json exists
  const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');
  if (fs.existsSync(serviceAccountPath)) {
    printSuccess('Service Account Key generated and saved!');
  } else {
    printWarning('serviceAccountKey.json not found in the current directory.');
    printWarning('Please make sure to save the service account key as `serviceAccountKey.json` in the `Web Version/web-app` directory.');
  }
  
  // Step 7: Update Firebase Configuration
  printStep(7, 'Update Firebase Configuration');
  printSubStep('In the Firebase Console, go to "Project settings" (gear icon in the top left)');
  printSubStep('In the "General" tab, scroll down to "Your apps" section');
  printSubStep('If you don\'t see a web app, click on the web icon (</>) to create one');
  printSubStep('Enter "The Tidy Toad" as the app nickname and click "Register app"');
  printSubStep('Copy the Firebase configuration object');
  printSubStep('Update the `.env` file in the `Web Version/web-app` directory with the values from the configuration object');
  
  await askQuestion('Press Enter when you have completed Step 7...');
  
  // Check if .env file exists
  const envPath = path.resolve(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    printSuccess('Firebase Configuration updated!');
  } else {
    printWarning('.env file not found in the current directory.');
    printWarning('Please make sure to create a .env file in the `Web Version/web-app` directory and update it with the Firebase configuration values.');
  }
  
  // Final steps
  printHeader('Firebase Project Setup Completed!');
  console.log('You have successfully set up a Firebase project for The Tidy Toad application.');
  console.log('You can now run the following commands to check if everything is set up correctly:');
  console.log('\n1. Check Firebase Client SDK setup:');
  console.log('   node check-firebase-setup.js');
  console.log('\n2. Check Firebase Admin SDK setup:');
  console.log('   node check-firebase-admin.js');
  console.log('\n3. Run the Firebase setup script to initialize the database:');
  console.log('   node deploy-firebase.js');
  console.log('\n4. Start the application:');
  console.log('   npm start');
  
  rl.close();
}

// Run the main function
main().catch(console.error);

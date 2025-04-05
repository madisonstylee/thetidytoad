# Firebase Scripts Reference

This document provides a reference for all the Firebase-related scripts in the Tidy Toad application. These scripts help you set up, configure, test, and troubleshoot your Firebase project.

## Setup Scripts

### 1. setup-firebase-project.js

**Purpose**: Interactive guided setup for Firebase project.

**Usage**:
```
cd "Web Version/web-app"
node setup-firebase-project.js
```

**Description**: This script guides you through the process of setting up a Firebase project for The Tidy Toad application. It provides step-by-step instructions and prompts for each stage of the setup process, including creating a Firebase project, enabling Authentication, creating a Firestore database, setting up Storage, deploying security rules, generating a service account key, and updating the Firebase configuration.

### 2. deploy-firebase.js

**Purpose**: Initialize Firestore database with necessary collections.

**Usage**:
```
cd "Web Version/web-app"
node deploy-firebase.js
```

**Description**: This script creates the necessary collections in Firestore for The Tidy Toad application. It uses the Firebase Admin SDK to create placeholder documents in the users, families, and rewardBanks collections.

### 3. deploy-firebase-rules.js

**Purpose**: Deploy Firestore and Storage security rules.

**Usage**:
```
cd "Web Version/web-app"
node deploy-firebase-rules.js
```

**Description**: This script deploys the Firestore and Storage security rules to your Firebase project. It checks if the Firebase CLI is installed and if you are logged in to Firebase before deploying the rules.

## Testing Scripts

### 1. test-firebase-rules.js

**Purpose**: Test Firebase security rules locally using the Firebase emulator suite.

**Usage**:
```
cd "Web Version/web-app"
node test-firebase-rules.js
```

**Description**: This script tests your Firebase security rules locally using the Firebase emulator suite. It starts the Firebase emulators for Auth, Firestore, and Storage, and runs tests against your rules to verify that they are working as expected.

**Prerequisites**:
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase emulators installed: `firebase setup:emulators:firestore` and `firebase setup:emulators:storage`

## Verification Scripts

### 1. check-firebase-setup.js

**Purpose**: Check if Firebase client SDK is properly set up.

**Usage**:
```
cd "Web Version/web-app"
npm install firebase@9.6.0 dotenv
node check-firebase-setup.js
```

**Description**: This script checks if your Firebase project is properly set up by testing Firebase Authentication (creating and deleting a test user), Firestore Database (writing and deleting a test document), and Storage (uploading and deleting a test file). If any of these checks fail, the script will provide error messages to help you troubleshoot the issues.

### 2. check-firebase-setup-test.js

**Purpose**: Enhanced diagnostics for Firebase client SDK setup.

**Usage**:
```
cd "Web Version/web-app"
node check-firebase-setup-test.js
```

**Description**: This script provides more detailed diagnostics and checks for common issues with Firebase setup. It's useful if you're still having issues with Firestore and Storage after running the basic check-firebase-setup.js script.

### 3. check-firebase-admin.js

**Purpose**: Check if Firebase Admin SDK is properly set up.

**Usage**:
```
cd "Web Version/web-app"
node check-firebase-admin.js
```

**Description**: This script checks if your Firebase Admin SDK is properly set up by verifying that the serviceAccountKey.json file exists and is valid, testing Firestore Database access with admin privileges, and testing Firebase Authentication with admin privileges.

### 4. check-firebase-plan.js

**Purpose**: Check if Firebase project is on the Blaze plan.

**Usage**:
```
cd "Web Version/web-app"
node check-firebase-plan.js
```

**Description**: This script checks if your Firebase project is on the Blaze (pay-as-you-go) plan. Some Firebase features, like certain Cloud Functions, require the Blaze plan. The script provides guidance on how to check your Firebase plan and whether you need to upgrade to use certain features.

## Troubleshooting Guide

If you encounter issues with Firebase, follow these steps:

1. **Check Firebase Configuration**:
   - Make sure the Firebase configuration in the `.env` file is correct
   - Run `node check-firebase-setup.js` to verify the configuration

2. **Check Firebase Authentication**:
   - Make sure Email/Password authentication is enabled in the Firebase Console
   - Run `node check-firebase-setup.js` to verify authentication is working

3. **Check Firestore Database**:
   - Make sure the Firestore database is created in the Firebase Console
   - Make sure the security rules are properly set
   - Run `node check-firebase-setup.js` to verify Firestore is working
   - If issues persist, run `node check-firebase-setup-test.js` for more detailed diagnostics

4. **Check Storage**:
   - Make sure Storage is set up in the Firebase Console
   - Make sure the security rules are properly set
   - Run `node check-firebase-setup.js` to verify Storage is working
   - If issues persist, run `node check-firebase-setup-test.js` for more detailed diagnostics

5. **Check Firebase Admin SDK**:
   - Make sure the serviceAccountKey.json file exists and is valid
   - Run `node check-firebase-admin.js` to verify the Admin SDK is working

6. **Check Firebase Plan**:
   - Some features require the Blaze (pay-as-you-go) plan
   - Run `node check-firebase-plan.js` to check your Firebase plan

7. **Test Firebase Rules**:
   - Run `node test-firebase-rules.js` to test your Firebase security rules locally

8. **Deploy Firebase Rules**:
   - If you've made changes to your security rules, run `node deploy-firebase-rules.js` to deploy them

9. **Check Browser Console**:
   - Check the browser console for any errors when running the application

# Firebase Setup Instructions

Follow these steps to set up Firebase for the Tidy Toad application.

## Interactive Setup Helper

For an interactive guided setup experience, you can run the setup helper script:

```
cd "Web Version/web-app"
node setup-firebase-project.js
```

This script will guide you through each step of the Firebase setup process with clear instructions and prompts. It will also check if your configuration files are in the correct locations.

If you prefer to follow the manual steps, continue with the instructions below:

## 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the steps to create a new project named "The Tidy Toad"
3. Once the project is created, click "Continue"

## 2. Enable Authentication

1. In the Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Click on the "Sign-in method" tab
4. Enable "Email/Password" authentication by clicking on it and toggling the switch
5. Click "Save"

## 3. Create Firestore Database

1. In the Firebase Console, go to "Firestore Database" in the left sidebar
2. Click "Create database"
3. Choose "Start in production mode" and click "Next"
4. Choose a location for your database (preferably one close to your users) and click "Enable"

## 4. Set Up Storage

1. In the Firebase Console, go to "Storage" in the left sidebar
2. Click "Get started"
3. Click "Next"
4. Choose a location for your storage bucket (preferably the same as your Firestore database) and click "Done"

## 5. Deploy Security Rules

1. In the Firebase Console, go to "Firestore Database" in the left sidebar
2. Click on the "Rules" tab
3. Replace the default rules with the following:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click "Publish"

5. Similarly, go to "Storage" in the left sidebar, click on the "Rules" tab, and replace the default rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

6. Click "Publish"

## 6. Generate a Service Account Key

1. In the Firebase Console, go to "Project settings" (gear icon in the top left)
2. Click on the "Service accounts" tab
3. Click "Generate new private key"
4. Save the JSON file as `serviceAccountKey.json` in the `Web Version/web-app` directory

## 7. Install Firebase Admin SDK

1. In the project directory, run:
```
cd "Web Version/web-app"
npm install firebase-admin
```

## 8. Run the Firebase Setup Script

1. In the project directory, run:
```
cd "Web Version/web-app"
node deploy-firebase.js
```

This script will create the necessary collections in Firestore.

## 9. Update Firebase Configuration

1. In the Firebase Console, go to "Project settings" (gear icon in the top left)
2. In the "General" tab, scroll down to "Your apps" section
3. If you don't see a web app, click on the web icon (</>) to create one
4. Enter "The Tidy Toad" as the app nickname and click "Register app"
5. Copy the Firebase configuration object
6. Update the `.env` file in the `Web Version/web-app` directory with the values from the configuration object

## 10. Deploy Firebase Rules

1. Install the Firebase CLI:
```
npm install -g firebase-tools
```

2. Log in to Firebase:
```
firebase login
```

3. Deploy the Firebase rules:
```
cd "Web Version/web-app"
node deploy-firebase-rules.js
```

This script will deploy the Firestore and Storage security rules to your Firebase project. It will check if the Firebase CLI is installed and if you are logged in to Firebase before deploying the rules.

## 11. Check Firebase Setup

1. Install the required dependencies:
```
cd "Web Version/web-app"
npm install firebase@9.6.0 dotenv
```

2. Run the Firebase client SDK check script:
```
cd "Web Version/web-app"
node check-firebase-setup.js
```

This script will check if your Firebase project is properly set up by:
- Testing Firebase Authentication (creating and deleting a test user)
- Testing Firestore Database (writing and deleting a test document)
- Testing Firebase Storage (uploading and deleting a test file)

If any of these checks fail, the script will provide error messages to help you troubleshoot the issues.

3. If you're still having issues with Firestore and Storage, try the enhanced check script:
```
cd "Web Version/web-app"
node check-firebase-setup-test.js
```

This script provides more detailed diagnostics and checks for common issues with Firebase setup.

4. Run the Firebase Admin SDK check script:
```
cd "Web Version/web-app"
node check-firebase-admin.js
```

This script will check if your Firebase Admin SDK is properly set up by:
- Verifying that the serviceAccountKey.json file exists and is valid
- Testing Firestore Database access with admin privileges
- Testing Firebase Authentication with admin privileges

This step requires that you have already generated a service account key (step 6) and saved it as `serviceAccountKey.json` in the `Web Version/web-app` directory.

## 12. Start the Application

1. In the project directory, run:
```
cd "Web Version/web-app"
npm start
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Troubleshooting

If you encounter any issues with Firebase, check the following:

1. Make sure the Firebase configuration in the `.env` file is correct
2. Make sure the Email/Password authentication is enabled
3. Make sure the Firestore database and Storage are created
4. Make sure the security rules are properly set
5. Check the browser console for any errors

### Check Firebase Plan

Some Firebase features, like certain Cloud Functions, require the Blaze (pay-as-you-go) plan. To check if your Firebase project is on the Blaze plan, run:

```
cd "Web Version/web-app"
node check-firebase-plan.js
```

This script will provide guidance on how to check your Firebase plan and whether you need to upgrade to use certain features.

### Testing Firebase Rules

You can test your Firebase security rules locally using the Firebase emulator suite. This allows you to verify that your rules are working as expected before deploying them to production.

```
cd "Web Version/web-app"
node test-firebase-rules.js
```

This script will:
1. Start the Firebase emulators for Auth, Firestore, and Storage
2. Run tests against your security rules
3. Provide feedback on whether the rules are working as expected

Prerequisites:
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase emulators installed: `firebase setup:emulators:firestore` and `firebase setup:emulators:storage`

### Additional Troubleshooting Scripts

We've provided several scripts to help you troubleshoot Firebase issues:

1. **check-firebase-setup.js**: Checks if your Firebase project is properly set up
2. **check-firebase-setup-test.js**: Provides more detailed diagnostics for Firebase setup issues
3. **check-firebase-admin.js**: Checks if your Firebase Admin SDK is properly set up
4. **deploy-firebase-rules.js**: Deploys Firestore and Storage security rules to your Firebase project
5. **check-firebase-plan.js**: Checks if your Firebase project is on the Blaze plan
6. **test-firebase-rules.js**: Tests your Firebase security rules locally using the Firebase emulator suite

These scripts can help you identify and fix common issues with Firebase setup.

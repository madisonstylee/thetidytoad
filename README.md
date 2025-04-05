# The Tidy Toad

A fun task management app for kids and parents. The Tidy Toad helps parents create tasks for their children, assign rewards, and track completion. Kids can view and complete tasks, earning rewards in their "Ribbit Reserve."

## Features

- **Parent Dashboard**: Create and manage tasks, approve completed tasks, and set up rewards
- **Child Dashboard**: View assigned tasks, mark them as complete, and track rewards
- **Ribbit Reserve**: A virtual bank where kids can see their earned rewards and redeem them
- **Multiple Children Support**: Parents can manage tasks for multiple children
- **Recurring Tasks**: Set up daily, weekly, or monthly recurring tasks
- **Reward Types**: Money, points, or special rewards
- **Interest Rates**: Teach financial responsibility by setting interest rates for money in the Ribbit Reserve

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/tidy-toad.git
   cd tidy-toad/Web\ Version/web-app
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Create a Firebase project
   - Go to the [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project" and follow the setup steps
   - Enable Authentication (Email/Password)
   - Create a Firestore database

4. Set up environment variables
   - Copy the `.env.example` file to `.env`
   ```
   cp .env.example .env
   ```
   - Update the Firebase configuration values in the `.env` file with your Firebase project details

5. Start the development server
   ```
   npm start
   ```

## Firebase Setup

For detailed Firebase setup instructions, please refer to the [FIREBASE_SETUP.md](FIREBASE_SETUP.md) file.

This guide includes step-by-step instructions for:
- Creating a Firebase project
- Enabling Authentication
- Setting up Firestore Database
- Configuring Storage
- Deploying Security Rules
- Generating a Service Account Key
- Running the Firebase Setup Script

For a reference of all Firebase-related scripts and their usage, please refer to the [FIREBASE_SCRIPTS.md](FIREBASE_SCRIPTS.md) file. This document provides a comprehensive reference for all the Firebase scripts in the application, including:
- Setup scripts
- Testing scripts
- Verification scripts
- Troubleshooting guide

**Important**: If you're having issues with the application not working properly, please follow the instructions in the FIREBASE_SETUP.md file to ensure your Firebase project is set up correctly.

## Deployment

To deploy the application to Firebase Hosting:

1. Install Firebase CLI
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase
   ```
   firebase login
   ```

3. Initialize Firebase in your project
   ```
   firebase init
   ```
   - Select Hosting
   - Select your Firebase project
   - Set the public directory to "build"
   - Configure as a single-page app: Yes
   - Set up automatic builds and deploys with GitHub: No (or Yes if you want to)

4. Build the project
   ```
   npm run build
   ```

5. Deploy to Firebase
   ```
   firebase deploy
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- React and Firebase for making this project possible
- All the parents and kids who provided feedback during development

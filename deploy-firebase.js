const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Get Firestore instance
const db = admin.firestore();

// Enable Email/Password authentication
const auth = admin.auth();

async function setupFirebase() {
  try {
    console.log('Setting up Firebase...');

    // Create Firestore collections
    console.log('Creating Firestore collections...');
    
    // Create users collection
    await db.collection('users').doc('placeholder').set({
      id: 'placeholder',
      role: 'placeholder',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create families collection
    await db.collection('families').doc('placeholder').set({
      id: 'placeholder',
      name: 'Placeholder Family',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Create rewardBanks collection
    await db.collection('rewardBanks').doc('placeholder').set({
      id: 'placeholder',
      childId: 'placeholder',
      money: {
        balance: 0,
        interestRate: 0
      },
      points: {
        balance: 0
      },
      specialRewards: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('Firestore collections created successfully!');
    
    console.log('Firebase setup completed successfully!');
  } catch (error) {
    console.error('Error setting up Firebase:', error);
  } finally {
    // Exit the process
    process.exit(0);
  }
}

// Run the setup
setupFirebase();

// Script to create a test child profile in Firestore
const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  getDocs 
} = require('firebase/firestore');
const { 
  getAuth, 
  signInWithEmailAndPassword 
} = require('firebase/auth');
const { v4: uuidv4 } = require('uuid');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyALbZTg9vRvF3WTJn7Ot98RsRDwGUWGkFA",
  authDomain: "the-tidy-toad.firebaseapp.com",
  projectId: "the-tidy-toad",
  storageBucket: "the-tidy-toad.firebasestorage.app",
  messagingSenderId: "823047932414",
  appId: "1:823047932414:web:edc43ba0ea95814ca358af",
  measurementId: "G-SC37VQF321"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Function to authenticate as parent
async function authenticateAsParent(email, password) {
  try {
    console.log(`Authenticating as parent with email ${email}...`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`Authenticated as ${userCredential.user.email}`);
    return userCredential.user;
  } catch (error) {
    console.error('Error authenticating:', error);
    throw error;
  }
}

// Function to create a child profile
async function createChildProfile(parentEmail, parentPassword, childFirstName, childLastName, pin) {
  try {
    console.log(`Creating child profile for ${childFirstName} ${childLastName} with parent email ${parentEmail}...`);
    
    // Authenticate as parent
    await authenticateAsParent(parentEmail, parentPassword);
    
    // Find parent by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', parentEmail),
      where('role', '==', 'parent')
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      console.error(`No parent found with email ${parentEmail}`);
      return;
    }
    
    const parentDoc = querySnapshot.docs[0];
    const parentData = parentDoc.data();
    const familyId = parentData.familyId;
    const parentId = parentDoc.id;
    
    console.log(`Found parent ${parentData.firstName} ${parentData.lastName} with family ID ${familyId}`);
    
    // Create child ID
    const childId = uuidv4();
    
    // Create child profile data
    const childData = {
      id: childId,
      firstName: childFirstName,
      lastName: childLastName,
      pin: pin,
      familyId: familyId,
      createdBy: parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save child profile to Firestore
    await setDoc(doc(db, 'children', childId), childData);
    console.log(`Child profile created with ID ${childId}`);
    
    // Create reward bank for child
    const rewardBankId = uuidv4();
    await setDoc(doc(db, 'rewardBanks', rewardBankId), {
      id: rewardBankId,
      childId: childId,
      familyId: familyId,
      money: {
        balance: 0,
        currency: 'USD'
      },
      points: {
        balance: 0
      },
      specialRewards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`Reward bank created for child with ID ${rewardBankId}`);
    console.log(`Child profile created successfully!`);
    
    return childData;
  } catch (error) {
    console.error('Error creating child profile:', error);
  }
}

// Main function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log('Usage: node create-test-child.js <parent-email> <parent-password> <child-first-name> <child-last-name> <pin>');
    return;
  }
  
  const parentEmail = args[0];
  const parentPassword = args[1];
  const childFirstName = args[2];
  const childLastName = args[3];
  const pin = args[4];
  
  // Create child profile
  await createChildProfile(parentEmail, parentPassword, childFirstName, childLastName, pin);
  
  console.log('Done!');
  process.exit(0);
}

// Run the main function
main().catch(console.error);

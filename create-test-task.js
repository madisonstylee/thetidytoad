// Script to create a test task in Firestore
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

// Function to create a task
async function createTask(parentEmail, parentPassword, childFirstName, taskTitle, taskDescription, rewardType, rewardValue) {
  try {
    console.log(`Creating task "${taskTitle}" for child ${childFirstName} with parent email ${parentEmail}...`);
    
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
    
    // Find child by first name and family ID
    const childrenQuery = query(
      collection(db, 'children'),
      where('familyId', '==', familyId),
      where('firstName', '==', childFirstName)
    );
    
    const childrenSnapshot = await getDocs(childrenQuery);
    
    if (childrenSnapshot.empty) {
      console.error(`No child found with name ${childFirstName} in family ${familyId}`);
      return;
    }
    
    const childDoc = childrenSnapshot.docs[0];
    const childData = childDoc.data();
    const childId = childData.id;
    
    console.log(`Found child ${childData.firstName} ${childData.lastName} with ID ${childId}`);
    
    // Create task ID
    const taskId = uuidv4();
    
    // Create reward object
    let reward = {};
    
    if (rewardType === 'money') {
      reward = {
        type: 'money',
        value: parseFloat(rewardValue)
      };
    } else if (rewardType === 'points') {
      reward = {
        type: 'points',
        value: parseInt(rewardValue)
      };
    } else if (rewardType === 'special') {
      reward = {
        type: 'special',
        description: rewardValue
      };
    }
    
    // Create task data
    const taskData = {
      id: taskId,
      title: taskTitle,
      description: taskDescription,
      assignedTo: childId,
      status: 'pending',
      reward: reward,
      recurrence: 'none',
      createdBy: parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save task to Firestore
    await setDoc(doc(db, 'families', familyId, 'tasks', taskId), taskData);
    
    console.log(`Task created with ID ${taskId}`);
    console.log(`Task details:
      Title: ${taskTitle}
      Description: ${taskDescription}
      Assigned to: ${childData.firstName} ${childData.lastName}
      Reward: ${rewardType === 'money' ? '$' + rewardValue : rewardType === 'points' ? rewardValue + ' points' : rewardValue}
    `);
    
    return taskData;
  } catch (error) {
    console.error('Error creating task:', error);
  }
}

// Main function
async function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  
  if (args.length < 7) {
    console.log('Usage: node create-test-task.js <parent-email> <parent-password> <child-first-name> <task-title> <task-description> <reward-type> <reward-value>');
    console.log('Reward types: money, points, special');
    console.log('Example: node create-test-task.js parent@example.com password123 Timmy "Clean room" "Make your bed and pick up toys" money 5.00');
    return;
  }
  
  const parentEmail = args[0];
  const parentPassword = args[1];
  const childFirstName = args[2];
  const taskTitle = args[3];
  const taskDescription = args[4];
  const rewardType = args[5];
  const rewardValue = args[6];
  
  // Create task
  await createTask(parentEmail, parentPassword, childFirstName, taskTitle, taskDescription, rewardType, rewardValue);
  
  console.log('Done!');
  process.exit(0);
}

// Run the main function
main().catch(console.error);

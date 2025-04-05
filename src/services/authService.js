import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { auth, db } from './firebase';
import { 
  createParent, 
  createFamily, 
  createChild, 
  createRewardBank 
} from '../data/models';

/**
 * Register a new parent user
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} firstName - User first name
 * @param {string} lastName - User last name
 * @returns {Promise<Object>} - User data
 */
export const registerParent = async (email, password, firstName, lastName) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    // Create family document
    const familyId = uuidv4();
    const familyData = createFamily({
      id: familyId,
      name: `${lastName} Family`,
      mainParentId: user.uid
    });
    
    await setDoc(doc(db, 'families', familyId), familyData);
    
    // Create parent user document
    const parentData = createParent({
      id: user.uid,
      email,
      firstName,
      lastName,
      familyId,
      isMainParent: true
    });
    
    await setDoc(doc(db, 'users', user.uid), parentData);
    
    return parentData;
  } catch (error) {
    console.error('Error registering parent:', error);
    throw error;
  }
};

/**
 * Sign in a parent user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User data
 */
export const signInParent = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    
    // Verify that the user is a parent
    if (userData.role !== 'parent') {
      throw new Error('Invalid user role');
    }
    
    return userData;
  } catch (error) {
    console.error('Error signing in parent:', error);
    throw error;
  }
};

/**
 * Sign in a child user
 * @param {string} username - Child username
 * @param {string} password - Child password
 * @returns {Promise<Object>} - Child user data
 */
export const signInChild = async (username, password) => {
  try {
    console.log(`Attempting to sign in child with username: ${username}`);
    
    // Validate input
    if (!username || !password) {
      console.error('Missing username or password');
      throw new Error('Username and password are required');
    }
    
    // Query for child user with matching username
    const childrenQuery = query(
      collection(db, 'users'),
      where('username', '==', username),
      where('role', '==', 'child')
    );
    
    console.log('Executing Firestore query for child user');
    const querySnapshot = await getDocs(childrenQuery);
    
    console.log(`Query returned ${querySnapshot.size} results`);
    
    if (querySnapshot.empty) {
      console.error(`No child found with username: ${username}`);
      throw new Error('Child not found');
    }
    
    // Get the first matching child
    const childDoc = querySnapshot.docs[0];
    const childData = childDoc.data();
    
    console.log(`Found child: ${childData.firstName} ${childData.lastName}`);
    
    // In a real app, you would verify the password here with proper hashing
    // For this demo, we'll just check if the password matches
    // In production, you would use a secure authentication method
    if (childData.password !== password) {
      console.error('Password does not match');
      throw new Error('Invalid password');
    }
    
    // Add additional logging to help debug
    console.log('Password verified successfully');
    
    console.log('Child login successful');
    
    // Ensure all required fields are present
    if (!childData.id || !childData.familyId || !childData.role) {
      console.error('Child data is missing required fields:', childData);
      throw new Error('Invalid child data');
    }
    
    // Add additional logging for debugging
    console.log('Child data validation passed, returning data:', childData);
    
    return childData;
  } catch (error) {
    console.error('Error signing in child:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Send a password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

/**
 * Get the current user data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Update a user's profile
 * @param {Object} userData - User data to update
 * @returns {Promise<void>}
 */
export const updateUserProfile = async (userData) => {
  try {
    const { id, ...updateData } = userData;
    
    await updateDoc(doc(db, 'users', id), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Add a child to a family
 * @param {Object} childData - Child data
 * @returns {Promise<Object>} - Child user data
 */
export const addChild = async (childData) => {
  try {
    console.log('Adding child with data:', childData);
    
    // Validate required fields
    if (!childData.firstName || !childData.lastName || !childData.username || !childData.password || !childData.familyId) {
      throw new Error('Missing required fields for child creation');
    }
    
    const childId = uuidv4();
    
    // Create child user document
    const newChildData = createChild({
      id: childId,
      firstName: childData.firstName,
      lastName: childData.lastName,
      username: childData.username,
      password: childData.password, // In a real app, this would be hashed
      familyId: childData.familyId,
      profilePicture: childData.profilePicture || null,
      role: 'child'
    });
    
    console.log('Creating child document with data:', newChildData);
    await setDoc(doc(db, 'users', childId), newChildData);
    
    // Create reward bank for the child
    const rewardBankId = uuidv4();
    const rewardBankData = createRewardBank({
      id: rewardBankId,
      childId
    });
    
    console.log('Creating reward bank with data:', rewardBankData);
    await setDoc(doc(db, 'rewardBanks', rewardBankId), rewardBankData);
    
    return newChildData;
  } catch (error) {
    console.error('Error adding child:', error);
    throw error;
  }
};

/**
 * Update a child's profile
 * @param {Object} childData - Child data to update
 * @returns {Promise<void>}
 */
export const updateChildProfile = async (childData) => {
  try {
    const { id, ...updateData } = childData;
    
    await updateDoc(doc(db, 'users', id), {
      ...updateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating child profile:', error);
    throw error;
  }
};

/**
 * Remove a child from a family
 * @param {string} childId - Child ID
 * @returns {Promise<void>}
 */
export const removeChild = async (childId) => {
  try {
    // Delete child user document
    await deleteDoc(doc(db, 'users', childId));
    
    // Query for child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    // Delete reward bank documents
    querySnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error('Error removing child:', error);
    throw error;
  }
};

/**
 * Get children by family ID
 * @param {string} familyId - Family ID
 * @returns {Promise<Array>} - Array of child user data
 */
export const getChildrenByFamilyId = async (familyId) => {
  try {
    const childrenQuery = query(
      collection(db, 'users'),
      where('familyId', '==', familyId),
      where('role', '==', 'child')
    );
    
    const querySnapshot = await getDocs(childrenQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting children by family ID:', error);
    throw error;
  }
};

/**
 * Get a child by ID
 * @param {string} childId - Child ID
 * @returns {Promise<Object>} - Child user data
 */
export const getChildById = async (childId) => {
  try {
    const childDoc = await getDoc(doc(db, 'users', childId));
    
    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }
    
    return childDoc.data();
  } catch (error) {
    console.error('Error getting child by ID:', error);
    throw error;
  }
};

/**
 * Add another parent to a family
 * @param {Object} parentData - Parent data
 * @returns {Promise<Object>} - Parent user data
 */
export const addParent = async (parentData) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, parentData.email, parentData.password);
    const user = userCredential.user;
    
    // Update display name in Firebase Auth
    await updateProfile(user, {
      displayName: `${parentData.firstName} ${parentData.lastName}`
    });
    
    // Create parent user document
    const newParentData = createParent({
      id: user.uid,
      email: parentData.email,
      firstName: parentData.firstName,
      lastName: parentData.lastName,
      familyId: parentData.familyId,
      isMainParent: false
    });
    
    await setDoc(doc(db, 'users', user.uid), newParentData);
    
    return newParentData;
  } catch (error) {
    console.error('Error adding parent:', error);
    throw error;
  }
};

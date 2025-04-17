import { auth } from './firebase';
import { createUserWithEmailAndPassword, updateProfile, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';
import { clearSession } from './sessionService';

/**
 * Signs up a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {string} role - User's role (parent or child)
 * @returns {Promise<Object>} - User data
 */
export const signUp = async (email, password, firstName, lastName, role) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName: `${firstName} ${lastName}` });
    
    // Create user document in Firestore
    const userData = {
      id: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await setDoc(doc(db, "users", user.uid), userData);
    
    return userData;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

/**
 * Gets user data from Firestore
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - User data
 */
export const getUserData = async (userId) => {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error('Error getting user data:', error);
    throw error;
  }
};

/**
 * Updates user profile in Firestore
 * @param {Object} data - User data to update
 * @returns {Promise<Object>} - Updated user data
 */
export const updateUserProfile = async (data) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('No user logged in');
    }
    
    // Update display name if first name or last name is provided
    if (data.firstName || data.lastName) {
      const displayName = `${data.firstName || user.displayName.split(' ')[0]} ${data.lastName || user.displayName.split(' ')[1] || ''}`.trim();
      await updateProfile(user, { displayName });
    }
    
    // Update user document in Firestore
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, data);
    
    // Get updated user data from Firestore
    const updatedData = await getUserData(user.uid);
    
    return updatedData;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Register a parent user
 * @param {string} email - Parent's email
 * @param {string} password - Parent's password
 * @param {string} firstName - Parent's first name
 * @param {string} lastName - Parent's last name
 * @returns {Promise<Object>} - Parent data
 */
export const registerParent = async (email, password, firstName, lastName) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName: `${firstName} ${lastName}` });
    
    // Create family ID
    const familyId = uuidv4();
    
    // Create user document in Firestore
    const userData = {
      id: user.uid,
      email: user.email,
      firstName: firstName,
      lastName: lastName,
      role: 'parent',
      familyId: familyId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), userData);
    
    // Create family document
    await setDoc(doc(db, "families", familyId), {
      id: familyId,
      name: `${lastName} Family`,
      createdBy: user.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return userData;
  } catch (error) {
    console.error('Error registering parent:', error);
    throw error;
  }
};

/**
 * Register a child user
 * @param {string} firstName - Child's first name
 * @param {string} lastName - Child's last name
 * @param {string} pin - Child's PIN
 * @param {string} familyId - Family ID
 * @param {string} parentId - Parent ID
 * @returns {Promise<Object>} - Child data
 */
export const registerChild = async (firstName, lastName, pin, familyId, parentId) => {
  try {
    // Create child ID
    const childId = uuidv4();
    
    // Create child document in Firestore
    const childData = {
      id: childId,
      firstName: firstName,
      lastName: lastName,
      pin: pin,
      familyId: familyId,
      createdBy: parentId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  

    // Save child data to Firestore
    await setDoc(doc(db, "children", childId), childData);
    
    // Create reward bank for child
    await setDoc(doc(db, "rewardBanks", uuidv4()), {
      childId: childId,
      familyId: familyId,
      money: {
        balance: 0,
        currency: 'USD',
        interestRate: 0.05, // Default 5% interest rate
        dispensedTotal: 0
      },
      points: {
        balance: 0,
        dispensedTotal: 0
      },
      specialRewards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return childData;
  } catch (error) {
    console.error('Error registering child:', error);
    throw error;
  }
};

/**
 * Find child profile by family email and child name
 * @param {string} familyEmail - Family email
 * @param {string} childName - Child's first name
 * @returns {Promise<Object>} - Child profile
 */
export const findChildProfile = async (familyEmail, childName) => {
  try {
    // Find parent by email
    const usersQuery = query(
      collection(db, "users"),
      where("email", "==", familyEmail),
      where("role", "==", "parent")
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Family not found');
    }
    
    const parentDoc = querySnapshot.docs[0];
    const parentData = parentDoc.data();
    const familyId = parentData.familyId;
    
    // Find child by first name and family ID
    const childrenQuery = query(
      collection(db, "children"),
      where("familyId", "==", familyId),
      where("firstName", "==", childName)
    );
    
    const childrenSnapshot = await getDocs(childrenQuery);
    
    if (childrenSnapshot.empty) {
      throw new Error('Child not found');
    }
    
    return childrenSnapshot.docs[0].data();
  } catch (error) {
    console.error('Error finding child profile:', error);
    throw error;
  }
};

/**
 * Verify child PIN
 * @param {string} childId - Child ID
 * @param {string} pin - PIN to verify
 * @returns {Promise<boolean>} - Whether PIN is valid
 */
export const verifyChildPin = async (childId, pin) => {
  try {
    const childDoc = await getDoc(doc(db, "children", childId));
    
    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }
    
    const childData = childDoc.data();
    
    return childData.pin === pin;
  } catch (error) {
    console.error('Error verifying child PIN:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    // Clear child session if exists
    clearSession();
    
    // Sign out from Firebase Auth
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Sign in a parent user with email and password
 * @param {string} email - Parent's email
 * @param {string} password - Parent's password
 * @returns {Promise<Object>} - User credential
 */
export const signInParent = async (email, password) => {
  try {
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Get user data from Firestore
    const userData = await getUserData(userCredential.user.uid);
    
    // Verify that the user is a parent
    if (userData.role !== 'parent') {
      throw new Error('This account is not a parent account');
    }
    
    return userCredential;
  } catch (error) {
    console.error('Error signing in parent:', error);
    throw error;
  }
};

/**
 * Get all children in a family
 * @param {string} familyId - Family ID
 * @returns {Promise<Array>} - Array of child data
 */
export const getChildrenByFamilyId = async (familyId) => {
  try {
    // First try to get from children collection (new system)
    const childrenQuery = query(
      collection(db, "children"),
      where("familyId", "==", familyId)
    );
    
    const childrenSnapshot = await getDocs(childrenQuery);
    const childrenData = childrenSnapshot.docs.map(doc => doc.data());
    
    // Also get from users collection with role=child (old system)
    const usersQuery = query(
      collection(db, "users"),
      where("familyId", "==", familyId),
      where("role", "==", "child")
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const childUsersData = usersSnapshot.docs.map(doc => doc.data());
    
    // Combine both results
    return [...childrenData, ...childUsersData];
  } catch (error) {
    console.error('Error getting children by family ID:', error);
    throw error;
  }
};

/**
 * Add a child to a family
 * @param {Object} childData - Child data
 * @returns {Promise<Object>} - Created child data
 */
export const addChild = async (childData) => {
  try {
    // Create child ID
    const childId = uuidv4();
    
    // Create child document in Firestore
    const newChildData = {
      id: childId,
      firstName: childData.firstName,
      lastName: childData.lastName,
      pin: childData.password, // Use password as PIN
      familyId: childData.familyId,
      createdBy: auth.currentUser.uid,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add profile picture if provided
    if (childData.profilePicture) {
      newChildData.profilePicture = childData.profilePicture;
    }
    
    // Save child data to Firestore
    await setDoc(doc(db, "children", childId), newChildData);
    
    // Create reward bank for child
    await setDoc(doc(db, "rewardBanks", uuidv4()), {
      childId: childId,
      familyId: childData.familyId,
      money: {
        balance: 0,
        currency: 'USD',
        interestRate: 0.05, // Default 5% interest rate
        dispensedTotal: 0
      },
      points: {
        balance: 0,
        dispensedTotal: 0
      },
      specialRewards: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    return newChildData;
  } catch (error) {
    console.log(auth.currentUser.uid);
    console.error('Error adding child:', error);
    throw error;
  }
};

/**
 * Update a child's profile
 * @param {Object} childData - Child data to update
 * @returns {Promise<Object>} - Updated child data
 */
export const updateChildProfile = async (childData) => {
  try {
    // Get child document reference
    const childRef = doc(db, "children", childData.id);
    
    // Create update object
    const updateData = {
      firstName: childData.firstName,
      lastName: childData.lastName,
      updatedAt: new Date()
    };
    
    // Add PIN if provided
    if (childData.password) {
      updateData.pin = childData.password;
    }
    
    // Add profile picture if provided
    if (childData.profilePicture) {
      updateData.profilePicture = childData.profilePicture;
    }
    
    // Update child document in Firestore
    await updateDoc(childRef, updateData);
    
    // Get updated child data
    const updatedChildDoc = await getDoc(childRef);
    
    return updatedChildDoc.data();
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
    // Delete child document from Firestore
    await deleteDoc(doc(db, "children", childId));
    
    // Find and delete reward bank
    const rewardBanksQuery = query(
      collection(db, "rewardBanks"),
      where("childId", "==", childId)
    );
    
    const rewardBanksSnapshot = await getDocs(rewardBanksQuery);
    
    if (!rewardBanksSnapshot.empty) {
      const rewardBankDoc = rewardBanksSnapshot.docs[0];
      await deleteDoc(doc(db, "rewardBanks", rewardBankDoc.id));
    }
  } catch (error) {
    console.error('Error removing child:', error);
    throw error;
  }
};

/**
 * Add a parent to a family
 * @param {Object} parentData - Parent data
 * @returns {Promise<Object>} - Created parent data
 */
export const addParent = async (parentData) => {
  try {
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, parentData.email, parentData.password);
    const user = userCredential.user;
    
    // Update user profile
    await updateProfile(user, { displayName: `${parentData.firstName} ${parentData.lastName}` });
    
    // Create user document in Firestore
    const userData = {
      id: user.uid,
      email: parentData.email,
      firstName: parentData.firstName,
      lastName: parentData.lastName,
      role: 'parent',
      familyId: parentData.familyId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Add profile picture if provided
    if (parentData.profilePicture) {
      userData.profilePicture = parentData.profilePicture;
    }
    
    // Save user data to Firestore
    await setDoc(doc(db, "users", user.uid), userData);
    
    return userData;
  } catch (error) {
    console.error('Error adding parent:', error);
    throw error;
  }
};

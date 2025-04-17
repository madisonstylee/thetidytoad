import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { createChildProfile, createSession } from '../data/models';

// Session storage keys
const SESSION_KEY = 'tidy_toad_session';
const CHILD_PROFILE_KEY = 'tidy_toad_child_profile';

/**
 * Create a new child profile
 * @param {Object} profileData - Child profile data
 * @param {string} familyId - Family ID
 * @returns {Promise<Object>} - Created child profile data
 */
export const createNewChildProfile = async (profileData, familyId) => {
  try {
    const profileId = uuidv4();
    
    // Create child profile document
    const newProfileData = createChildProfile({
      id: profileId,
      familyId,
      ...profileData
    });
    
    // Save profile to Firestore
    await setDoc(doc(db, 'children', profileId), newProfileData);
    
    return newProfileData;
  } catch (error) {
    console.error('Error creating child profile:', error);
    throw error;
  }
};

/**
 * Get child profiles for a family
 * @param {string} familyId - Family ID
 * @returns {Promise<Array>} - Array of child profile data
 */
export const getChildProfilesByFamilyId = async (familyId) => {
  try {
    const profilesQuery = query(
      collection(db, 'children'),
      where('familyId', '==', familyId),
      orderBy('firstName', 'asc')
    );
    
    const querySnapshot = await getDocs(profilesQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting child profiles by family ID:', error);
    throw error;
  }
};

/**
 * Get a child profile by ID
 * @param {string} profileId - Child profile ID
 * @returns {Promise<Object>} - Child profile data
 */
export const getChildProfileById = async (profileId) => {
  try {
    const profileDoc = await getDoc(doc(db, 'children', profileId));
    
    if (!profileDoc.exists()) {
      throw new Error('Child profile not found');
    }
    
    return profileDoc.data();
  } catch (error) {
    console.error('Error getting child profile by ID:', error);
    throw error;
  }
};

/**
 * Update a child profile
 * @param {string} profileId - Child profile ID
 * @param {Object} profileData - Child profile data to update
 * @returns {Promise<Object>} - Updated child profile data
 */
export const updateChildProfile = async (profileId, profileData) => {
  try {
    const profileRef = doc(db, 'children', profileId);
    
    // Get current profile data
    const profileDoc = await getDoc(profileRef);
    
    if (!profileDoc.exists()) {
      throw new Error('Child profile not found');
    }
    
    const currentData = profileDoc.data();
    
    // Update profile data
    const updatedData = {
      ...currentData,
      ...profileData,
      updatedAt: new Date()
    };
    
    // Save updated profile to Firestore
    await setDoc(profileRef, updatedData);
    
    return updatedData;
  } catch (error) {
    console.error('Error updating child profile:', error);
    throw error;
  }
};

/**
 * Delete a child profile
 * @param {string} profileId - Child profile ID
 * @returns {Promise<void>}
 */
export const deleteChildProfile = async (profileId) => {
  try {
    await deleteDoc(doc(db, 'children', profileId));
  } catch (error) {
    console.error('Error deleting child profile:', error);
    throw error;
  }
};

/**
 * Find a child profile by family email and first name
 * @param {string} familyEmail - Family email
 * @param {string} firstName - Child's first name
 * @returns {Promise<Object|null>} - Child profile data or null if not found
 */
export const findChildProfile = async (familyEmail, firstName) => {
  try {
    // First, find the family by email
    const usersQuery = query(
      collection(db, 'users'),
      where('email', '==', familyEmail),
      where('role', '==', 'parent'),
      limit(1)
    );
    
    const userSnapshot = await getDocs(usersQuery);
    
    if (userSnapshot.empty) {
      return null;
    }
    
    const parentData = userSnapshot.docs[0].data();
    const familyId = parentData.familyId;
    
    // Then, find the child profile by family ID and first name
    const profilesQuery = query(
      collection(db, 'children'),
      where('familyId', '==', familyId),
      where('firstName', '==', firstName)
    );
    
    const profileSnapshot = await getDocs(profilesQuery);
    
    if (profileSnapshot.empty) {
      return null;
    }
    
    return profileSnapshot.docs[0].data();
  } catch (error) {
    console.error('Error finding child profile:', error);
    throw error;
  }
};

/**
 * Verify child PIN
 * @param {string} profileId - Child profile ID
 * @param {string} pin - PIN to verify
 * @returns {Promise<boolean>} - Whether the PIN is valid
 */
export const verifyChildPin = async (profileId, pin) => {
  try {
    const profileDoc = await getDoc(doc(db, 'children', profileId));
    
    if (!profileDoc.exists()) {
      return false;
    }
    
    const profileData = profileDoc.data();
    
    return profileData.pin === pin;
  } catch (error) {
    console.error('Error verifying child PIN:', error);
    return false;
  }
};

/**
 * Create a child session
 * @param {Object} childProfile - Child profile data
 * @returns {Object} - Session data
 */
export const createChildSession = (childProfile) => {
  const sessionData = createSession({
    familyId: childProfile.familyId,
    childId: childProfile.id
  });
  
  // Store session in localStorage
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  localStorage.setItem(CHILD_PROFILE_KEY, JSON.stringify(childProfile));
  
  return sessionData;
};

/**
 * Get current child session
 * @returns {Object|null} - Session data or null if no session
 */
export const getCurrentSession = () => {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    
    if (!sessionData) {
      return null;
    }
    
    const session = JSON.parse(sessionData);
    
    // Check if session has expired
    if (new Date(session.expiresAt) < new Date()) {
      clearSession();
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Error getting current session:', error);
    return null;
  }
};

/**
 * Get current child profile
 * @returns {Object|null} - Child profile data or null if no session
 */
export const getCurrentChildProfile = () => {
  try {
    const profileData = localStorage.getItem(CHILD_PROFILE_KEY);
    
    if (!profileData) {
      return null;
    }
    
    return JSON.parse(profileData);
  } catch (error) {
    console.error('Error getting current child profile:', error);
    return null;
  }
};

/**
 * Clear current session
 */
export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CHILD_PROFILE_KEY);
};

/**
 * Check if user is in child mode
 * @returns {boolean} - Whether the user is in child mode
 */
export const isChildMode = () => {
  return !!getCurrentSession();
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserData } from '../services/authService';

// Create the context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);
      setLoading(true);
      
      if (user) {
        try {
          // Add a small delay to ensure Firestore document is created
          // This helps with the race condition after registration
          setTimeout(async () => {
            try {
              // Get additional user data from Firestore
              const data = await getUserData(user.uid);
              console.log('User data loaded:', data);
              setUserData(data);
              setLoading(false);
            } catch (error) {
              console.error('Error getting user data:', error);
              setError('Failed to load user data. Please try again later.');
              setLoading(false);
            }
          }, 1000);
        } catch (error) {
          console.error('Error in auth state change handler:', error);
          setError('Failed to load user data. Please try again later.');
          setLoading(false);
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Child login (doesn't use Firebase Auth)
  const childLogin = async (childData) => {
    console.log('Child login called with data:', childData);
    
    // Validate child data
    if (!childData || !childData.id || !childData.role || childData.role !== 'child') {
      console.error('Invalid child data:', childData);
      throw new Error('Invalid child data');
    }
    
    setCurrentUser(null); // No Firebase Auth user for children
    setUserData(childData);
    
    // Set loading to false to ensure UI updates
    setLoading(false);
    
    console.log('Child login successful, userData set to:', childData);
    return childData;
  };

  // Child logout
  const childLogout = () => {
    setCurrentUser(null);
    setUserData(null);
  };

  // Update user data in context
  const updateUser = (data) => {
    // Merge the new data with the existing userData
    setUserData(prevData => ({
      ...prevData,
      ...data,
      updatedAt: new Date()
    }));
  };

  // Value to be provided by the context
  const value = {
    currentUser,
    userData,
    loading,
    error,
    childLogin,
    childLogout,
    updateUser,
    isParent: userData?.role === 'parent',
    isChild: userData?.role === 'child',
    isLoggedIn: !!userData
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

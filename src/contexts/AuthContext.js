import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUserData, updateUserProfile } from '../services/authService';
import { 
  getCurrentSession, 
  getCurrentChildProfile, 
  clearSession, 
  isChildMode 
} from '../services/sessionService';

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
  const [childProfile, setChildProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState('parent'); // 'parent' or 'child'

  // Check for existing child session on mount
  useEffect(() => {
    const checkChildSession = () => {
      if (isChildMode()) {
        const session = getCurrentSession();
        const profile = getCurrentChildProfile();
        
        if (session && profile) {
          console.log('Child session found:', profile.firstName);
          setChildProfile(profile);
          setAuthMode('child');
          setLoading(false);
          return true;
        }
      }
      return false;
    };
    
    // If there's a valid child session, don't proceed with parent auth
    if (!checkChildSession()) {
      // Continue with normal parent authentication
      setAuthMode('parent');
    }
  }, []);

  // Listen for parent auth state changes
  useEffect(() => {
    // Skip if in child mode
    if (authMode === 'child') {
      return () => {};
    }
    
    // Set loading state immediately
    setLoading(true);
    
    // Set a safety timeout to ensure loading state is set to false
    // even if there are issues with authentication
    const safetyTimeout = setTimeout(() => {
      console.log('Safety timeout triggered - forcing loading to false');
      setLoading(false);
    }, 5000); // 5 seconds timeout
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setCurrentUser(user);
      
      try {
        if (user) {
          try {
            // Get additional user data from Firestore immediately without delay
            const data = await getUserData(user.uid);
            console.log('User data loaded:', data);
            setUserData(data);
          } catch (error) {
            console.error('Error getting user data:', error);
            setError('Failed to load user data. Please try again later.');
            // Still set userData to null if there's an error
            setUserData(null);
          }
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error('Unexpected error in auth state change:', error);
        // Ensure userData is set to null in case of any error
        setUserData(null);
      } finally {
        // Always set loading to false, even if there's an error
        clearTimeout(safetyTimeout);
        setLoading(false);
      }
    }, (error) => {
      // Handle any errors in the onAuthStateChanged observer
      console.error('Auth state observer error:', error);
      setError('Authentication error. Please try again later.');
      setCurrentUser(null);
      setUserData(null);
      clearTimeout(safetyTimeout);
      setLoading(false);
    });

    return () => {
      clearTimeout(safetyTimeout);
      unsubscribe();
    };
  }, [authMode]);

  const updateUser = async (data) => {
    try {
      const updatedData = await updateUserProfile(data);
      setUserData(prevData => ({ ...prevData, ...updatedData }));
      return updatedData;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Set child profile and mode
  const setChildMode = (profile) => {
    setChildProfile(profile);
    setAuthMode('child');
    setCurrentUser(null);
    setUserData(null);
  };
  
  // Clear child session and switch to parent mode
  const clearChildMode = () => {
    clearSession();
    setChildProfile(null);
    setAuthMode('parent');
  };

  const value = {
    currentUser,
    userData,
    childProfile,
    loading,
    error,
    updateUser,
    setChildMode,
    clearChildMode,
    isParent: authMode === 'parent' && userData?.role === 'parent',
    isChild: authMode === 'child',
    isLoggedIn: (authMode === 'parent' && !!userData) || (authMode === 'child' && !!childProfile),
    authMode
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

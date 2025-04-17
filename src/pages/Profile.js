import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { getChildrenByFamilyId, addChild, updateChildProfile, removeChild, addParent } from '../services/authService';
import Loading from '../components/Loading';
import ToadMascot from '../components/ToadMascot';

// Styled container
const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Styled profile sections container for side-by-side layout
const ProfileSectionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// Styled header section
const HeaderSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

// Styled header text
const HeaderText = styled.div`
  flex: 1;
`;

// Styled heading
const Heading = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

// Styled subheading
const Subheading = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
`;

// Styled button
const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled section
const Section = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  padding: 1.5rem;
`;

// Styled section title
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  font-family: var(--font-family-fun);
`;

// Styled profile form
const ProfileForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

// Styled form group
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

// Styled form row
const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

// Styled form actions
const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

// Styled submit button
const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled profile picture container
const ProfilePictureContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// Styled profile picture
const ProfilePicture = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--background-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--text-color);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Styled upload button
const UploadButton = styled.label`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  text-align: center;
  
  &:hover {
    background-color: var(--primary-color-dark);
  }
  
  input {
    display: none;
  }
`;

// Styled family section
const FamilySection = styled.div`
  margin-top: 2rem;
`;

// Styled family list
const FamilyList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

// Styled family card
const FamilyCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
`;

// Styled family member info
const FamilyMemberInfo = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

// Styled family member avatar
const FamilyMemberAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: var(--background-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-color);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

// Styled family member details
const FamilyMemberDetails = styled.div`
  flex: 1;
`;

// Styled family member name
const FamilyMemberName = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
  color: var(--text-color);
`;

// Styled family member role
const FamilyMemberRole = styled.div`
  font-size: 0.9rem;
  color: var(--text-color-light);
`;

// Styled family member actions
const FamilyMemberActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: auto;
`;

// Styled action button
const ActionButton = styled.button`
  background-color: ${props => {
    if (props.edit) return 'var(--primary-color)';
    if (props.delete) return 'var(--error-color)';
    return 'var(--accent-color)';
  }};
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => {
      if (props.edit) return 'var(--primary-color-dark)';
      if (props.delete) return 'var(--error-color-dark, #D32F2F)';
      return 'var(--accent-color-dark)';
    }};
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled modal backdrop
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

// Styled modal
const Modal = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-lg);
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

// Styled modal header
const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

// Styled modal title
const ModalTitle = styled.h2`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  margin: 0;
`;

// Styled close button
const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-color-light);
  
  &:hover {
    color: var(--text-color);
  }
`;

// Styled empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--text-color-light);
`;

/**
 * Profile component for managing user profile and family
 * @returns {JSX.Element} - Rendered component
 */
const Profile = ({ alerts }) => {
  const navigate = useNavigate();
  const { userData, childProfile, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [children, setChildren] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('addChild');
  const [selectedMember, setSelectedMember] = useState(null);
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    profilePicture: null
  });
  
  // Family member form state
  const [familyMemberData, setFamilyMemberData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    profilePicture: null
  });
  
  // Load user data and children
  useEffect(() => {
    const loadData = async () => {
      if (userData) {
        // Set profile data
        setProfileData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || '',
          profilePicture: userData.profilePicture || null
        });
        
        // Load children if user is a parent
        if (userData.role === 'parent' && userData.familyId) {
          try {
            const childrenData = await getChildrenByFamilyId(userData.familyId);
            setChildren(childrenData);
          } catch (error) {
            console.error('Error loading children:', error);
            if (alerts) {
              alerts.error('Failed to load family members. Please try again.');
            }
          }
        }
      } else if (childProfile) {
        // Set profile data from child profile
        setProfileData({
          firstName: childProfile.firstName || '',
          lastName: childProfile.lastName || '',
          username: childProfile.username || '',
          profilePicture: childProfile.profilePicture || null
        });
      }
      
      setLoading(false);
    };
    
    loadData();
  }, [userData, childProfile, alerts]);
  
  // Handle profile form input change
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle profile picture change
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!profileData.firstName || !profileData.lastName) {
      if (alerts) {
        alerts.error('Please enter your first and last name');
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Create a clean update object with only the fields we want to update
      const updateData = {
        id: userData.id,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      };
      
      // Only include profilePicture if it exists and has changed
      if (profileData.profilePicture && profileData.profilePicture !== userData.profilePicture) {
        updateData.profilePicture = profileData.profilePicture;
      }
      
      // Update user profile using the updateUser function from AuthContext
      await updateUser(updateData);
      
      if (alerts) {
        alerts.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      if (alerts) {
        alerts.error('Failed to update profile. Please try again.');
      }
    }
    
    setSubmitting(false);
  };
  
  // Handle family member form input change
  const handleFamilyMemberInputChange = (e) => {
    const { name, value } = e.target;
    setFamilyMemberData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle family member picture change
  const handleFamilyMemberPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFamilyMemberData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Open add child modal
  const handleOpenAddChildModal = () => {
    setModalMode('addChild');
    setSelectedMember(null);
    setFamilyMemberData({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      confirmPassword: '',
      profilePicture: null
    });
    setShowModal(true);
  };
  
  // Open add parent modal
  const handleOpenAddParentModal = () => {
    setModalMode('addParent');
    setSelectedMember(null);
    setFamilyMemberData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      profilePicture: null
    });
    setShowModal(true);
  };
  
  // Open edit child modal
  const handleOpenEditChildModal = (child) => {
    setModalMode('editChild');
    setSelectedMember(child);
    setFamilyMemberData({
      firstName: child.firstName || '',
      lastName: child.lastName || '',
      username: child.username || '',
      password: '',
      confirmPassword: '',
      profilePicture: child.profilePicture || null
    });
    setShowModal(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Handle family member form submission
  const handleFamilyMemberSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!familyMemberData.firstName || !familyMemberData.lastName) {
      if (alerts) {
        alerts.error('Please enter first and last name');
      }
      return;
    }
    
    if (modalMode === 'addChild' || modalMode === 'addParent') {
      if (!familyMemberData.password || !familyMemberData.confirmPassword) {
        if (alerts) {
          alerts.error('Please enter a password');
        }
        return;
      }
      
      if (familyMemberData.password !== familyMemberData.confirmPassword) {
        if (alerts) {
          alerts.error('Passwords do not match');
        }
        return;
      }
      
      if (modalMode === 'addChild' && !familyMemberData.username) {
        if (alerts) {
          alerts.error('Please enter a username');
        }
        return;
      }
      
      if (modalMode === 'addParent' && !familyMemberData.email) {
        if (alerts) {
          alerts.error('Please enter an email');
        }
        return;
      }
    }
    
    setSubmitting(true);
    
    try {
      if (modalMode === 'addChild') {
        // Add child
        const childData = {
          firstName: familyMemberData.firstName,
          lastName: familyMemberData.lastName,
          username: familyMemberData.username,
          password: familyMemberData.password,
          profilePicture: familyMemberData.profilePicture,
          familyId: userData.familyId
        };
        
        await addChild(childData);
        
        if (alerts) {
          alerts.success('Child added successfully');
        }
      } else if (modalMode === 'editChild') {
        // Update child
        const childData = {
          id: selectedMember.id,
          firstName: familyMemberData.firstName,
          lastName: familyMemberData.lastName,
          username: familyMemberData.username,
          password: familyMemberData.password || undefined,
          profilePicture: familyMemberData.profilePicture
        };
        
        await updateChildProfile(childData);
        
        if (alerts) {
          alerts.success('Child updated successfully');
        }
      } else if (modalMode === 'addParent') {
        // Add parent
        const parentData = {
          firstName: familyMemberData.firstName,
          lastName: familyMemberData.lastName,
          email: familyMemberData.email,
          password: familyMemberData.password,
          profilePicture: familyMemberData.profilePicture,
          familyId: userData.familyId
        };
        
        await addParent(parentData);
        
        if (alerts) {
          alerts.success('Parent added successfully. The new parent can log in with their email and password.');
        }
        
        // Store the current user's email to help them log back in
        const currentUserEmail = userData.email;
        
        // Redirect to login page with a message
        navigate('/login', { 
          state: { 
            message: 'Please log back in with your email and password.',
            email: currentUserEmail
          } 
        });
        
        // Return early since we're redirecting
        return;
      }
      
      // Refresh children list
      const childrenData = await getChildrenByFamilyId(userData.familyId);
      setChildren(childrenData);
      
      // Close modal
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting family member:', error);
      
      if (alerts) {
        alerts.error(`Failed to ${modalMode === 'editChild' ? 'update' : 'add'} family member. Please try again.`);
      }
    }
    
    setSubmitting(false);
  };
  
  // Handle child deletion
  const handleDeleteChild = async (childId) => {
    if (window.confirm('Are you sure you want to remove this child? This action cannot be undone.')) {
      try {
        // First find and delete tasks assigned to this child
        try {
          const tasksQuery = query(
            collection(db, 'families', userData.familyId, 'tasks'),
            where('assignedTo', '==', childId)
          );
          
          const tasksSnapshot = await getDocs(tasksQuery);
          
          // Delete each task
          const taskDeletions = tasksSnapshot.docs.map(doc => 
            deleteDoc(doc.ref)
          );
          
          await Promise.all(taskDeletions);
          console.log(`Deleted ${taskDeletions.length} tasks for child ${childId}`);
        } catch (taskError) {
          console.error('Error deleting child tasks:', taskError);
          // Continue with child deletion even if task deletion fails
        }
        
        // Now delete the child
        await removeChild(childId);
        
        // Refresh children list
        const childrenData = await getChildrenByFamilyId(userData.familyId);
        setChildren(childrenData);
        
        if (alerts) {
          alerts.success('Child removed successfully');
        }
      } catch (error) {
        console.error('Error removing child:', error);
        
        if (alerts) {
          alerts.error('Failed to remove child. Please try again.');
        }
      }
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = (firstName, lastName) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };
  
  // Show loading indicator while data is loading
  if (loading) {
    return <Loading message="Loading profile..." />;
  }
  
  return (
    <ProfileContainer>
      <HeaderSection>
        <ToadMascot size={100} message="Manage your profile!" />
        <HeaderText>
          <Heading>Family Settings</Heading>
          <Subheading>Update your profile and manage your family</Subheading>
        </HeaderText>
      </HeaderSection>
      
      <ProfileSectionsContainer>
        <Section>
          <SectionTitle>Your Profile</SectionTitle>
          
          <ProfileForm onSubmit={handleProfileSubmit}>
            <ProfilePictureContainer>
              <ProfilePicture>
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="Profile" />
                ) : (
                  getUserInitials(profileData.firstName, profileData.lastName)
                )}
              </ProfilePicture>
              
              <UploadButton>
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </UploadButton>
            </ProfilePictureContainer>
            
            <FormRow>
              <FormGroup>
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={profileData.firstName}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your first name"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={profileData.lastName}
                  onChange={handleProfileInputChange}
                  placeholder="Enter your last name"
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={profileData.email}
                disabled
                readOnly
              />
            </FormGroup>
            
            <FormActions>
              <SubmitButton type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Changes'}
              </SubmitButton>
            </FormActions>
          </ProfileForm>
        </Section>
        
        {userData.role === 'parent' && (
          <Section>
            <SectionTitle>Family Members</SectionTitle>
            
            <FamilyList>
              {children.length > 0 ? (
                children.map(child => (
                  <FamilyCard key={child.id}>
                    <FamilyMemberInfo>
                      <FamilyMemberAvatar>
                        {child.profilePicture ? (
                          <img src={child.profilePicture} alt={`${child.firstName}'s avatar`} />
                        ) : (
                          getUserInitials(child.firstName, child.lastName)
                        )}
                      </FamilyMemberAvatar>
                      
                      <FamilyMemberDetails>
                        <FamilyMemberName>
                          {child.firstName} {child.lastName}
                        </FamilyMemberName>
                        <FamilyMemberRole>Child</FamilyMemberRole>
                        <div>Username: {child.username}</div>
                      </FamilyMemberDetails>
                    </FamilyMemberInfo>
                    
                    <FamilyMemberActions>
                      <ActionButton edit onClick={() => handleOpenEditChildModal(child)}>
                        Edit
                      </ActionButton>
                      <ActionButton delete onClick={() => handleDeleteChild(child.id)}>
                        Remove
                      </ActionButton>
                    </FamilyMemberActions>
                  </FamilyCard>
                ))
              ) : (
                <EmptyState>
                  <p>No family members added yet.</p>
                  <p>Add children to get started!</p>
                </EmptyState>
              )}
            </FamilyList>
            
            <FormActions>
              <Button onClick={handleOpenAddChildModal}>
                Add Child
              </Button>
              <Button onClick={handleOpenAddParentModal}>
                Add Parent
              </Button>
            </FormActions>
          </Section>
        )}
      </ProfileSectionsContainer>
      
      {/* Add/Edit Family Member Modal */}
      {showModal && (
        <ModalBackdrop onClick={handleCloseModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'addChild' 
                  ? 'Add Child' 
                  : modalMode === 'editChild' 
                    ? 'Edit Child' 
                    : 'Add Parent'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
            
            <ProfileForm onSubmit={handleFamilyMemberSubmit}>
              <ProfilePictureContainer>
                <ProfilePicture>
                  {familyMemberData.profilePicture ? (
                    <img src={familyMemberData.profilePicture} alt="Profile" />
                  ) : (
                    getUserInitials(familyMemberData.firstName || 'U', familyMemberData.lastName || 'U')
                  )}
                </ProfilePicture>
                
                <UploadButton>
                  Upload Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFamilyMemberPictureChange}
                  />
                </UploadButton>
              </ProfilePictureContainer>
              
              <FormRow>
                <FormGroup>
                  <label htmlFor="memberFirstName">First Name</label>
                  <input
                    id="memberFirstName"
                    name="firstName"
                    type="text"
                    value={familyMemberData.firstName}
                    onChange={handleFamilyMemberInputChange}
                    placeholder="Enter first name"
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="memberLastName">Last Name</label>
                  <input
                    id="memberLastName"
                    name="lastName"
                    type="text"
                    value={familyMemberData.lastName}
                    onChange={handleFamilyMemberInputChange}
                    placeholder="Enter last name"
                    required
                  />
                </FormGroup>
              </FormRow>
              
              {modalMode === 'addChild' || modalMode === 'editChild' ? (
                <FormGroup>
                  <label htmlFor="username">Username</label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={familyMemberData.username}
                    onChange={handleFamilyMemberInputChange}
                    placeholder="Enter username for child login"
                    required
                  />
                </FormGroup>
              ) : (
                <FormGroup>
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={familyMemberData.email}
                    onChange={handleFamilyMemberInputChange}
                    placeholder="Enter email for parent login"
                    required
                  />
                </FormGroup>
              )}
              
              <FormRow>
                <FormGroup>
                  <label htmlFor="password">
                    {modalMode === 'editChild' 
                      ? 'New PIN/Password (leave blank to keep current)' 
                      : modalMode === 'addChild'
                        ? 'PIN/Password (used for child login)'
                        : 'Password'}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={familyMemberData.password}
                    onChange={handleFamilyMemberInputChange}
                    placeholder={modalMode === 'addChild' ? "Enter 4-digit PIN for child login" : "Enter password"}
                    required={modalMode !== 'editChild'}
                  />
                  {modalMode === 'addChild' && (
                    <small style={{ color: 'var(--text-color-light)', marginTop: '0.25rem', display: 'block' }}>
                      This PIN will be used for your child to log in
                    </small>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <label htmlFor="confirmPassword">Confirm {modalMode === 'addChild' ? 'PIN/Password' : 'Password'}</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={familyMemberData.confirmPassword}
                    onChange={handleFamilyMemberInputChange}
                    placeholder={modalMode === 'addChild' ? "Confirm PIN" : "Confirm password"}
                    required={modalMode !== 'editChild' || familyMemberData.password !== ''}
                  />
                </FormGroup>
              </FormRow>
              
              <FormActions>
                <Button type="button" onClick={handleCloseModal}>
                  Cancel
                </Button>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting 
                    ? 'Saving...' 
                    : modalMode === 'editChild' 
                      ? 'Update Child' 
                      : modalMode === 'addChild' 
                        ? 'Add Child' 
                        : 'Add Parent'}
                </SubmitButton>
              </FormActions>
            </ProfileForm>
          </Modal>
        </ModalBackdrop>
      )}
    </ProfileContainer>
  );
};

export default Profile;

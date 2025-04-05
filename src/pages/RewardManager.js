import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useReward } from '../contexts/RewardContext';
import { getChildrenByFamilyId } from '../services/authService';
import Loading from '../components/Loading';
import ToadMascot from '../components/ToadMascot';

// Styled container
const RewardManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
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

// Styled tabs
const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid var(--background-dark);
  margin-bottom: 1.5rem;
`;

// Styled tab
const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? 'var(--background-light)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

// Styled tab content
const TabContent = styled.div`
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

// Styled reward list
const RewardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

// Styled reward card
const RewardCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
`;

// Styled reward title
const RewardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

// Styled reward description
const RewardDescription = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  flex: 1;
`;

// Styled reward meta
const RewardMeta = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-color-light);
  margin-bottom: 1rem;
`;

// Styled reward meta item
const RewardMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

// Styled reward actions
const RewardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

// Styled action button
const ActionButton = styled.button`
  background-color: ${props => {
    if (props.approve) return 'var(--success-color)';
    if (props.delete) return 'var(--error-color)';
    return 'var(--primary-color)';
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
      if (props.approve) return 'var(--success-color-dark, #388E3C)';
      if (props.delete) return 'var(--error-color-dark, #D32F2F)';
      return 'var(--primary-color-dark)';
    }};
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--text-color-light);
  grid-column: 1 / -1;
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

// Styled form
const Form = styled.form`
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

// Styled cancel button
const CancelButton = styled.button`
  background-color: var(--background-dark);
  color: var(--text-color);
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--text-color-light);
    color: white;
  }
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

// Styled bank settings section
const BankSettingsSection = styled.div`
  margin-top: 2rem;
`;

// Styled settings card
const SettingsCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
`;

// Styled settings title
const SettingsTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: var(--text-color);
`;

// Styled settings form
const SettingsForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Styled settings row
const SettingsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

// Styled settings label
const SettingsLabel = styled.label`
  min-width: 150px;
  font-weight: 600;
`;

// Styled settings input
const SettingsInput = styled.input`
  flex: 1;
  max-width: 200px;
`;

// Styled settings actions
const SettingsActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
`;

/**
 * RewardManager component for managing rewards
 * @returns {JSX.Element} - Rendered component
 */
const RewardManager = ({ alerts }) => {
  const { userData } = useAuth();
  const { 
    familyRewards,
    approveRedemption, 
    refreshRewards, 
    loading: rewardsLoading 
  } = useReward();
  
  // Derived state from familyRewards
  const [specialRewards, setSpecialRewards] = useState([]);
  const [pendingRedemptions, setPendingRedemptions] = useState([]);
  
  const [activeTab, setActiveTab] = useState('pending');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedReward, setSelectedReward] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
  });
  
  // Bank settings state
  const [bankSettings, setBankSettings] = useState({
    interestRate: 0.05, // 5% default
  });
  
  // Extract specialRewards and pendingRedemptions from familyRewards
  useEffect(() => {
    if (familyRewards && familyRewards.length > 0) {
      console.log('Processing family rewards:', familyRewards);
      
      // Extract all special rewards from all children's reward banks
      const allSpecialRewards = [];
      const allPendingRedemptions = [];
      
      familyRewards.forEach(reward => {
        // Check if reward has specialRewards property and it's an array
        if (reward.specialRewards && Array.isArray(reward.specialRewards)) {
          // Add child ID to each special reward for reference
          const specialRewardsWithChild = reward.specialRewards.map(sr => ({
            ...sr,
            assignedTo: reward.childId
          }));
          
          allSpecialRewards.push(...specialRewardsWithChild);
          
          // Add pending redemptions
          const pendingSpecialRewards = specialRewardsWithChild.filter(
            sr => sr.status === 'pending_redemption'
          );
          
          allPendingRedemptions.push(...pendingSpecialRewards);
        }
        
        // Check for money and points redemptions
        if (reward.pendingRedemptions && Array.isArray(reward.pendingRedemptions)) {
          allPendingRedemptions.push(
            ...reward.pendingRedemptions.map(pr => ({
              ...pr,
              childId: reward.childId
            }))
          );
        }
      });
      
      console.log('Extracted special rewards:', allSpecialRewards);
      console.log('Extracted pending redemptions:', allPendingRedemptions);
      
      setSpecialRewards(allSpecialRewards);
      setPendingRedemptions(allPendingRedemptions);
    } else {
      // Reset if no family rewards
      setSpecialRewards([]);
      setPendingRedemptions([]);
    }
  }, [familyRewards]);
  
  // Load children data
  useEffect(() => {
    const loadChildren = async () => {
      if (userData && userData.familyId) {
        try {
          const childrenData = await getChildrenByFamilyId(userData.familyId);
          setChildren(childrenData);
          
          // Set default assignedTo if there are children
          if (childrenData.length > 0 && !formData.assignedTo) {
            setFormData(prev => ({
              ...prev,
              assignedTo: childrenData[0].id
            }));
          }
        } catch (error) {
          console.error('Error loading children:', error);
        }
      }
      setLoading(false);
    };
    
    loadChildren();
  }, [userData]);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Open create reward modal
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedReward(null);
    setFormData({
      title: '',
      description: '',
      assignedTo: children.length > 0 ? children[0].id : '',
    });
    setShowModal(true);
  };
  
  // Open edit reward modal
  const handleOpenEditModal = (reward) => {
    setModalMode('edit');
    setSelectedReward(reward);
    
    setFormData({
      title: reward.title,
      description: reward.description,
      assignedTo: reward.assignedTo,
    });
    
    setShowModal(true);
  };
  
  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle bank settings input change
  const handleBankSettingsChange = (e) => {
    const { name, value } = e.target;
    setBankSettings(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };
  
  // Create a special reward
  const createSpecialReward = async (rewardData) => {
    console.log('Creating special reward:', rewardData);
    // This function would normally call a service to create a special reward
    // For now, we'll just log it and refresh rewards
    refreshRewards();
    return true;
  };
  
  // Edit a special reward
  const editSpecialReward = async (familyId, rewardId, rewardData) => {
    console.log('Editing special reward:', rewardId, rewardData);
    // This function would normally call a service to edit a special reward
    // For now, we'll just log it and refresh rewards
    refreshRewards();
    return true;
  };
  
  // Remove a special reward
  const removeSpecialReward = async (familyId, rewardId) => {
    console.log('Removing special reward:', rewardId);
    // This function would normally call a service to remove a special reward
    // For now, we'll just log it and refresh rewards
    refreshRewards();
    return true;
  };
  
  // Update bank settings
  const updateBankSettings = async (familyId, settings) => {
    console.log('Updating bank settings:', settings);
    // This function would normally call a service to update bank settings
    // For now, we'll just log it
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title) {
      if (alerts) {
        alerts.error('Please enter a reward title');
      }
      return;
    }
    
    if (!formData.assignedTo) {
      if (alerts) {
        alerts.error('Please select a child');
      }
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare reward data
      const rewardData = {
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        status: 'available'
      };
      
      if (modalMode === 'create') {
        // Create new reward
        await createSpecialReward(rewardData);
        
        if (alerts) {
          alerts.success('Reward created successfully');
        }
      } else {
        // Edit existing reward
        await editSpecialReward(userData.familyId, selectedReward.id, rewardData);
        
        if (alerts) {
          alerts.success('Reward updated successfully');
        }
      }
      
      // Close modal and refresh rewards
      setShowModal(false);
      refreshRewards();
    } catch (error) {
      console.error('Error submitting reward:', error);
      
      if (alerts) {
        alerts.error(`Failed to ${modalMode === 'create' ? 'create' : 'update'} reward. Please try again.`);
      }
    }
    
    setSubmitting(false);
  };
  
  // Handle reward deletion
  const handleDeleteReward = async (rewardId) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await removeSpecialReward(userData.familyId, rewardId);
        
        if (alerts) {
          alerts.success('Reward deleted successfully');
        }
        
        refreshRewards();
      } catch (error) {
        console.error('Error deleting reward:', error);
        
        if (alerts) {
          alerts.error('Failed to delete reward. Please try again.');
        }
      }
    }
  };
  
  // Handle redemption approval
  const handleApproveRedemption = async (redemptionId, type) => {
    try {
      await approveRedemption(userData.familyId, redemptionId, type);
      
      if (alerts) {
        alerts.success('Redemption approved successfully');
      }
      
      refreshRewards();
    } catch (error) {
      console.error('Error approving redemption:', error);
      
      if (alerts) {
        alerts.error('Failed to approve redemption. Please try again.');
      }
    }
  };
  
  // Handle bank settings update
  const handleUpdateBankSettings = async (e) => {
    e.preventDefault();
    
    try {
      await updateBankSettings(userData.familyId, bankSettings);
      
      if (alerts) {
        alerts.success('Bank settings updated successfully');
      }
    } catch (error) {
      console.error('Error updating bank settings:', error);
      
      if (alerts) {
        alerts.error('Failed to update bank settings. Please try again.');
      }
    }
  };
  
  // Get child name by ID
  const getChildName = (childId) => {
    const child = children.find(child => child.id === childId);
    return child ? `${child.firstName} ${child.lastName}` : 'Unknown Child';
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Filter rewards based on active tab
  const filteredRewards = activeTab === 'pending' 
    ? specialRewards.filter(reward => reward.status === 'pending_redemption')
    : activeTab === 'available' 
      ? specialRewards.filter(reward => reward.status === 'available')
      : activeTab === 'redeemed' 
        ? specialRewards.filter(reward => reward.status === 'redeemed')
        : specialRewards;
  
  // Show loading indicator while data is loading
  if (loading || rewardsLoading) {
    return <Loading message="Loading rewards..." />;
  }
  
  return (
    <RewardManagerContainer>
      <HeaderSection>
        <ToadMascot size={100} message="Manage rewards for your kids!" />
        <HeaderText>
          <Heading>Ribbit Reserve</Heading>
          <Subheading>Manage rewards for your children</Subheading>
        </HeaderText>
      </HeaderSection>
      
      {pendingRedemptions.length > 0 && (
        <TabContent>
          <SectionTitle>Pending Redemptions</SectionTitle>
          <RewardList>
            {pendingRedemptions.map(redemption => (
              <RewardCard key={redemption.id}>
                <RewardTitle>
                  {redemption.type === 'money' 
                    ? `Money Redemption: $${redemption.amount.toFixed(2)}` 
                    : redemption.type === 'points' 
                      ? `Points Redemption: ${redemption.amount} points` 
                      : redemption.title}
                </RewardTitle>
                <RewardDescription>
                  {redemption.description || `${getChildName(redemption.childId)} wants to redeem this reward.`}
                </RewardDescription>
                <RewardMeta>
                  <RewardMetaItem>👤 {getChildName(redemption.childId)}</RewardMetaItem>
                  <RewardMetaItem>📅 {formatDate(redemption.requestDate)}</RewardMetaItem>
                </RewardMeta>
                <RewardActions>
                  <ActionButton approve onClick={() => handleApproveRedemption(redemption.id, redemption.type)}>
                    Approve
                  </ActionButton>
                </RewardActions>
              </RewardCard>
            ))}
          </RewardList>
        </TabContent>
      )}
      
      <Tabs>
        <Tab 
          active={activeTab === 'pending'} 
          onClick={() => handleTabChange('pending')}
        >
          Pending Redemption
        </Tab>
        <Tab 
          active={activeTab === 'available'} 
          onClick={() => handleTabChange('available')}
        >
          Available
        </Tab>
        <Tab 
          active={activeTab === 'redeemed'} 
          onClick={() => handleTabChange('redeemed')}
        >
          Redeemed
        </Tab>
        <Tab 
          active={activeTab === 'all'} 
          onClick={() => handleTabChange('all')}
        >
          All Rewards
        </Tab>
      </Tabs>
      
      <TabContent>
        {filteredRewards.length > 0 ? (
          <RewardList>
            {filteredRewards.map(reward => (
              <RewardCard key={reward.id}>
                <RewardTitle>{reward.title}</RewardTitle>
                <RewardDescription>{reward.description}</RewardDescription>
                <RewardMeta>
                  <RewardMetaItem>👤 {getChildName(reward.assignedTo)}</RewardMetaItem>
                  <RewardMetaItem>
                    {reward.status === 'available' 
                      ? '🟢 Available' 
                      : reward.status === 'pending_redemption' 
                        ? '🟠 Pending Redemption' 
                        : '✅ Redeemed'}
                  </RewardMetaItem>
                </RewardMeta>
                <RewardActions>
                  {reward.status === 'pending_redemption' && (
                    <ActionButton approve onClick={() => handleApproveRedemption(reward.id, 'special')}>
                      Approve
                    </ActionButton>
                  )}
                  {reward.status !== 'redeemed' && (
                    <>
                      <ActionButton onClick={() => handleOpenEditModal(reward)}>
                        Edit
                      </ActionButton>
                      <ActionButton delete onClick={() => handleDeleteReward(reward.id)}>
                        Delete
                      </ActionButton>
                    </>
                  )}
                </RewardActions>
              </RewardCard>
            ))}
          </RewardList>
        ) : (
          <EmptyState>
            <p>No special rewards found in the lily pad!</p>
            <p>Special rewards are created when you create tasks for your tadpoles.</p>
          </EmptyState>
        )}
      </TabContent>
      
      <BankSettingsSection>
        <SectionTitle>Ribbit Reserve Settings</SectionTitle>
        <SettingsCard>
          <SettingsTitle>Money Settings</SettingsTitle>
          <SettingsForm onSubmit={handleUpdateBankSettings}>
            <SettingsRow>
              <SettingsLabel htmlFor="interestRate">Interest Rate (%)</SettingsLabel>
              <SettingsInput
                id="interestRate"
                name="interestRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={bankSettings.interestRate * 100}
                onChange={(e) => setBankSettings(prev => ({
                  ...prev,
                  interestRate: parseFloat(e.target.value) / 100
                }))}
              />
            </SettingsRow>
            <SettingsActions>
              <SubmitButton type="submit">
                Save Settings
              </SubmitButton>
            </SettingsActions>
          </SettingsForm>
        </SettingsCard>
      </BankSettingsSection>
      
      {/* Create/Edit Reward Modal */}
      {showModal && (
        <ModalBackdrop onClick={handleCloseModal}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {modalMode === 'create' ? 'Create Special Reward' : 'Edit Special Reward'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>×</CloseButton>
            </ModalHeader>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <label htmlFor="title">Reward Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter reward title"
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter reward description"
                  rows={3}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="assignedTo">Assign To</label>
                <select
                  id="assignedTo"
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                >
                  {children.map(child => (
                    <option key={child.id} value={child.id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </FormGroup>
              
              <FormActions>
                <CancelButton type="button" onClick={handleCloseModal}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Reward' : 'Update Reward'}
                </SubmitButton>
              </FormActions>
            </Form>
          </Modal>
        </ModalBackdrop>
      )}
    </RewardManagerContainer>
  );
};

export default RewardManager;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTask } from './TaskContext';
import {
  getRewardBankByChildId,
  getRewardsByFamilyId,
  updateInterestRate,
  applyInterest,
  dispenseMoneyReward,
  dispensePointsReward,
  dispenseSpecialReward,
  redeemSpecialReward,
  approveRewardRedemption
} from '../services/rewardService';

// Create the context
const RewardContext = createContext();

// Custom hook to use the reward context
export const useReward = () => {
  return useContext(RewardContext);
};

// Provider component
export const RewardProvider = ({ children }) => {
  const { userData, childProfile, authMode } = useAuth();
  const { refreshRewardsTrigger } = useTask();
  const [rewardBank, setRewardBank] = useState(null);
  const [familyRewards, setFamilyRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load rewards based on user role or child profile
  useEffect(() => {
    const loadRewards = async () => {
      // Clear rewards if no user data or child profile
      if (!userData && !childProfile) {
        setRewardBank(null);
        setFamilyRewards([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        if (authMode === 'parent' && userData?.role === 'parent') {
          // Load all family rewards for parent
          const rewards = await getRewardsByFamilyId(userData.familyId);
          setFamilyRewards(rewards);
        } else if (authMode === 'child' && childProfile) {
          // Load child's reward bank using childProfile
          const childRewardBank = await getRewardBankByChildId(childProfile.id);
          setRewardBank(childRewardBank);
        }
      } catch (error) {
        console.error('Error loading rewards:', error);
        setError('Failed to load rewards. Please try again later.');
      }

      setLoading(false);
    };

    // Load rewards once without auto-refresh to avoid flickering
    loadRewards();
    
    // No auto-refresh cycle - we'll rely on manual refreshes and the refreshRewardsTrigger
    return () => {};
  }, [userData, childProfile, authMode]);
  
  // Effect to refresh rewards when refreshRewardsTrigger changes
  useEffect(() => {
    if (refreshRewardsTrigger > 0 && authMode === 'child' && childProfile) {
      console.log('Refresh triggered by task completion');
      
      const performFullRefresh = async () => {
        try {
          console.log('Performing full reward bank refresh');
          const childRewardBank = await getRewardBankByChildId(childProfile.id);
          
          if (childRewardBank) {
            console.log('Full refresh successful:', childRewardBank);
            setRewardBank(prevRewardBank => {
              // Ensure we're not creating duplicate rewards
              const uniqueSpecialRewards = childRewardBank.specialRewards.reduce((acc, reward) => {
                const existingRewardIndex = acc.findIndex(r => r.id === reward.id);
                if (existingRewardIndex === -1) {
                  acc.push(reward);
                } else {
                  // If duplicate exists, keep the most recent or most complete entry
                  acc[existingRewardIndex] = reward.status !== 'available' 
                    ? reward 
                    : acc[existingRewardIndex];
                }
                return acc;
              }, []);

              return {
                ...childRewardBank,
                specialRewards: uniqueSpecialRewards
              };
            });
          }
        } catch (error) {
          console.error('Error performing full reward refresh:', error);
        }
      };
      
      // Perform an immediate full refresh with a slight delay to allow database updates
      const refreshTimer = setTimeout(performFullRefresh, 500);
      
      // Clean up the timer if the component unmounts
      return () => {
        clearTimeout(refreshTimer);
      };
    }
  }, [refreshRewardsTrigger, childProfile, authMode]);

  // Update interest rate for a child
  const setInterestRate = async (childId, interestRate) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can update interest rates');
      return false;
    }

    try {
      await updateInterestRate(childId, interestRate);
      
      // Update family rewards in state
      setFamilyRewards(familyRewards.map(reward => {
        if (reward.childId === childId) {
          return { 
            ...reward, 
            money: { 
              ...reward.money, 
              interestRate 
            } 
          };
        }
        return reward;
      }));
      
      // Refresh rewards to ensure state is updated
      await refreshRewards();
      
      return true;
    } catch (error) {
      console.error('Error updating interest rate:', error);
      setError('Failed to update interest rate. Please try again.');
      return false;
    }
  };

  // Apply interest to a child's money balance
  const applyInterestToChild = async (childId) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can apply interest');
      return false;
    }

    try {
      await applyInterest(childId);
      
      // Refresh family rewards
      const rewards = await getRewardsByFamilyId(userData.familyId);
      setFamilyRewards(rewards);
      
      return true;
    } catch (error) {
      console.error('Error applying interest:', error);
      setError('Failed to apply interest. Please try again.');
      return false;
    }
  };

  // Dispense money from reward bank (for parents)
  const dispenseMoney = async (childId, amount) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can dispense rewards');
      return false;
    }

    try {
      await dispenseMoneyReward(childId, amount);
      
      // Refresh family rewards
      const rewards = await getRewardsByFamilyId(userData.familyId);
      setFamilyRewards(rewards);
      
      return true;
    } catch (error) {
      console.error('Error dispensing money:', error);
      setError('Failed to dispense money. Please try again.');
      return false;
    }
  };

  // Dispense points from reward bank (for parents)
  const dispensePoints = async (childId, points) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can dispense rewards');
      return false;
    }

    try {
      await dispensePointsReward(childId, points);
      
      // Refresh family rewards
      const rewards = await getRewardsByFamilyId(userData.familyId);
      setFamilyRewards(rewards);
      
      return true;
    } catch (error) {
      console.error('Error dispensing points:', error);
      setError('Failed to dispense points. Please try again.');
      return false;
    }
  };

  // Redeem special reward from reward bank (for children)
  const redeemSpecial = async (rewardId) => {
    if (authMode !== 'child' || !childProfile) {
      setError('Only children can redeem rewards');
      return false;
    }

    try {
      await redeemSpecialReward(childProfile.id, rewardId);
      
      // Update reward bank in state
      if (rewardBank) {
        const updatedSpecialRewards = rewardBank.specialRewards.map(reward => 
          reward.id === rewardId 
            ? { ...reward, status: 'pending_redemption', redeemedAt: new Date() } 
            : reward
        );
        
        setRewardBank({
          ...rewardBank,
          specialRewards: updatedSpecialRewards
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error redeeming special reward:', error);
      setError('Failed to redeem special reward. Please try again.');
      return false;
    }
  };

  // Approve a reward redemption (for parents)
  const approveRedemption = async (childId, rewardId, type) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can approve redemptions');
      return false;
    }

    try {
      await approveRewardRedemption(childId, rewardId, type);
      
      // If it's a special reward, update the status in state
      if (type === 'special') {
        setFamilyRewards(familyRewards.map(reward => {
          if (reward.childId === childId) {
            const updatedSpecialRewards = reward.specialRewards.map(specialReward => 
              specialReward.id === rewardId 
                ? { ...specialReward, status: 'redeemed' } 
                : specialReward
            );
            
            return {
              ...reward,
              specialRewards: updatedSpecialRewards
            };
          }
          return reward;
        }));
      }
      
      return true;
    } catch (error) {
      console.error('Error approving redemption:', error);
      setError('Failed to approve redemption. Please try again.');
      return false;
    }
  };

  // Refresh rewards
  const refreshRewards = async () => {
    // Return if no user data or child profile
    if (!userData && !childProfile) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (authMode === 'parent' && userData?.role === 'parent') {
        // Refresh all family rewards for parent
        const rewards = await getRewardsByFamilyId(userData.familyId);
        setFamilyRewards(rewards);
      } else if (authMode === 'child' && childProfile) {
        // Refresh child's reward bank using childProfile
        const childRewardBank = await getRewardBankByChildId(childProfile.id);
        setRewardBank(childRewardBank);
      }
    } catch (error) {
      console.error('Error refreshing rewards:', error);
      setError('Failed to refresh rewards. Please try again later.');
    }

    setLoading(false);
  };

  // Value to be provided by the context
  const value = {
    rewardBank,
    familyRewards,
    loading,
    error,
    setInterestRate,
    applyInterestToChild,
    dispenseMoney,
    dispensePoints,
    dispenseSpecial: (childId, rewardId) => dispenseSpecialReward(childId, rewardId),
    redeemSpecial,
    approveRedemption,
    refreshRewards
  };

  return (
    <RewardContext.Provider value={value}>
      {children}
    </RewardContext.Provider>
  );
};

export default RewardContext;

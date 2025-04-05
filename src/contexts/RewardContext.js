import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getRewardBankByChildId,
  getRewardsByFamilyId,
  updateInterestRate,
  applyInterest,
  redeemMoneyReward,
  redeemPointsReward,
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
  const { userData } = useAuth();
  const [rewardBank, setRewardBank] = useState(null);
  const [familyRewards, setFamilyRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load rewards based on user role
  useEffect(() => {
    const loadRewards = async () => {
      if (!userData) {
        setRewardBank(null);
        setFamilyRewards([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        if (userData.role === 'parent') {
          // Load all family rewards for parent
          const rewards = await getRewardsByFamilyId(userData.familyId);
          setFamilyRewards(rewards);
        } else if (userData.role === 'child') {
          // Load child's reward bank
          const childRewardBank = await getRewardBankByChildId(userData.id);
          setRewardBank(childRewardBank);
        }
      } catch (error) {
        console.error('Error loading rewards:', error);
        setError('Failed to load rewards. Please try again later.');
      }

      setLoading(false);
    };

    loadRewards();
  }, [userData]);

  // Update interest rate for a child
  const setInterestRate = async (childId, interestRate) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can update interest rates');
      return false;
    }

    try {
      await updateInterestRate(childId, interestRate);
      
      // Update family rewards in state
      setFamilyRewards(familyRewards.map(reward => 
        reward.childId === childId 
          ? { ...reward, money: { ...reward.money, interestRate } } 
          : reward
      ));
      
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

  // Redeem money from reward bank (for children)
  const redeemMoney = async (amount) => {
    if (!userData || userData.role !== 'child') {
      setError('Only children can redeem rewards');
      return false;
    }

    try {
      await redeemMoneyReward(userData.id, amount);
      
      // Update reward bank in state
      if (rewardBank) {
        setRewardBank({
          ...rewardBank,
          money: {
            ...rewardBank.money,
            balance: rewardBank.money.balance - amount
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error redeeming money:', error);
      setError('Failed to redeem money. Please try again.');
      return false;
    }
  };

  // Redeem points from reward bank (for children)
  const redeemPoints = async (points) => {
    if (!userData || userData.role !== 'child') {
      setError('Only children can redeem rewards');
      return false;
    }

    try {
      await redeemPointsReward(userData.id, points);
      
      // Update reward bank in state
      if (rewardBank) {
        setRewardBank({
          ...rewardBank,
          points: {
            ...rewardBank.points,
            balance: rewardBank.points.balance - points
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error redeeming points:', error);
      setError('Failed to redeem points. Please try again.');
      return false;
    }
  };

  // Redeem special reward from reward bank (for children)
  const redeemSpecial = async (rewardId) => {
    if (!userData || userData.role !== 'child') {
      setError('Only children can redeem rewards');
      return false;
    }

    try {
      await redeemSpecialReward(userData.id, rewardId);
      
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
    if (!userData) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (userData.role === 'parent') {
        // Refresh all family rewards for parent
        const rewards = await getRewardsByFamilyId(userData.familyId);
        setFamilyRewards(rewards);
      } else if (userData.role === 'child') {
        // Refresh child's reward bank
        const childRewardBank = await getRewardBankByChildId(userData.id);
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
    redeemMoney,
    redeemPoints,
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

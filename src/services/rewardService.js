import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { createNotification } from './notificationService';

/**
 * Get a child's reward bank
 * @param {string} childId - Child ID
 * @returns {Promise<Object>} - Reward bank data
 */
export const getRewardBankByChildId = async (childId) => {
  try {
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    return querySnapshot.docs[0].data();
  } catch (error) {
    console.error('Error getting reward bank by child ID:', error);
    throw error;
  }
};

/**
 * Update interest rate for a child's money balance
 * @param {string} childId - Child ID
 * @param {number} interestRate - Interest rate (decimal, e.g., 0.05 for 5%)
 * @returns {Promise<void>}
 */
export const updateInterestRate = async (childId, interestRate) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankId = rewardBankDoc.id;
    
    // Update interest rate
    await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
      'money.interestRate': interestRate,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error updating interest rate:', error);
    throw error;
  }
};

/**
 * Apply interest to a child's money balance
 * @param {string} childId - Child ID
 * @returns {Promise<void>}
 */
export const applyInterest = async (childId) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data();
    const rewardBankId = rewardBankDoc.id;
    
    // Calculate interest
    const currentBalance = rewardBankData.money.balance;
    const interestRate = rewardBankData.money.interestRate;
    const interestAmount = currentBalance * interestRate;
    const newBalance = currentBalance + interestAmount;
    
    // Update balance and last interest applied date
    await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
      'money.balance': newBalance,
      'money.lastInterestApplied': serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error applying interest:', error);
    throw error;
  }
};

/**
 * Dispense money from a child's reward bank (for parents)
 * @param {string} childId - Child ID
 * @param {number} amount - Amount to dispense
 * @returns {Promise<boolean>} - Success status
 */
export const dispenseMoneyReward = async (childId, amount) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data();
    const rewardBankId = rewardBankDoc.id;
    
    // Verify sufficient balance
    if (rewardBankData.money.balance < amount) {
      throw new Error('Insufficient balance');
    }
    
    // Update balance
    await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
      'money.balance': rewardBankData.money.balance - amount,
      'money.dispensedTotal': (rewardBankData.money.dispensedTotal || 0) + amount,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error dispensing money reward:', error);
    throw error;
  }
};

/**
 * Dispense points from a child's reward bank (for parents)
 * @param {string} childId - Child ID
 * @param {number} points - Points to dispense
 * @returns {Promise<boolean>} - Success status
 */
export const dispensePointsReward = async (childId, points) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data();
    const rewardBankId = rewardBankDoc.id;
    
    // Verify sufficient balance
    if (rewardBankData.points.balance < points) {
      throw new Error('Insufficient points');
    }
    
    // Update balance
    await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
      'points.balance': rewardBankData.points.balance - points,
      'points.dispensedTotal': (rewardBankData.points.dispensedTotal || 0) + points,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error dispensing points reward:', error);
    throw error;
  }
};

/**
 * Dispense a special reward from a child's reward bank (for parents)
 * @param {string} childId - Child ID
 * @param {string} rewardId - Special reward ID
 * @returns {Promise<boolean>} - Success status
 */
export const dispenseSpecialReward = async (childId, rewardId) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data();
    const rewardBankId = rewardBankDoc.id;
    
    // Find the special reward
    const specialRewardIndex = rewardBankData.specialRewards.findIndex(
      reward => reward.id === rewardId
    );
    
    if (specialRewardIndex === -1) {
      throw new Error('Special reward not found');
    }
    
    const specialReward = rewardBankData.specialRewards[specialRewardIndex];
    
    // Verify reward is available and not already dispensed
    if (specialReward.status !== 'available') {
      throw new Error('Special reward is not available');
    }
    
    // Update reward status with additional checks to prevent duplicates
    const updatedSpecialRewards = rewardBankData.specialRewards.map(reward => {
      if (reward.id === rewardId) {
        // Ensure only one reward with this ID can be dispensed
        return {
          ...reward,
          status: 'pending_redemption',
          dispensedAt: new Date(),
          // Add a unique transaction ID to track this specific dispensation
          transactionId: `${rewardId}_${Date.now()}`
        };
      }
      return reward;
    });
    
    await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
      specialRewards: updatedSpecialRewards,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error dispensing special reward:', error);
    throw error;
  }
};

/**
 * Redeem a special reward from a child's reward bank
 * @param {string} childId - Child ID
 * @param {string} rewardId - Special reward ID
 * @returns {Promise<void>}
 */
export const redeemSpecialReward = async (childId, rewardId) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data();
    const rewardBankId = rewardBankDoc.id;
    
    // Find the special reward
    const specialRewardIndex = rewardBankData.specialRewards.findIndex(
      reward => reward.id === rewardId
    );
    
    if (specialRewardIndex === -1) {
      throw new Error('Special reward not found');
    }
    
    const specialReward = rewardBankData.specialRewards[specialRewardIndex];
    
    // Verify reward is available
    if (specialReward.status !== 'available') {
      throw new Error('Special reward is not available');
    }
    
    // Update reward status
    const updatedSpecialRewards = [...rewardBankData.specialRewards];
    updatedSpecialRewards[specialRewardIndex] = {
      ...specialReward,
      status: 'pending_redemption',
      redeemedAt: new Date()
    };
    
    await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
      specialRewards: updatedSpecialRewards,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error redeeming special reward:', error);
    throw error;
  }
};

/**
 * Approve a reward redemption
 * @param {string} childId - Child ID
 * @param {string} rewardId - Special reward ID (for special rewards only)
 * @param {string} type - Reward type ('money', 'points', 'special')
 * @returns {Promise<void>}
 */
export const approveRewardRedemption = async (childId, rewardId, type) => {
  try {
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data();
    const rewardBankId = rewardBankDoc.id;
    
    // Handle special reward redemption
    if (type === 'special') {
      // Find the special reward
      const specialRewardIndex = rewardBankData.specialRewards.findIndex(
        reward => reward.id === rewardId
      );
      
      if (specialRewardIndex === -1) {
        throw new Error('Special reward not found');
      }
      
      const specialReward = rewardBankData.specialRewards[specialRewardIndex];
      
      // Verify reward is pending redemption
      if (specialReward.status !== 'pending_redemption') {
        throw new Error('Special reward is not pending redemption');
      }
      
      // Update reward status with additional checks to prevent duplicates
      const updatedSpecialRewards = rewardBankData.specialRewards.map(reward => {
        if (reward.id === rewardId) {
          // Ensure only one reward with this transaction ID can be redeemed
          return {
            ...reward,
            status: 'redeemed',
            redeemedAt: new Date(),
            // Preserve the original transaction ID for tracking
            transactionId: reward.transactionId || `${rewardId}_${Date.now()}`
          };
        }
        return reward;
      });
      
      // Remove any duplicate rewards with the same ID
      const uniqueSpecialRewards = updatedSpecialRewards.reduce((acc, reward) => {
        const existingRewardIndex = acc.findIndex(r => 
          r.id === reward.id && r.transactionId === reward.transactionId
        );
        
        if (existingRewardIndex === -1) {
          acc.push(reward);
        }
        
        return acc;
      }, []);
      
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
        specialRewards: uniqueSpecialRewards,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } else {
      return true;
    }
  } catch (error) {
    console.error('Error approving reward redemption:', error);
    throw error;
  }
};

/**
 * Get all rewards for a family
 * @param {string} familyId - Family ID
 * @returns {Promise<Array>} - Array of reward data
 */
export const getRewardsByFamilyId = async (familyId) => {
  try {
    // Get all children in the family - first try the children collection
    const childrenQuery = query(
      collection(db, 'children'),
      where('familyId', '==', familyId)
    );
    
    const childrenSnapshot = await getDocs(childrenQuery);
    const children = childrenSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
    
    // Also check the users collection for any children (old system)
    const usersQuery = query(
      collection(db, 'users'),
      where('familyId', '==', familyId),
      where('role', '==', 'child')
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const childUsers = usersSnapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
    
    // Combine both results
    const allChildren = [...children, ...childUsers];
    
    console.log('Found children in family:', allChildren);
    
    // Get reward banks for all children
    const rewardBanks = await Promise.all(
      allChildren.map(async (child) => {
        try {
          console.log(`Getting reward bank for child ${child.id}`);
          const rewardBanksQuery = query(
            collection(db, 'rewardBanks'),
            where('childId', '==', child.id)
          );
          
          const rewardBankSnapshot = await getDocs(rewardBanksQuery);
          
          if (rewardBankSnapshot.empty) {
            console.log(`No reward bank found for child ${child.id}`);
            return null;
          }
          
          const rewardBank = rewardBankSnapshot.docs[0].data();
          
          console.log(`Found reward bank for child ${child.id}:`, rewardBank);
          return {
            ...rewardBank,
            childName: `${child.firstName} ${child.lastName || ''}`,
            childId: child.id
          };
        } catch (error) {
          console.error(`Error getting reward bank for child ${child.id}:`, error);
          return null;
        }
      })
    );
    
    // Filter out null values
    return rewardBanks.filter(Boolean);
  } catch (error) {
    console.error('Error getting rewards by family ID:', error);
    throw error;
  }
};

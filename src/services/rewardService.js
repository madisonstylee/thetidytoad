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
    
    // Get child data to send notification
    const childDoc = await getDoc(doc(db, 'users', childId));
    
    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }
    
    const childData = childDoc.data();
    
    // Create notification for child
    await createNotification({
      userId: childId,
      title: 'Interest Rate Updated',
      message: `Your Ribbit Reserve interest rate has been updated to ${(interestRate * 100).toFixed(1)}%.`,
      type: 'interest_rate_updated',
      relatedId: rewardBankId
    });
    
    // Get family data to get parent ID
    const familyDoc = await getDoc(doc(db, 'families', childData.familyId));
    
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }
    
    const familyData = familyDoc.data();
    
    // Create notification for parent
    await createNotification({
      userId: familyData.mainParentId,
      title: 'Interest Rate Updated',
      message: `You updated ${childData.firstName}'s Ribbit Reserve interest rate to ${(interestRate * 100).toFixed(1)}%.`,
      type: 'interest_rate_updated',
      relatedId: rewardBankId
    });
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
    
    // Create notification for child
    await createNotification({
      userId: childId,
      title: 'Interest Applied',
      message: `You earned ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(interestAmount)} in interest on your Ribbit Reserve!`,
      type: 'interest_applied',
      relatedId: rewardBankId
    });
  } catch (error) {
    console.error('Error applying interest:', error);
    throw error;
  }
};

/**
 * Redeem money from a child's reward bank
 * @param {string} childId - Child ID
 * @param {number} amount - Amount to redeem
 * @returns {Promise<void>}
 */
export const redeemMoneyReward = async (childId, amount) => {
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
      updatedAt: serverTimestamp()
    });
    
    // Get child data
    const childDoc = await getDoc(doc(db, 'users', childId));
    
    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }
    
    const childData = childDoc.data();
    
    // Get family data to get parent ID
    const familyDoc = await getDoc(doc(db, 'families', childData.familyId));
    
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }
    
    const familyData = familyDoc.data();
    
    // Create notification for parent
    await createNotification({
      userId: familyData.mainParentId,
      title: 'Money Redemption Request',
      message: `${childData.firstName} wants to redeem ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} from their Ribbit Reserve.`,
      type: 'money_redemption',
      relatedId: rewardBankId
    });
    
    // Create notification for child
    await createNotification({
      userId: childId,
      title: 'Money Redemption Requested',
      message: `You requested to redeem ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)} from your Ribbit Reserve. Your parent has been notified.`,
      type: 'money_redemption',
      relatedId: rewardBankId
    });
  } catch (error) {
    console.error('Error redeeming money reward:', error);
    throw error;
  }
};

/**
 * Redeem points from a child's reward bank
 * @param {string} childId - Child ID
 * @param {number} points - Points to redeem
 * @returns {Promise<void>}
 */
export const redeemPointsReward = async (childId, points) => {
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
      updatedAt: serverTimestamp()
    });
    
    // Get child data
    const childDoc = await getDoc(doc(db, 'users', childId));
    
    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }
    
    const childData = childDoc.data();
    
    // Get family data to get parent ID
    const familyDoc = await getDoc(doc(db, 'families', childData.familyId));
    
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }
    
    const familyData = familyDoc.data();
    
    // Create notification for parent
    await createNotification({
      userId: familyData.mainParentId,
      title: 'Points Redemption Request',
      message: `${childData.firstName} wants to redeem ${points} points from their Ribbit Reserve.`,
      type: 'points_redemption',
      relatedId: rewardBankId
    });
    
    // Create notification for child
    await createNotification({
      userId: childId,
      title: 'Points Redemption Requested',
      message: `You requested to redeem ${points} points from your Ribbit Reserve. Your parent has been notified.`,
      type: 'points_redemption',
      relatedId: rewardBankId
    });
  } catch (error) {
    console.error('Error redeeming points reward:', error);
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
    
    // Get child data
    const childDoc = await getDoc(doc(db, 'users', childId));
    
    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }
    
    const childData = childDoc.data();
    
    // Get family data to get parent ID
    const familyDoc = await getDoc(doc(db, 'families', childData.familyId));
    
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }
    
    const familyData = familyDoc.data();
    
    // Create notification for parent
    await createNotification({
      userId: familyData.mainParentId,
      title: 'Special Reward Redemption Request',
      message: `${childData.firstName} wants to redeem the special reward: ${specialReward.title}`,
      type: 'special_redemption',
      relatedId: rewardId
    });
    
    // Create notification for child
    await createNotification({
      userId: childId,
      title: 'Special Reward Redemption Requested',
      message: `You requested to redeem the special reward: ${specialReward.title}. Your parent has been notified.`,
      type: 'special_redemption',
      relatedId: rewardId
    });
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
      
      // Update reward status
      const updatedSpecialRewards = [...rewardBankData.specialRewards];
      updatedSpecialRewards[specialRewardIndex] = {
        ...specialReward,
        status: 'redeemed'
      };
      
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
        specialRewards: updatedSpecialRewards,
        updatedAt: serverTimestamp()
      });
      
      // Create notification for child
      await createNotification({
        userId: childId,
        title: 'Special Reward Redemption Approved',
        message: `Your special reward "${specialReward.title}" has been approved!`,
        type: 'special_redemption_approved',
        relatedId: rewardId
      });
    } else {
      // Create notification for child
      await createNotification({
        userId: childId,
        title: `${type === 'money' ? 'Money' : 'Points'} Redemption Approved`,
        message: `Your ${type === 'money' ? 'money' : 'points'} redemption has been approved!`,
        type: `${type}_redemption_approved`,
        relatedId: rewardBankId
      });
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
    // Get all children in the family
    const childrenQuery = query(
      collection(db, 'users'),
      where('familyId', '==', familyId),
      where('role', '==', 'child')
    );
    
    const childrenSnapshot = await getDocs(childrenQuery);
    const children = childrenSnapshot.docs.map(doc => doc.data());
    
    // Get reward banks for all children
    const rewardBanks = await Promise.all(
      children.map(async (child) => {
        try {
          const rewardBank = await getRewardBankByChildId(child.id);
          return {
            ...rewardBank,
            childName: `${child.firstName} ${child.lastName}`,
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

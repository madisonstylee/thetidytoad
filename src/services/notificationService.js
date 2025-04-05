import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { createNotification as createNotificationModel } from '../data/models';

/**
 * Create a new notification
 * @param {Object} notificationData - Notification data
 * @returns {Promise<Object>} - Created notification data
 */
export const createNotification = async (notificationData) => {
  try {
    const notificationId = uuidv4();
    
    // Create notification document
    const newNotificationData = createNotificationModel({
      id: notificationId,
      ...notificationData
    });
    
    // Save notification to Firestore
    await setDoc(doc(db, 'notifications', notificationId), newNotificationData);
    
    return newNotificationData;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Get notifications for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of notifications to retrieve
 * @returns {Promise<Array>} - Array of notification data
 */
export const getNotificationsByUserId = async (userId, notificationLimit = 20) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(notificationLimit)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting notifications by user ID:', error);
    throw error;
  }
};

/**
 * Get unread notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of notification data
 */
export const getUnreadNotificationsByUserId = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting unread notifications by user ID:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    // Update each notification
    const updatePromises = querySnapshot.docs.map(doc => 
      updateDoc(doc.ref, { read: true })
    );
    
    await Promise.all(updatePromises);
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - Notification ID
 * @returns {Promise<void>}
 */
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications for a user
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const deleteAllNotifications = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    // Delete each notification
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Get notification count for a user
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Number of unread notifications
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    throw error;
  }
};

/**
 * Create a task completion notification for a parent
 * @param {string} parentId - Parent ID
 * @param {string} childName - Child name
 * @param {string} taskTitle - Task title
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} - Created notification data
 */
export const createTaskCompletionNotification = async (parentId, childName, taskTitle, taskId) => {
  try {
    return await createNotification({
      userId: parentId,
      title: 'Task Completed',
      message: `${childName} has completed the task "${taskTitle}". Please review and approve.`,
      type: 'task_completed',
      relatedId: taskId
    });
  } catch (error) {
    console.error('Error creating task completion notification:', error);
    throw error;
  }
};

/**
 * Create a task approval notification for a child
 * @param {string} childId - Child ID
 * @param {string} taskTitle - Task title
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} - Created notification data
 */
export const createTaskApprovalNotification = async (childId, taskTitle, taskId) => {
  try {
    return await createNotification({
      userId: childId,
      title: 'Task Approved',
      message: `Your task "${taskTitle}" has been approved! Your reward has been added to your Ribbit Reserve.`,
      type: 'task_approved',
      relatedId: taskId
    });
  } catch (error) {
    console.error('Error creating task approval notification:', error);
    throw error;
  }
};

/**
 * Create a reward redemption notification for a parent
 * @param {string} parentId - Parent ID
 * @param {string} childName - Child name
 * @param {string} rewardType - Reward type ('money', 'points', 'special')
 * @param {string} rewardDetails - Reward details (amount, points, or title)
 * @param {string} rewardId - Reward ID
 * @returns {Promise<Object>} - Created notification data
 */
export const createRewardRedemptionNotification = async (parentId, childName, rewardType, rewardDetails, rewardId) => {
  try {
    let message = '';
    
    if (rewardType === 'money') {
      message = `${childName} wants to redeem ${rewardDetails} from their Ribbit Reserve.`;
    } else if (rewardType === 'points') {
      message = `${childName} wants to redeem ${rewardDetails} points from their Ribbit Reserve.`;
    } else if (rewardType === 'special') {
      message = `${childName} wants to redeem the special reward: ${rewardDetails}`;
    }
    
    return await createNotification({
      userId: parentId,
      title: `${rewardType.charAt(0).toUpperCase() + rewardType.slice(1)} Redemption Request`,
      message,
      type: `${rewardType}_redemption`,
      relatedId: rewardId
    });
  } catch (error) {
    console.error('Error creating reward redemption notification:', error);
    throw error;
  }
};

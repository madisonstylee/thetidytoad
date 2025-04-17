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
  serverTimestamp,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from './firebase';
import { createTask } from '../data/models';
import { createNotification } from './notificationService';

/**
 * Create a new task
 * @param {Object} taskData - Task data
 * @param {string} userId - User ID of the parent creating the task
 * @returns {Promise<Object>} - Created task data
 */
export const createNewTask = async (taskData, userId) => {
  try {
    const taskId = uuidv4();

    // Create task document
    const newTaskData = createTask({
      id: taskId,
      ...taskData,
      createdBy: userId,
    });

    // Get family ID from the assigned child
    // First try to get from children collection (new system)
    let childDoc = await getDoc(doc(db, 'children', taskData.assignedTo));
    
    // If not found, try the users collection (old system)
    if (!childDoc.exists()) {
      childDoc = await getDoc(doc(db, 'users', taskData.assignedTo));
    }

    if (!childDoc.exists()) {
      throw new Error('Child not found');
    }

    const childData = childDoc.data();
    const familyId = childData.familyId;

    // Save task to Firestore
    await setDoc(doc(db, 'families', familyId, 'tasks', taskId), newTaskData);

    return newTaskData;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Get all tasks for a family
 * @param {string} familyId - Family ID
 * @returns {Promise<Array>} - Array of task data
 */
export const getTasksByFamilyId = async (familyId) => {
  try {
    const tasksQuery = query(
      collection(db, 'families', familyId, 'tasks'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting tasks by family ID:', error);
    throw error;
  }
};

/**
 * Get tasks for a specific child
 * @param {string} familyId - Family ID
 * @param {string} childId - Child ID
 * @returns {Promise<Array>} - Array of task data
 */
export const getTasksByChildId = async (familyId, childId) => {
  try {
    const tasksQuery = query(
      collection(db, 'families', familyId, 'tasks'),
      where('assignedTo', '==', childId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting tasks by child ID:', error);
    throw error;
  }
};

/**
 * Get pending tasks for a specific child
 * @param {string} familyId - Family ID
 * @param {string} childId - Child ID
 * @returns {Promise<Array>} - Array of task data
 */
export const getPendingTasksByChildId = async (familyId, childId) => {
  try {
    const tasksQuery = query(
      collection(db, 'families', familyId, 'tasks'),
      where('assignedTo', '==', childId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting pending tasks by child ID:', error);
    throw error;
  }
};

/**
 * Get tasks awaiting approval
 * @param {string} familyId - Family ID
 * @returns {Promise<Array>} - Array of task data
 */
export const getTasksAwaitingApproval = async (familyId) => {
  try {
    const tasksQuery = query(
      collection(db, 'families', familyId, 'tasks'),
      where('status', '==', 'completed'),
      orderBy('completedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    
    return querySnapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting tasks awaiting approval:', error);
    throw error;
  }
};

/**
 * Update a task
 * @param {string} familyId - Family ID
 * @param {string} taskId - Task ID
 * @param {Object} taskData - Task data to update
 * @returns {Promise<void>}
 */
export const updateTask = async (familyId, taskId, taskData) => {
  try {
    await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), {
      ...taskData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string} familyId - Family ID
 * @param {string} taskId - Task ID
 * @returns {Promise<void>}
 */
export const deleteTask = async (familyId, taskId) => {
  try {
    await deleteDoc(doc(db, 'families', familyId, 'tasks', taskId));
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Mark a task as complete
 * @param {string} familyId - Family ID
 * @param {string} taskId - Task ID
 * @param {string} childId - Child ID
 * @returns {Promise<void>}
 */
export const markTaskAsComplete = async (familyId, taskId, childId) => {
  try {
    console.log(`Marking task ${taskId} as complete for child ${childId} in family ${familyId}`);
    
    // Get task data
    const taskDoc = await getDoc(doc(db, 'families', familyId, 'tasks', taskId));
    
    if (!taskDoc.exists()) {
      console.error('Task not found');
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.data();
    console.log('Task data retrieved:', taskData);
    
    // Verify that the task is assigned to the child
    if (taskData.assignedTo !== childId) {
      console.log(`Task is assigned to ${taskData.assignedTo}, not to ${childId}`);
      throw new Error('Task not assigned to this child');
    }
    
    console.log('Updating task status to approved');
    
    // Update task status to completed
    await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Task status updated successfully');
    
    // Add reward to child's reward bank immediately
    try {
      console.log('Adding reward to child immediately');
      await addRewardToChild(childId, taskData.reward);
      console.log('Reward added successfully');
    } catch (rewardError) {
      console.error('Error adding reward to child:', rewardError);
      console.log('Continuing with task completion despite reward error');
    }
    
    // Try to create a notification, but don't let it block task completion if it fails
    try {
      // Get child data to include in notification
      console.log('Getting child data for notification');
      let childName = "A child";
      
      // Get from children collection
      const childProfileDoc = await getDoc(doc(db, 'children', childId));
      
      if (childProfileDoc.exists()) {
        const childData = childProfileDoc.data();
        childName = `${childData.firstName} ${childData.lastName}`.trim();
        console.log(`Child name from profile: ${childName}`);
      } else {
        console.log('Child document not found, using default name');
      }
      
      // Get parent data to send notification
      console.log('Finding parent to notify');
      const usersQuery = query(
        collection(db, 'users'),
        where('familyId', '==', familyId),
        where('role', '==', 'parent')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (!querySnapshot.empty) {
        const parentDoc = querySnapshot.docs[0];
        const parentId = parentDoc.id;
        console.log(`Found parent ${parentId} to notify`);
        
        // Create notification for parent
        console.log('Creating notification for parent');
        await createNotification({
          userId: parentId,
          title: 'Task Completed',
          message: `${childName} has completed the task "${taskData.title}" and the reward has been added to their Ribbit Reserve.`,
          type: 'task_completed',
          relatedId: taskId
        });
        console.log('Notification created successfully');
      } else {
        console.log('No parent found to notify');
      }
      
      // Create notification for child
      await createNotification({
        userId: childId,
        title: 'Task Completed',
        message: `Your task "${taskData.title}" has been completed! Your reward has been added to your Ribbit Reserve.`,
        type: 'task_approved',
        relatedId: taskId
      });
      
    } catch (notificationError) {
      // If notification creation fails, log the error but don't fail the task completion
      console.error('Error creating notification:', notificationError);
      console.log('Continuing with task completion despite notification error');
    }
    
    // Handle recurring tasks
    if (taskData.recurrence !== 'none') {
      await createRecurringTask(taskData, taskData.createdBy);
    }
    
    console.log('Task completion process finished successfully');
    return taskData;
  } catch (error) {
    console.error('Error marking task as complete:', error);
    throw error;
  }
};

/**
 * Approve a completed task
 * @param {string} familyId - Family ID
 * @param {string} taskId - Task ID
 * @param {string} parentId - Parent ID
 * @returns {Promise<void>}
 */
export const approveCompletedTask = async (familyId, taskId, parentId) => {
  try {
    // Get task data
    const taskDoc = await getDoc(doc(db, 'families', familyId, 'tasks', taskId));
    
    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.data();
    
    // Verify that the task is completed
    if (taskData.status !== 'completed') {
      throw new Error('Task is not completed');
    }
    
    // Update task status
    await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), {
      status: 'approved',
      approvedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Add reward to child's reward bank
    await addRewardToChild(taskData.assignedTo, taskData.reward);
    
    // Create notification for child
    await createNotification({
      userId: taskData.assignedTo,
      title: 'Task Approved',
      message: `Your task "${taskData.title}" has been approved! Your reward has been added to your Ribbit Reserve.`,
      type: 'task_approved',
      relatedId: taskId
    });
    
    // Handle recurring tasks
    if (taskData.recurrence !== 'none') {
      await createRecurringTask(taskData, parentId);
    }
  } catch (error) {
    console.error('Error approving completed task:', error);
    throw error;
  }
};

/**
 * Add reward to child's reward bank
 * @param {string} childId - Child ID
 * @param {Object} reward - Reward data
 * @returns {Promise<void>}
 */
const addRewardToChild = async (childId, reward) => {
  try {
    console.log(`Adding reward to child ${childId}:`, reward);
    
    if (!reward || !reward.type) {
      console.error('Invalid reward data:', reward);
      throw new Error('Invalid reward data');
    }
    
    // Get child's reward bank
    const rewardBanksQuery = query(
      collection(db, 'rewardBanks'),
      where('childId', '==', childId)
    );
    
    const querySnapshot = await getDocs(rewardBanksQuery);
    
    if (querySnapshot.empty) {
      console.error('Reward bank not found for child:', childId);
      throw new Error('Reward bank not found');
    }
    
    const rewardBankDoc = querySnapshot.docs[0];
    const rewardBankData = rewardBankDoc.data() || {};
    const rewardBankId = rewardBankDoc.id;
    
    console.log('Found reward bank:', rewardBankId);
    console.log('Current reward bank data:', rewardBankData);
    
    // Initialize update object
    const updateObj = {
      updatedAt: serverTimestamp()
    };
    
    // Update reward bank based on reward type
    if (reward.type === 'money') {
      // Ensure money object exists and has a balance
      const money = rewardBankData.money || {};
      const currentBalance = typeof money.balance === 'number' ? money.balance : 0;
      const rewardValue = typeof reward.value === 'number' ? reward.value : 0;
      const newBalance = currentBalance + rewardValue;
      
      console.log(`Updating money balance: ${currentBalance} + ${rewardValue} = ${newBalance}`);
      
      // Update directly to ensure immediate reflection in the UI
      updateObj['money.balance'] = newBalance;
      
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), updateObj);
      
      console.log('Money balance updated successfully');
    } else if (reward.type === 'points') {
      // Ensure points object exists and has a balance
      const points = rewardBankData.points || {};
      const currentBalance = typeof points.balance === 'number' ? points.balance : 0;
      const rewardValue = typeof reward.value === 'number' ? reward.value : 0;
      const newBalance = currentBalance + rewardValue;
      
      console.log(`Updating points balance: ${currentBalance} + ${rewardValue} = ${newBalance}`);
      
      // Update directly to ensure immediate reflection in the UI
      updateObj['points.balance'] = newBalance;
      
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), updateObj);
      
      console.log('Points balance updated successfully');
    } else if (reward.type === 'special') {
      // Create a new special reward
      const specialReward = {
        id: uuidv4(),
        title: reward.title || 'Special Reward',
        description: reward.description || '',
        status: 'available',
        createdAt: new Date()
      };
      
      console.log('Adding special reward:', specialReward);
      
      // Add to special rewards array
      const currentSpecialRewards = Array.isArray(rewardBankData.specialRewards) 
        ? rewardBankData.specialRewards 
        : [];
      
      // We'll no longer check for duplicates by title, as this might be preventing legitimate rewards
      // Instead, we'll just add the new reward and let the UI handle displaying it
      console.log('Adding new special reward without duplicate check:', specialReward);
      
      // First, clean the existing special rewards array to remove any potential duplicates with the same ID
      // This ensures we don't have duplicates with the same ID, but allows rewards with the same title
      const uniqueRewards = [];
      const seenIds = new Set();
      
      for (const reward of currentSpecialRewards) {
        if (!seenIds.has(reward.id)) {
          seenIds.add(reward.id);
          uniqueRewards.push({
            id: reward.id,
            title: reward.title,
            description: reward.description,
            status: reward.status,
            createdAt: reward.createdAt
          });
        } else {
          console.log(`Removing duplicate existing reward with ID: ${reward.id}`);
        }
      }
      
      // Add the new reward to the unique rewards array
      uniqueRewards.push(specialReward);
      
      // Update the reward bank with the unique rewards array
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
        specialRewards: uniqueRewards,
        updatedAt: serverTimestamp()
      });
      
      console.log('Special reward added successfully');
      console.log('Updated special rewards:', uniqueRewards);
      
      // Force a refresh of the reward bank to ensure the UI is updated
      try {
        // Get the updated reward bank
        const updatedRewardBankDoc = await getDoc(doc(db, 'rewardBanks', rewardBankId));
        if (updatedRewardBankDoc.exists()) {
          console.log('Verified special reward was added:', updatedRewardBankDoc.data().specialRewards);
        }
      } catch (refreshError) {
        console.error('Error verifying special reward was added:', refreshError);
      }
    } else {
      console.error('Unknown reward type:', reward.type);
      throw new Error(`Unknown reward type: ${reward.type}`);
    }
    
    console.log('Reward added successfully to child:', childId);
  } catch (error) {
    console.error('Error adding reward to child:', error);
    throw error;
  }
};

/**
 * Create a new recurring task
 * @param {Object} taskData - Original task data
 * @param {string} parentId - Parent ID
 * @returns {Promise<void>}
 */
const createRecurringTask = async (taskData, parentId) => {
  try {
    // Calculate next due date based on recurrence
    let nextDueDate = null;
    
    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      
      if (taskData.recurrence === 'daily') {
        nextDueDate = new Date(dueDate);
        nextDueDate.setDate(dueDate.getDate() + 1);
      } else if (taskData.recurrence === 'weekly') {
        nextDueDate = new Date(dueDate);
        nextDueDate.setDate(dueDate.getDate() + 7);
      } else if (taskData.recurrence === 'monthly') {
        nextDueDate = new Date(dueDate);
        nextDueDate.setMonth(dueDate.getMonth() + 1);
      }
    }
    
    // Create new task with same data but new ID and reset status
    const newTaskData = {
      title: taskData.title,
      description: taskData.description,
      assignedTo: taskData.assignedTo,
      dueDate: nextDueDate ? nextDueDate.toISOString() : null,
      recurrence: taskData.recurrence,
      reward: taskData.reward,
      createdBy: parentId
    };
    
    // Create the new task
    await createNewTask(newTaskData, parentId);
  } catch (error) {
    console.error('Error creating recurring task:', error);
    throw error;
  }
};

// Make sure all functions that need to be exported have export statements
export { addRewardToChild, createRecurringTask };

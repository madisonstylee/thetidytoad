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
  serverTimestamp 
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
      createdBy: userId
    });
    
    // Get family ID from the assigned child
    const childDoc = await getDoc(doc(db, 'users', taskData.assignedTo));
    
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
    // Get task data
    const taskDoc = await getDoc(doc(db, 'families', familyId, 'tasks', taskId));
    
    if (!taskDoc.exists()) {
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.data();
    
    // Verify that the task is assigned to the child
    if (taskData.assignedTo !== childId) {
      throw new Error('Task not assigned to this child');
    }
    
    // Update task status
    await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), {
      status: 'completed',
      completedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Get parent data to send notification
    const familyDoc = await getDoc(doc(db, 'families', familyId));
    
    if (!familyDoc.exists()) {
      throw new Error('Family not found');
    }
    
    const familyData = familyDoc.data();
    const parentId = familyData.mainParentId;
    
    // Create notification for parent
    await createNotification({
      userId: parentId,
      title: 'Task Completed',
      message: `${taskData.title} has been completed and is awaiting your approval.`,
      type: 'task_completed',
      relatedId: taskId
    });
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
    
    // Update reward bank based on reward type
    if (reward.type === 'money') {
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
        'money.balance': rewardBankData.money.balance + reward.value,
        updatedAt: serverTimestamp()
      });
    } else if (reward.type === 'points') {
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
        'points.balance': rewardBankData.points.balance + reward.value,
        updatedAt: serverTimestamp()
      });
    } else if (reward.type === 'special') {
      // Create a new special reward
      const specialReward = {
        id: uuidv4(),
        title: reward.title || 'Special Reward',
        description: reward.description,
        status: 'available',
        createdAt: new Date()
      };
      
      // Add to special rewards array
      await updateDoc(doc(db, 'rewardBanks', rewardBankId), {
        specialRewards: [...rewardBankData.specialRewards, specialReward],
        updatedAt: serverTimestamp()
      });
    }
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

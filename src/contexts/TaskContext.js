import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getCurrentChildProfile } from '../services/sessionService';
import {
  getTasksByFamilyId,
  getTasksByChildId,
  getPendingTasksByChildId,
  getTasksAwaitingApproval,
  createNewTask,
  updateTask,
  deleteTask,
  markTaskAsComplete,
  approveCompletedTask
} from '../services/taskService';

// Create the context
const TaskContext = createContext();

// Custom hook to use the task context
export const useTask = () => {
  return useContext(TaskContext);
};

// Provider component
export const TaskProvider = ({ children }) => {
  const { userData, childProfile, authMode } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [tasksAwaitingApproval, setTasksAwaitingApproval] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshRewardsTrigger, setRefreshRewardsTrigger] = useState(0);

  // Load tasks based on user role or child profile
  useEffect(() => {
    const loadTasks = async () => {
      // Clear tasks if no user data or child profile
      if (!userData && !childProfile) {
        setTasks([]);
        setPendingTasks([]);
        setTasksAwaitingApproval([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        if (authMode === 'parent' && userData?.role === 'parent') {
          // Parent mode - refresh all family tasks
          const familyTasks = await getTasksByFamilyId(userData.familyId);
          setTasks(familyTasks);

          // Refresh tasks awaiting approval
          const awaitingApproval = await getTasksAwaitingApproval(userData.familyId);
          setTasksAwaitingApproval(awaitingApproval);
        } else if (authMode === 'child' && childProfile) {
          // Child mode - refresh child's tasks using profile
          const childTasks = await getTasksByChildId(childProfile.familyId, childProfile.id);
          setTasks(childTasks);

          // Refresh pending tasks
          const childPendingTasks = await getPendingTasksByChildId(childProfile.familyId, childProfile.id);
          setPendingTasks(childPendingTasks);
        }
      } catch (error) {
        console.error('Error refreshing tasks:', error);
        setError('Failed to refresh tasks. Please try again later.');
      }

      setLoading(false);
    };

    loadTasks();
  }, [userData, childProfile, authMode]);

  // Create a new task
  const createTask = async (taskData) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can create tasks');
      return null;
    }

    try {
      const newTask = await createNewTask(taskData, userData.id);
      setTasks([newTask, ...tasks]);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
      return null;
    }
  };

  // Update an existing task
  const editTask = async (familyId, taskId, taskData) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can edit tasks');
      return false;
    }

    try {
      await updateTask(familyId, taskId, taskData);
      
      // Update tasks in state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, ...taskData } : task
      ));
      
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      setError('Failed to update task. Please try again.');
      return false;
    }
  };

  // Delete a task
  const removeTask = async (familyId, taskId) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can delete tasks');
      return false;
    }

    try {
      await deleteTask(familyId, taskId);
      
      // Remove task from state
      setTasks(tasks.filter(task => task.id !== taskId));
      setTasksAwaitingApproval(tasksAwaitingApproval.filter(task => task.id !== taskId));
      
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      setError('Failed to delete task. Please try again.');
      return false;
    }
  };

  // Mark a task as complete (for children)
  const completeTask = async (familyId, taskId, userId) => {
    if (authMode !== 'child' || !childProfile) {
      setError('Only children can complete tasks');
      return false;
    }

    try {
      // Get the task details to determine the reward
      const taskToComplete = tasks.find(task => task.id === taskId);
      
      if (!taskToComplete) {
        throw new Error('Task not found');
      }
      
      console.log('Marking task as complete:', taskToComplete);
      
      // First, update the UI immediately to show the task as completed
      // This ensures the UI updates even if there's a backend error
      setTasks(
        tasks.map(task =>
          task.id === taskId ? { ...task, status: 'completed', completedAt: new Date() } : task
        )
      );

      // Remove from pending tasks
      setPendingTasks(pendingTasks.filter(task => task.id !== taskId));
      
      try {
        // Try to mark the task as complete in the backend
        await markTaskAsComplete(familyId, taskId, userId);
        console.log('Task marked as complete in backend');
        
        // Trigger a refresh of the reward bank by incrementing the trigger value
        // This will be picked up by the RewardContext to refresh the rewards
        setRefreshRewardsTrigger(prev => prev + 1);
        console.log('Triggered reward refresh after task completion');
        
        // The task is now marked as completed and the reward is added
        // We'll automatically approve it as per the new requirements
        try {
          await approveCompletedTask(familyId, taskId, userId);
          console.log('Task automatically approved');
        } catch (approveError) {
          console.error('Error automatically approving task:', approveError);
          console.log('Task is still marked as completed and reward is added');
        }
        
        // Force a second refresh after a short delay to ensure the UI is updated
        setTimeout(() => {
          setRefreshRewardsTrigger(prev => prev + 1);
          console.log('Triggered second reward refresh after delay');
        }, 1000);
      } catch (error) {
        // Log the error but continue with UI updates
        console.error('Error marking task as complete in backend:', error);
        setError('Task marked as complete, but there was an issue with notifications.');
      }

      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      setError('Failed to complete task. Please try again.');
      return false;
    }
  };

  // Approve a completed task (for parents)
  const approveTask = async (familyId, taskId) => {
    if (!userData || userData.role !== 'parent') {
      setError('Only parents can approve tasks');
      return false;
    }

    try {
      await approveCompletedTask(familyId, taskId, userData.id);
      
      // Update task status in state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'approved', approvedAt: new Date() } : task
      ));
      
      // Remove from awaiting approval
      setTasksAwaitingApproval(tasksAwaitingApproval.filter(task => task.id !== taskId));
      
      return true;
    } catch (error) {
      console.error('Error approving task:', error);
      setError('Failed to approve task. Please try again.');
      return false;
    }
  };

  // Refresh tasks
  const refreshTasks = async () => {
    if (!userData && !childProfile) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (authMode === 'parent' && userData?.role === 'parent') {
        // Refresh all family tasks for parent
        const familyTasks = await getTasksByFamilyId(userData.familyId);
        setTasks(familyTasks);

        // Refresh tasks awaiting approval
        const awaitingApproval = await getTasksAwaitingApproval(userData.familyId);
        setTasksAwaitingApproval(awaitingApproval);
      } else if (authMode === 'child' && childProfile) {
        // Refresh child's tasks
        const childTasks = await getTasksByChildId(childProfile.familyId, childProfile.id);
        setTasks(childTasks);

        // Refresh pending tasks
        const childPendingTasks = await getPendingTasksByChildId(childProfile.familyId, childProfile.id);
        setPendingTasks(childPendingTasks);
      }
    } catch (error) {
      console.error('Error refreshing tasks:', error);
      setError('Failed to refresh tasks. Please try again later.');
    }

    setLoading(false);
  };

  // Value to be provided by the context
  const value = {
    tasks,
    pendingTasks,
    tasksAwaitingApproval,
    loading,
    error,
    createTask,
    editTask,
    removeTask,
    completeTask,
    approveTask,
    refreshTasks,
    refreshRewardsTrigger
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;

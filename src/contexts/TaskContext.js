import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
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
  const { userData } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [tasksAwaitingApproval, setTasksAwaitingApproval] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load tasks based on user role
  useEffect(() => {
    const loadTasks = async () => {
      if (!userData) {
        setTasks([]);
        setPendingTasks([]);
        setTasksAwaitingApproval([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        if (userData.role === 'parent') {
          // Load all family tasks for parent
          const familyTasks = await getTasksByFamilyId(userData.familyId);
          setTasks(familyTasks);

          // Load tasks awaiting approval
          const awaitingApproval = await getTasksAwaitingApproval(userData.familyId);
          setTasksAwaitingApproval(awaitingApproval);
        } else if (userData.role === 'child') {
          // Load child's tasks
          const childTasks = await getTasksByChildId(userData.familyId, userData.id);
          setTasks(childTasks);

          // Load pending tasks
          const childPendingTasks = await getPendingTasksByChildId(userData.familyId, userData.id);
          setPendingTasks(childPendingTasks);
        }
      } catch (error) {
        console.error('Error loading tasks:', error);
        setError('Failed to load tasks. Please try again later.');
      }

      setLoading(false);
    };

    loadTasks();
  }, [userData]);

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
  const completeTask = async (familyId, taskId) => {
    if (!userData || userData.role !== 'child') {
      setError('Only children can complete tasks');
      return false;
    }

    try {
      await markTaskAsComplete(familyId, taskId, userData.id);
      
      // Update task status in state
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, status: 'completed', completedAt: new Date() } : task
      ));
      
      // Remove from pending tasks
      setPendingTasks(pendingTasks.filter(task => task.id !== taskId));
      
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
    if (!userData) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (userData.role === 'parent') {
        // Refresh all family tasks for parent
        const familyTasks = await getTasksByFamilyId(userData.familyId);
        setTasks(familyTasks);

        // Refresh tasks awaiting approval
        const awaitingApproval = await getTasksAwaitingApproval(userData.familyId);
        setTasksAwaitingApproval(awaitingApproval);
      } else if (userData.role === 'child') {
        // Refresh child's tasks
        const childTasks = await getTasksByChildId(userData.familyId, userData.id);
        setTasks(childTasks);

        // Refresh pending tasks
        const childPendingTasks = await getPendingTasksByChildId(userData.familyId, userData.id);
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
    refreshTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskContext;

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getNotificationsByUserId,
  getUnreadNotificationsByUserId,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from '../services/notificationService';

// Create the context
const NotificationContext = createContext();

// Custom hook to use the notification context
export const useNotification = () => {
  return useContext(NotificationContext);
};

// Provider component
export const NotificationProvider = ({ children }) => {
  const { userData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load notifications when user changes
  useEffect(() => {
    const loadNotifications = async () => {
      if (!userData) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      try {
        // Get notifications for the user
        const userNotifications = await getNotificationsByUserId(userData.id);
        setNotifications(userNotifications);

        // Get unread count
        const count = await getUnreadNotificationCount(userData.id);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setError('Failed to load notifications. Please try again later.');
      }

      setLoading(false);
    };

    loadNotifications();
  }, [userData]);

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    if (!userData) {
      return false;
    }

    try {
      await markNotificationAsRead(notificationId);
      
      // Update notifications in state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      // Update unread count
      setUnreadCount(Math.max(0, unreadCount - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      setError('Failed to mark notification as read. Please try again.');
      return false;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!userData) {
      return false;
    }

    try {
      await markAllNotificationsAsRead(userData.id);
      
      // Update notifications in state
      setNotifications(notifications.map(notification => ({ ...notification, read: true })));
      
      // Update unread count
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setError('Failed to mark all notifications as read. Please try again.');
      return false;
    }
  };

  // Delete a notification
  const removeNotification = async (notificationId) => {
    if (!userData) {
      return false;
    }

    try {
      await deleteNotification(notificationId);
      
      // Find the notification to check if it's unread
      const notification = notifications.find(n => n.id === notificationId);
      
      // Update notifications in state
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      // Update unread count if the notification was unread
      if (notification && !notification.read) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      setError('Failed to delete notification. Please try again.');
      return false;
    }
  };

  // Delete all notifications
  const removeAllNotifications = async () => {
    if (!userData) {
      return false;
    }

    try {
      await deleteAllNotifications(userData.id);
      
      // Update notifications in state
      setNotifications([]);
      
      // Update unread count
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error deleting all notifications:', error);
      setError('Failed to delete all notifications. Please try again.');
      return false;
    }
  };

  // Refresh notifications
  const refreshNotifications = async () => {
    if (!userData) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get notifications for the user
      const userNotifications = await getNotificationsByUserId(userData.id);
      setNotifications(userNotifications);

      // Get unread count
      const count = await getUnreadNotificationCount(userData.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
      setError('Failed to refresh notifications. Please try again later.');
    }

    setLoading(false);
  };

  // Get unread notifications
  const getUnreadNotifications = () => {
    return notifications.filter(notification => !notification.read);
  };

  // Value to be provided by the context
  const value = {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    removeNotification,
    removeAllNotifications,
    refreshNotifications,
    getUnreadNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;

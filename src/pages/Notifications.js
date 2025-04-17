import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { markNotificationAsRead } from '../services/notificationService';

// Styled container for the notifications page
const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

// Styled header
const Header = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Styled notification list
const NotificationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

// Styled notification item
const NotificationItem = styled.div`
  background-color: ${props => props.read ? 'white' : 'var(--background-light)'};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--background-light);
  }
`;

// Styled notification icon
const NotificationIcon = styled.div`
  font-size: 1.5rem;
  color: var(--primary-color);
`;

// Styled notification content
const NotificationContent = styled.div`
  flex: 1;
`;

// Styled notification title
const NotificationTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-weight: ${props => props.read ? '500' : '700'};
`;

// Styled notification message
const NotificationMessage = styled.p`
  margin: 0 0 0.5rem 0;
  color: var(--text-color-light);
`;

// Styled notification time
const NotificationTime = styled.div`
  font-size: 0.8rem;
  color: var(--text-color-lighter);
`;

// Styled notification actions
const NotificationActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

// Styled notification button
const NotificationButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba(76, 175, 80, 0.1);
  }
`;

// Styled empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-color-light);
`;

// Styled empty state icon
const EmptyStateIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

/**
 * Notifications page displays user notifications
 * @returns {JSX.Element} - Rendered component
 */
const Notifications = () => {
  const { userData } = useAuth();
  const { notifications, fetchNotifications } = useNotification();
  const [loading, setLoading] = useState(true);

  // Fetch notifications on component mount
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        await fetchNotifications();
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadNotifications();
  }, [fetchNotifications]);

  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    if (!timestamp) return '';
    
    // Convert to Date object if it's a Firestore timestamp
    const date = timestamp instanceof Date 
      ? timestamp 
      : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'task_completed':
        return '✅';
      case 'task_approved':
        return '👍';
      case 'reward_redeemed':
        return '🎁';
      case 'reward_added':
        return '🏆';
      default:
        return '🔔';
    }
  };

  return (
    <Container>
      <Header>
        <span>📬</span> Notifications
      </Header>
      
      {loading ? (
        <div>Loading notifications...</div>
      ) : notifications.length > 0 ? (
        <NotificationList>
          {notifications.map(notification => (
            <NotificationItem key={notification.id} read={notification.read}>
              <NotificationIcon>
                {getNotificationIcon(notification.type)}
              </NotificationIcon>
              <NotificationContent>
                <NotificationTitle read={notification.read}>
                  {notification.title}
                </NotificationTitle>
                <NotificationMessage>
                  {notification.message}
                </NotificationMessage>
                <NotificationTime>
                  {formatNotificationTime(notification.timestamp)}
                </NotificationTime>
              </NotificationContent>
              <NotificationActions>
                {!notification.read && (
                  <NotificationButton onClick={() => handleMarkAsRead(notification.id)}>
                    Mark as read
                  </NotificationButton>
                )}
              </NotificationActions>
            </NotificationItem>
          ))}
        </NotificationList>
      ) : (
        <EmptyState>
          <EmptyStateIcon>🐸</EmptyStateIcon>
          <h3>No notifications yet!</h3>
          <p>When you have new notifications, they'll appear here.</p>
        </EmptyState>
      )}
    </Container>
  );
};

export default Notifications;

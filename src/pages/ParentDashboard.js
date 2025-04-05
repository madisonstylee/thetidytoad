import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { useNotification } from '../contexts/NotificationContext';
import { getChildrenByFamilyId } from '../services/authService';
import Loading from '../components/Loading';
import ToadMascot from '../components/ToadMascot';

// Styled dashboard container
const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Styled welcome section
const WelcomeSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

// Styled welcome text
const WelcomeText = styled.div`
  flex: 1;
`;

// Styled heading
const Heading = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

// Styled subheading
const Subheading = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
`;

// Styled dashboard section
const DashboardSection = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

// Styled section header
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

// Styled section title
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  color: var(--primary-color);
  margin: 0;
`;

// Styled section icon
const SectionIcon = styled.div`
  font-size: 1.5rem;
`;

// Styled section content
const SectionContent = styled.div`
  margin-bottom: 1.5rem;
`;

// Styled section footer
const SectionFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

// Styled button
const ActionButton = styled(Link)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.5rem 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
    text-decoration: none;
    color: white;
  }
`;

// Styled tabs
const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid var(--background-dark);
  margin-bottom: 1rem;
  overflow-x: auto;
`;

// Styled tab
const Tab = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${props => props.active ? 'var(--background-light)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  white-space: nowrap;
  
  &:hover {
    color: var(--primary-color);
  }
`;

// Styled task list
const TaskList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Styled task item
const TaskItem = styled.li`
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--background-dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

// Styled task status
const TaskStatus = styled.span`
  font-size: 0.8rem;
  padding: 0.25rem 0.5rem;
  border-radius: var(--border-radius-sm);
  background-color: ${props => {
    switch (props.status) {
      case 'completed':
        return 'rgba(76, 175, 80, 0.1)';
      case 'approved':
        return 'rgba(33, 150, 243, 0.1)';
      default:
        return 'rgba(255, 152, 0, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'completed':
        return 'var(--success-color)';
      case 'approved':
        return 'var(--info-color)';
      default:
        return 'var(--warning-color)';
    }
  }};
`;

// Styled reward summary
const RewardSummary = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 1rem;
  margin-top: 1rem;
  box-shadow: var(--box-shadow-sm);
`;

// Styled reward category
const RewardCategory = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--background-dark);
  
  &:last-child {
    border-bottom: none;
  }
`;

// Styled reward label
const RewardLabel = styled.div`
  font-weight: 500;
`;

// Styled reward value
const RewardValue = styled.div`
  font-weight: 600;
  color: var(--primary-color);
`;

// Styled empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--text-color-light);
`;

/**
 * ParentDashboard component displays the parent dashboard
 * @returns {JSX.Element} - Rendered component
 */
const ParentDashboard = () => {
  const { userData } = useAuth();
  const { tasks, tasksAwaitingApproval, loading: tasksLoading } = useTask();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotification();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load children data
  useEffect(() => {
    const loadChildren = async () => {
      if (userData && userData.familyId) {
        try {
          const childrenData = await getChildrenByFamilyId(userData.familyId);
          setChildren(childrenData);
        } catch (error) {
          console.error('Error loading children:', error);
        }
      }
      setLoading(false);
    };
    
    loadChildren();
  }, [userData]);
  
  // State for active child tab
  const [activeChildId, setActiveChildId] = useState(null);
  
  // Set initial active child when children data is loaded
  useEffect(() => {
    if (children.length > 0 && !activeChildId) {
      setActiveChildId(children[0]?.id);
    }
  }, [children, activeChildId]);
  
  // Get active child data
  const activeChild = children.find(child => child.id === activeChildId) || null;
  
  // Get tasks for active child
  const childTasks = tasks.filter(task => task.assignedTo === activeChildId);
  
  // Get completed tasks for active child
  const completedTasks = childTasks.filter(task => task.status === 'completed' || task.status === 'approved');
  
  // Get active tasks for active child
  const activeTasks = childTasks.filter(task => task.status !== 'completed' && task.status !== 'approved');
  
  // Handle tab change
  const handleTabChange = (childId) => {
    setActiveChildId(childId);
  };
  
  // Show loading indicator while data is loading
  if (loading || tasksLoading || notificationsLoading) {
    return <Loading message="Loading dashboard..." />;
  }
  
  return (
    <DashboardContainer>
      <WelcomeSection>
        <ToadMascot size={100} message="I love clean lily pads!" />
        <WelcomeText>
          <Heading>Welcome, {userData.firstName}!</Heading>
          <Subheading>Manage tasks and rewards for your tadpoles</Subheading>
        </WelcomeText>
      </WelcomeSection>
      
      {children.length > 0 ? (
        <>
          <Tabs>
            {children.map(child => (
              <Tab 
                key={child.id}
                active={activeChildId === child.id}
                onClick={() => handleTabChange(child.id)}
              >
                {child.firstName}
              </Tab>
            ))}
          </Tabs>
          
          <DashboardSection>
            <SectionHeader>
              <SectionTitle>Tadpole Tasks</SectionTitle>
              <SectionIcon>📋</SectionIcon>
            </SectionHeader>
            
            <SectionContent>
              {activeTasks.length > 0 ? (
                <TaskList>
                  {activeTasks.map(task => (
                    <TaskItem key={task.id}>
                      <div>{task.title}</div>
                      <TaskStatus status={task.status}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </TaskStatus>
                    </TaskItem>
                  ))}
                </TaskList>
              ) : (
                <EmptyState>No active tasks for {activeChild?.firstName}. Create some lily pad tasks!</EmptyState>
              )}
            </SectionContent>
            
            <SectionHeader>
              <SectionTitle>Completed Tasks</SectionTitle>
            </SectionHeader>
            
            <SectionContent>
              {completedTasks.length > 0 ? (
                <TaskList>
                  {completedTasks.slice(0, 3).map(task => (
                    <TaskItem key={task.id}>
                      <div>{task.title}</div>
                      <TaskStatus status={task.status}>
                        {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                      </TaskStatus>
                    </TaskItem>
                  ))}
                </TaskList>
              ) : (
                <EmptyState>No completed tasks yet for {activeChild?.firstName}.</EmptyState>
              )}
            </SectionContent>
            
            <SectionFooter>
              <ActionButton to="/task-manager">Manage Tasks</ActionButton>
            </SectionFooter>
          </DashboardSection>
          
          <DashboardSection>
            <SectionHeader>
              <SectionTitle>Ribbit Reserve for {activeChild?.firstName}</SectionTitle>
              <SectionIcon>💰</SectionIcon>
            </SectionHeader>
            
            <RewardSummary>
              <RewardCategory>
                <RewardLabel>Money</RewardLabel>
                <RewardValue>$10.00</RewardValue>
              </RewardCategory>
              <RewardCategory>
                <RewardLabel>Points</RewardLabel>
                <RewardValue>250 pts</RewardValue>
              </RewardCategory>
              <RewardCategory>
                <RewardLabel>Special Rewards</RewardLabel>
                <RewardValue>2 available</RewardValue>
              </RewardCategory>
            </RewardSummary>
            
            <SectionFooter>
              <ActionButton to="/reward-manager">Manage Rewards</ActionButton>
            </SectionFooter>
          </DashboardSection>
        </>
      ) : (
        <DashboardSection>
          <EmptyState>
            <p>No tadpoles added yet! Add your little hoppers to get started.</p>
            <ActionButton to="/profile">Add Children</ActionButton>
          </EmptyState>
        </DashboardSection>
      )}
    </DashboardContainer>
  );
};

export default ParentDashboard;

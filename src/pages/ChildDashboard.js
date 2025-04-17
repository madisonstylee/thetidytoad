import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useTask } from '../contexts/TaskContext';
import { useNotification } from '../contexts/NotificationContext';
import { useReward } from '../contexts/RewardContext';
import Loading from '../components/Loading';
import ToadMascot from '../components/ToadMascot';
import Celebration from '../components/Celebration';

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
  color: var(--accent-color);
  margin-bottom: 0.5rem;
`;

// Styled subheading
const Subheading = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
`;

// Styled task section
const TaskSection = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  padding: 1.5rem;
`;

// Styled section header
const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

// Styled section title
const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 0;
  font-family: var(--font-family-fun);
`;

// Styled section icon
const SectionIcon = styled.div`
  font-size: 1.5rem;
`;

// Styled task list
const TaskList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

// Styled task card
const TaskCard = styled.div`
  background-color: ${props => props.completed ? 'rgba(76, 175, 80, 0.1)' : 'white'};
  border: 2px solid ${props => props.completed ? 'var(--success-color)' : 'var(--background-dark)'};
  border-radius: var(--border-radius-md);
  padding: 1.25rem;
  transition: transform 0.2s;
  box-shadow: var(--box-shadow-md);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-md);
  }
`;

// Styled task title
const TaskTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

// Styled task description
const TaskDescription = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

// Styled task reward
const TaskReward = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-weight: 600;
  color: var(--accent-color);
`;

// Styled task button
const TaskButton = styled.button`
  width: 100%;
  background-color: ${props => props.completed ? 'var(--success-color)' : 'var(--accent-color)'};
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem;
  font-weight: 600;
  cursor: ${props => props.completed ? 'default' : 'pointer'};
  transition: transform 0.2s;
  box-shadow: var(--box-shadow-md);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-md);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled empty state
const EmptyState = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--text-color-light);
  grid-column: 1 / -1;
`;

// Styled reward summary
const RewardSummary = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

// Styled reward card
const RewardCard = styled(Link)`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: var(--text-color);
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
    text-decoration: none;
    color: var(--text-color);
  }
  
  &:not(:last-child) {
    margin-right: 1rem;
  }
`;

// Styled reward icon
const RewardIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 0.5rem;
`;

// Styled reward value
const RewardValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
  color: var(--primary-color);
`;

// Styled reward label
const RewardLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-color-light);
`;

/**
 * ChildDashboard component displays the child dashboard
 * @returns {JSX.Element} - Rendered component
 */
const ChildDashboard = ({ alerts }) => {
  const { childProfile } = useAuth();
  const { pendingTasks, completeTask, loading: tasksLoading } = useTask();
  const { unreadCount, loading: notificationsLoading } = useNotification();
  const { rewardBank, loading: rewardLoading } = useReward();
  const [completingTaskId, setCompletingTaskId] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Handle task completion
  const handleCompleteTask = async (taskId) => {
    setCompletingTaskId(taskId);

    try {
      const success = await completeTask(childProfile.familyId, taskId, childProfile.id);
      
      if (success) {
        // Show celebration animation
        setShowCelebration(true);
        
        // Show success alert if available
        if (alerts) {
          alerts.success('Task completed! Your parent will review it soon.');
        }
      }
    } catch (error) {
      console.error('Error completing task:', error);
      
      // Show error alert if available
      if (alerts) {
        alerts.error('Failed to complete task. Please try again.');
      }
    }
    
    setCompletingTaskId(null);
  };
  
  // Handle celebration completion
  const handleCelebrationComplete = () => {
    setShowCelebration(false);
  };
  
  // Show loading indicator while data is loading
  if (tasksLoading || notificationsLoading || rewardLoading) {
    return (
      <DashboardContainer>
        <Loading message="Loading dashboard..." />
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      {/* Celebration animation */}
      {showCelebration && (
        <Celebration 
          message="Great Job!" 
          show={showCelebration} 
          onComplete={handleCelebrationComplete} 
        />
      )}
      
      <WelcomeSection>
        <ToadMascot size={100} message="Hi there!" animate="jump" />
        <WelcomeText>
          <Heading>Hi, {childProfile.firstName}!</Heading>
          <Subheading>Complete tasks to earn rewards in your Ribbit Reserve</Subheading>
        </WelcomeText>
      </WelcomeSection>
      
      <TaskSection>
        <SectionHeader>
          <SectionTitle>Your Tasks</SectionTitle>
          <SectionIcon>📋</SectionIcon>
        </SectionHeader>
        
        <TaskList>
          {pendingTasks.length > 0 ? (
            pendingTasks.map(task => (
              <TaskCard key={task.id} completed={task.status === 'completed'}>
                <TaskTitle>{task.title}</TaskTitle>
                <TaskDescription>{task.description}</TaskDescription>
                <TaskReward>
                  {task.reward.type === 'money' && (
                    <>
                      💰 ${task.reward.value.toFixed(2)}
                    </>
                  )}
                  {task.reward.type === 'points' && (
                    <>
                      🎮 {task.reward.value} points
                    </>
                  )}
                  {task.reward.type === 'special' && (
                    <>
                      🎁 {task.reward.description}
                    </>
                  )}
                </TaskReward>
                <TaskButton
                  onClick={() => handleCompleteTask(task.id)}
                  disabled={task.status === 'completed' || completingTaskId === task.id}
                  completed={task.status === 'completed'}
                >
                  {completingTaskId === task.id ? (
                    'Completing...'
                  ) : task.status === 'completed' ? (
                    'Completed ✓'
                  ) : (
                    'Mark as Complete!'
                  )}
                </TaskButton>
              </TaskCard>
            ))
          ) : (
            <EmptyState>
              No lily pad tasks for you right now, little tadpole!
              Hop back later to see what your parents have assigned!
            </EmptyState>
          )}
        </TaskList>
      </TaskSection>
      
      <SectionHeader>
        <SectionTitle>Ribbit Reserve</SectionTitle>
        <SectionIcon>💰</SectionIcon>
      </SectionHeader>
      
      <RewardSummary>
        <RewardCard to="/ribbit-reserve">
          <RewardIcon>💰</RewardIcon>
          <RewardValue>${rewardBank?.money?.balance?.toFixed(2) || '0.00'}</RewardValue>
          <RewardLabel>Money</RewardLabel>
        </RewardCard>
        <RewardCard to="/ribbit-reserve">
          <RewardIcon>🎮</RewardIcon>
          <RewardValue>{rewardBank?.points?.balance || 0}</RewardValue>
          <RewardLabel>Points</RewardLabel>
        </RewardCard>
        <RewardCard to="/ribbit-reserve">
          <RewardIcon>🎁</RewardIcon>
          <RewardValue>{rewardBank?.specialRewards?.filter(reward => reward.status === 'available').length || 0}</RewardValue>
          <RewardLabel>Special Rewards</RewardLabel>
        </RewardCard>
      </RewardSummary>
    </DashboardContainer>
  );
};

export default ChildDashboard;

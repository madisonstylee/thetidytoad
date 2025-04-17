import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useReward } from '../contexts/RewardContext';
import Loading from '../components/Loading';
import ToadMascot from '../components/ToadMascot';

// Styled container
const ReserveContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

// Styled header section
const HeaderSection = styled.div`
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

// Styled header text
const HeaderText = styled.div`
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

// Styled tabs
const Tabs = styled.div`
  display: flex;
  border-bottom: 2px solid var(--background-dark);
  margin-bottom: 1.5rem;
`;

// Styled tab
const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.active ? 'var(--background-light)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--text-color)'};
  border: none;
  border-bottom: 2px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  
  &:hover {
    color: var(--primary-color);
  }
`;

// Styled tab content
const TabContent = styled.div`
  background-color: var(--background-light);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
  padding: 1.5rem;
`;

// Styled balance card
const BalanceCard = styled.div`
  background-color: ${props => props.color || 'var(--primary-color)'};
  color: white;
  border-radius: var(--border-radius-lg);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

// Styled balance label
const BalanceLabel = styled.div`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
`;

// Styled balance amount
const BalanceAmount = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

// Styled balance info
const BalanceInfo = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

// Styled form
const Form = styled.form`
  margin-top: 1.5rem;
`;

// Styled form group
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Styled form row
const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
  }
`;

// Styled submit button
const SubmitButton = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--accent-color-dark);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

// Styled reward list
const RewardList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

// Styled reward card
const RewardCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
`;

// Styled reward title
const RewardTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
`;

// Styled reward description
const RewardDescription = styled.p`
  color: var(--text-color-light);
  margin-bottom: 1rem;
  font-size: 0.9rem;
  flex: 1;
`;

// Styled reward button
const RewardButton = styled.button`
  width: 100%;
  background-color: ${props => props.redeemed ? 'var(--success-color)' : 'var(--accent-color)'};
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem;
  font-weight: 600;
  cursor: ${props => props.redeemed ? 'default' : 'pointer'};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.redeemed ? 'var(--success-color)' : 'var(--accent-color-dark)'};
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

// Styled transaction history
const TransactionHistory = styled.div`
  margin-top: 1.5rem;
`;

// Styled transaction list
const TransactionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

// Styled transaction item
const TransactionItem = styled.li`
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--background-dark);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  &:last-child {
    border-bottom: none;
  }
`;

// Styled transaction details
const TransactionDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

// Styled transaction title
const TransactionTitle = styled.div`
  font-weight: 600;
`;

// Styled transaction date
const TransactionDate = styled.div`
  font-size: 0.8rem;
  color: var(--text-color-light);
`;

// Styled transaction amount
const TransactionAmount = styled.div`
  font-weight: 600;
  color: ${props => props.type === 'credit' ? 'var(--success-color)' : 'var(--error-color)'};
`;

/**
 * RibbitReserve component displays the child's reward bank
 * @returns {JSX.Element} - Rendered component
 */
const RibbitReserve = ({ alerts }) => {
  const { userData } = useAuth();
  const { rewardBank, loading, refreshRewards } = useReward();
  const [activeTab, setActiveTab] = useState('money');
  const [error, setError] = useState(null);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // No redemption functions needed as per new requirements
  
  // No forced refresh on component mount - we'll rely on the initial load from RewardContext
  
  // Error boundary effect
  useEffect(() => {
    // Reset error state when component mounts or rewardBank changes
    setError(null);
  }, [rewardBank]);
  
  // Show loading indicator while data is loading
  if (loading) {
    return <Loading message="Loading Ribbit Reserve..." />;
  }
  
  // Show error UI if there's an error
  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>We're having trouble loading your rewards. Please try refreshing the page.</p>
        <pre style={{ textAlign: 'left', margin: '1rem auto', maxWidth: '80%', overflow: 'auto' }}>
          {error.toString()}
        </pre>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }
  
  // Wrap everything in a try-catch to prevent white screen on errors
  try {
    // Safely extract data from rewardBank with additional error handling
    const moneyBalance = rewardBank?.money?.balance || 0;
    const interestRate = rewardBank?.money?.interestRate || 0;
    const pointsBalance = rewardBank?.points?.balance || 0;
    
    // Ensure specialRewards is always an array, even if rewardBank is null or specialRewards is undefined
    let specialRewards = [];
    
    try {
      if (rewardBank && Array.isArray(rewardBank.specialRewards)) {
        // Deep clone the array to avoid any reference issues
        specialRewards = JSON.parse(JSON.stringify(rewardBank.specialRewards));
      }
    } catch (err) {
      console.error('Error processing special rewards:', err);
      // Fallback to empty array
      specialRewards = [];
    }
    
    // Log the special rewards for debugging
    console.log('Special rewards in RibbitReserve:', specialRewards);
    
    // Filter special rewards by status with additional safety checks
    const availableSpecialRewards = specialRewards.filter(reward => {
      try {
        return reward && typeof reward === 'object' && reward.status === 'available';
      } catch (err) {
        console.error('Error filtering available reward:', err, reward);
        return false;
      }
    });
    
    const pendingSpecialRewards = specialRewards.filter(reward => {
      try {
        return reward && typeof reward === 'object' && reward.status === 'pending_redemption';
      } catch (err) {
        console.error('Error filtering pending reward:', err, reward);
        return false;
      }
    });
    
    const redeemedSpecialRewards = specialRewards.filter(reward => {
      try {
        return reward && typeof reward === 'object' && reward.status === 'redeemed';
      } catch (err) {
        console.error('Error filtering redeemed reward:', err, reward);
        return false;
      }
    });
    
    // Log filtered rewards for debugging
    console.log('Available special rewards:', availableSpecialRewards);
    console.log('Pending special rewards:', pendingSpecialRewards);
    console.log('Redeemed special rewards:', redeemedSpecialRewards);
    
    return (
      <ReserveContainer>
        <HeaderSection>
          <ToadMascot size={100} message="Welcome to your Ribbit Reserve!" />
          <HeaderText>
            <Heading>Ribbit Reserve</Heading>
            <Subheading>Track and redeem your rewards</Subheading>
          </HeaderText>
        </HeaderSection>
        
        <Tabs>
          <Tab 
            active={activeTab === 'money'} 
            onClick={() => handleTabChange('money')}
          >
            Money 💰
          </Tab>
          <Tab 
            active={activeTab === 'points'} 
            onClick={() => handleTabChange('points')}
          >
            Points 🎮
          </Tab>
          <Tab 
            active={activeTab === 'special'} 
            onClick={() => handleTabChange('special')}
          >
            Special Rewards 🎁
          </Tab>
        </Tabs>
        
        <TabContent>
          {activeTab === 'money' && (
            <>
              <BalanceCard color="var(--primary-color)">
                <BalanceLabel>Current Balance</BalanceLabel>
                <BalanceAmount>${moneyBalance.toFixed(2)}</BalanceAmount>
                <BalanceInfo>Interest Rate: {(interestRate * 100).toFixed(1)}%</BalanceInfo>
              </BalanceCard>
              
              <BalanceCard color="var(--success-color)">
                <BalanceLabel>Balance with Interest</BalanceLabel>
                <BalanceAmount>${(moneyBalance * (1 + interestRate)).toFixed(2)}</BalanceAmount>
                <BalanceInfo>You'll earn ${(moneyBalance * interestRate).toFixed(2)} in interest!</BalanceInfo>
              </BalanceCard>
              
              <TransactionHistory>
                <h3>Recent Transactions</h3>
                {/* Mock transaction history - replace with actual data */}
                <TransactionList>
                  <TransactionItem>
                    <TransactionDetails>
                      <TransactionTitle>Task Completed: Clean Room</TransactionTitle>
                      <TransactionDate>April 1, 2025</TransactionDate>
                    </TransactionDetails>
                    <TransactionAmount type="credit">+$5.00</TransactionAmount>
                  </TransactionItem>
                  <TransactionItem>
                    <TransactionDetails>
                      <TransactionTitle>Interest Earned</TransactionTitle>
                      <TransactionDate>March 31, 2025</TransactionDate>
                    </TransactionDetails>
                    <TransactionAmount type="credit">+$0.25</TransactionAmount>
                  </TransactionItem>
                  <TransactionItem>
                    <TransactionDetails>
                      <TransactionTitle>Money Dispensed</TransactionTitle>
                      <TransactionDate>March 28, 2025</TransactionDate>
                    </TransactionDetails>
                    <TransactionAmount type="debit">-$10.00</TransactionAmount>
                  </TransactionItem>
                </TransactionList>
              </TransactionHistory>
            </>
          )}
          
          {activeTab === 'points' && (
            <>
              <BalanceCard color="var(--accent-color)">
                <BalanceLabel>Current Points</BalanceLabel>
                <BalanceAmount>{pointsBalance}</BalanceAmount>
                <BalanceInfo>Earn points by completing tasks</BalanceInfo>
              </BalanceCard>
              
              <TransactionHistory>
                <h3>Recent Transactions</h3>
                {/* Mock transaction history - replace with actual data */}
                <TransactionList>
                  <TransactionItem>
                    <TransactionDetails>
                      <TransactionTitle>Task Completed: Take Out Trash</TransactionTitle>
                      <TransactionDate>April 2, 2025</TransactionDate>
                    </TransactionDetails>
                    <TransactionAmount type="credit">+50 points</TransactionAmount>
                  </TransactionItem>
                  <TransactionItem>
                    <TransactionDetails>
                      <TransactionTitle>Points Dispensed</TransactionTitle>
                      <TransactionDate>March 30, 2025</TransactionDate>
                    </TransactionDetails>
                    <TransactionAmount type="debit">-100 points</TransactionAmount>
                  </TransactionItem>
                </TransactionList>
              </TransactionHistory>
            </>
          )}
          
          {activeTab === 'special' && (
            <>
              <h3>Available Special Rewards</h3>
              <RewardList>
                {availableSpecialRewards.length > 0 ? (
                  availableSpecialRewards.map(reward => (
                    <RewardCard key={reward.id}>
                      <RewardTitle>{reward.title}</RewardTitle>
                      <RewardDescription>{reward.description}</RewardDescription>
                    </RewardCard>
                  ))
                ) : (
                  <EmptyState>No special rewards in your lily pad yet! Complete more tasks to earn some toad-ally awesome rewards!</EmptyState>
                )}
              </RewardList>
              
              {pendingSpecialRewards.length > 0 && (
                <>
                  <h3>Pending Redemption</h3>
                  <RewardList>
                    {pendingSpecialRewards.map(reward => (
                      <RewardCard key={reward.id}>
                        <RewardTitle>{reward.title}</RewardTitle>
                        <RewardDescription>{reward.description}</RewardDescription>
                        <div style={{ color: 'var(--text-color-light)', textAlign: 'center', padding: '0.5rem' }}>
                          Waiting for Approval
                        </div>
                      </RewardCard>
                    ))}
                  </RewardList>
                </>
              )}
              
              {redeemedSpecialRewards.length > 0 && (
                <>
                  <h3>Redeemed Rewards</h3>
                  <RewardList>
                    {redeemedSpecialRewards.map(reward => (
                      <RewardCard key={reward.id}>
                        <RewardTitle>{reward.title}</RewardTitle>
                        <RewardDescription>{reward.description}</RewardDescription>
                        <div style={{ color: 'var(--success-color)', textAlign: 'center', padding: '0.5rem' }}>
                          Redeemed ✓
                        </div>
                      </RewardCard>
                    ))}
                  </RewardList>
                </>
              )}
            </>
          )}
        </TabContent>
      </ReserveContainer>
    );
  } catch (error) {
    console.error('Error rendering RibbitReserve:', error);
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Something went wrong</h2>
        <p>We're having trouble loading your rewards. Please try refreshing the page.</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{ 
            padding: '0.75rem 1.5rem', 
            backgroundColor: 'var(--primary-color)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '0.5rem', 
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Refresh Page
        </button>
      </div>
    );
  }
};

export default RibbitReserve;

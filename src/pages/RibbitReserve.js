import React, { useState } from 'react';
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
  const { rewardBank, redeemMoney, redeemPoints, redeemSpecial, loading } = useReward();
  const [activeTab, setActiveTab] = useState('money');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemingRewardId, setRedeemingRewardId] = useState(null);
  const [redeeming, setRedeeming] = useState(false);
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  // Handle money redemption
  const handleRedeemMoney = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const amount = parseFloat(redeemAmount);
    if (isNaN(amount) || amount <= 0) {
      if (alerts) {
        alerts.error('Please enter a valid amount');
      }
      return;
    }
    
    // Check if amount is greater than balance
    if (amount > rewardBank?.money?.balance) {
      if (alerts) {
        alerts.error('You cannot redeem more than your balance');
      }
      return;
    }
    
    setRedeeming(true);
    
    try {
      const success = await redeemMoney(amount);
      
      if (success) {
        setRedeemAmount('');
        
        if (alerts) {
          alerts.success('Redemption request sent to your parent');
        }
      }
    } catch (error) {
      console.error('Error redeeming money:', error);
      
      if (alerts) {
        alerts.error('Failed to redeem money. Please try again.');
      }
    }
    
    setRedeeming(false);
  };
  
  // Handle points redemption
  const handleRedeemPoints = async (e) => {
    e.preventDefault();
    
    // Validate amount
    const points = parseInt(redeemAmount);
    if (isNaN(points) || points <= 0) {
      if (alerts) {
        alerts.error('Please enter a valid number of points');
      }
      return;
    }
    
    // Check if points is greater than balance
    if (points > rewardBank?.points?.balance) {
      if (alerts) {
        alerts.error('You cannot redeem more than your balance');
      }
      return;
    }
    
    setRedeeming(true);
    
    try {
      const success = await redeemPoints(points);
      
      if (success) {
        setRedeemAmount('');
        
        if (alerts) {
          alerts.success('Redemption request sent to your parent');
        }
      }
    } catch (error) {
      console.error('Error redeeming points:', error);
      
      if (alerts) {
        alerts.error('Failed to redeem points. Please try again.');
      }
    }
    
    setRedeeming(false);
  };
  
  // Handle special reward redemption
  const handleRedeemSpecial = async (rewardId) => {
    setRedeemingRewardId(rewardId);
    
    try {
      const success = await redeemSpecial(rewardId);
      
      if (success && alerts) {
        alerts.success('Redemption request sent to your parent');
      }
    } catch (error) {
      console.error('Error redeeming special reward:', error);
      
      if (alerts) {
        alerts.error('Failed to redeem reward. Please try again.');
      }
    }
    
    setRedeemingRewardId(null);
  };
  
  // Show loading indicator while data is loading
  if (loading) {
    return <Loading message="Loading Ribbit Reserve..." />;
  }
  
  // Mock data for demonstration (replace with actual data from rewardBank)
  const moneyBalance = rewardBank?.money?.balance || 0;
  const interestRate = rewardBank?.money?.interestRate || 0;
  const pointsBalance = rewardBank?.points?.balance || 0;
  const specialRewards = rewardBank?.specialRewards || [];
  
  // Filter special rewards by status
  const availableSpecialRewards = specialRewards.filter(reward => reward.status === 'available');
  const pendingSpecialRewards = specialRewards.filter(reward => reward.status === 'pending_redemption');
  const redeemedSpecialRewards = specialRewards.filter(reward => reward.status === 'redeemed');
  
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
            
            <Form onSubmit={handleRedeemMoney}>
              <FormRow>
                <FormGroup>
                  <label htmlFor="redeemAmount">Amount to Redeem</label>
                  <input
                    id="redeemAmount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter amount"
                    disabled={redeeming}
                  />
                </FormGroup>
                <SubmitButton type="submit" disabled={redeeming || moneyBalance <= 0}>
                  {redeeming ? 'Redeeming...' : 'Redeem Money'}
                </SubmitButton>
              </FormRow>
            </Form>
            
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
                    <TransactionTitle>Money Redeemed</TransactionTitle>
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
            
            <Form onSubmit={handleRedeemPoints}>
              <FormRow>
                <FormGroup>
                  <label htmlFor="redeemPoints">Points to Redeem</label>
                  <input
                    id="redeemPoints"
                    type="number"
                    min="1"
                    step="1"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter points"
                    disabled={redeeming}
                  />
                </FormGroup>
                <SubmitButton type="submit" disabled={redeeming || pointsBalance <= 0}>
                  {redeeming ? 'Redeeming...' : 'Redeem Points'}
                </SubmitButton>
              </FormRow>
            </Form>
            
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
                    <TransactionTitle>Points Redeemed</TransactionTitle>
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
                    <RewardButton
                      onClick={() => handleRedeemSpecial(reward.id)}
                      disabled={redeemingRewardId === reward.id}
                    >
                      {redeemingRewardId === reward.id ? 'Redeeming...' : 'Redeem Reward'}
                    </RewardButton>
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
                      <RewardButton disabled>
                        Waiting for Approval
                      </RewardButton>
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
                      <RewardButton redeemed>
                        Redeemed ✓
                      </RewardButton>
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
};

export default RibbitReserve;

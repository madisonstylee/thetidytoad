import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { signInChild } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import ToadMascot from '../components/ToadMascot';

// Styled container for the login page
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
`;

// Styled form
const LoginForm = styled.form`
  width: 100%;
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
`;

// Styled heading
const Heading = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--accent-color);
  text-align: center;
  margin-bottom: 1.5rem;
`;

// Styled form group
const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

// Styled error message
const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

// Styled button container
const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
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

// Styled link
const StyledLink = styled(Link)`
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Styled divider
const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1rem 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid var(--background-dark);
  }
  
  span {
    padding: 0 1rem;
    color: var(--text-color-light);
    font-size: 0.9rem;
  }
`;

// Styled parent login button
const ParentLoginButton = styled(Link)`
  display: block;
  width: 100%;
  text-align: center;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
    text-decoration: none;
    color: white;
  }
`;

// Styled help text
const HelpText = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-color-light);
`;

/**
 * ChildLogin component for child login
 * @returns {JSX.Element} - Rendered component
 */
const ChildLogin = ({ alerts }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { childLogin } = useAuth();
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      console.log(`Attempting to sign in child with username: ${username}`);
      
      // Sign in child
      const childData = await signInChild(username, password);
      
      console.log('Child data received:', childData);
      
      if (!childData) {
        throw new Error('No child data returned from sign in');
      }
      
      // Update auth context
      await childLogin(childData);
      
      console.log('Child login successful, navigating to dashboard');
      
      // Show success alert if available
      if (alerts) {
        alerts.success('Successfully logged in!');
      }
      
      // Navigate to child dashboard
      navigate('/child-dashboard');
    } catch (error) {
      console.error('Child login error:', error);
      
      // Provide more specific error messages
      if (error.message === 'Child not found') {
        setError(`No child account found with username "${username}". Please check the username and try again.`);
      } else if (error.message === 'Invalid password') {
        setError('Incorrect password. Please try again.');
      } else if (error.message === 'Invalid child data') {
        setError('There was a problem with your account data. Please contact a parent for help.');
      } else {
        setError('Failed to log in. Please check your username and password and try again.');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <ToadMascot 
        size={120} 
        message="Hi there, friend!" 
        animate="jump"
      />
      
      <LoginForm onSubmit={handleSubmit}>
        <Heading>Kid Login</Heading>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </FormGroup>
        
        <ButtonContainer>
          <div></div> {/* Empty div for spacing */}
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </SubmitButton>
        </ButtonContainer>
        
        <HelpText>
          Ask your parent for your username and password
        </HelpText>
      </LoginForm>
      
      <Divider>
        <span>OR</span>
      </Divider>
      
      <ParentLoginButton to="/login">
        Parent Login
      </ParentLoginButton>
    </LoginContainer>
  );
};

export default ChildLogin;

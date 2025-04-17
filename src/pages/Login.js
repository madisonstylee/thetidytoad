import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { signInParent } from '../services/authService';
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
  color: var(--primary-color);
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
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
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

// Styled kid login button
const KidLoginButton = styled(Link)`
  display: block;
  width: 100%;
  text-align: center;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--accent-color-dark);
    text-decoration: none;
    color: white;
  }
`;

/**
 * Login component for parent login
 * @returns {JSX.Element} - Rendered component
 */
const Login = ({ alerts }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || '/parent-dashboard';
  
  // Check for message and email in location state (from adding a parent)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
    }
    
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Sign in parent
      await signInParent(email, password);
      
      // Show success alert if available
      if (alerts) {
        alerts.success('Successfully logged in!');
      }
      
      // Small delay to ensure Firebase Auth state is updated
      setTimeout(() => {
        // Navigate to redirect path
        navigate(from, { replace: true });
      }, 500);
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed login attempts. Please try again later or reset your password.');
      } else {
        setError('Failed to log in. Please check your credentials and try again.');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <LoginContainer>
      <ToadMascot 
        size={120} 
        message="Welcome back!" 
      />
      
      <LoginForm onSubmit={handleSubmit}>
        <Heading>Parent Login</Heading>
        
        {message && (
          <div style={{ 
            backgroundColor: '#E8F5E9', 
            color: '#388E3C', 
            padding: '0.75rem', 
            borderRadius: 'var(--border-radius-md)', 
            marginBottom: '1.5rem', 
            fontSize: '0.9rem' 
          }}>
            {message}
          </div>
        )}
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormGroup>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
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
          <StyledLink to="/register">Create an account</StyledLink>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </SubmitButton>
        </ButtonContainer>
      </LoginForm>
      
      <Divider>
        <span>OR</span>
      </Divider>
      
      <KidLoginButton to="/child-login">
        Kid Login
      </KidLoginButton>
    </LoginContainer>
  );
};

export default Login;

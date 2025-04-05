import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { registerParent } from '../services/authService';
import ToadMascot from '../components/ToadMascot';

// Styled container for the register page
const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
`;

// Styled form
const RegisterForm = styled.form`
  width: 100%;
  background-color: var(--background-light);
  padding: 2rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
`;

// Styled heading
const Heading = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 1rem;
`;

// Styled subheading
const Subheading = styled.p`
  text-align: center;
  margin-bottom: 2rem;
  color: var(--text-color-light);
`;

// Styled form group
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

// Styled form row
const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 640px) {
    flex-direction: column;
    gap: 1.5rem;
  }
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

// Styled password requirements
const PasswordRequirements = styled.ul`
  font-size: 0.8rem;
  color: var(--text-color-light);
  margin-top: 0.5rem;
  padding-left: 1.5rem;
`;

/**
 * Register component for parent registration
 * @returns {JSX.Element} - Rendered component
 */
const Register = ({ alerts }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Validate password
  const validatePassword = (password) => {
    // Password must be at least 8 characters long
    if (password.length < 8) {
      return false;
    }
    
    // Password must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      return false;
    }
    
    // Password must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      return false;
    }
    
    // Password must contain at least one number
    if (!/[0-9]/.test(password)) {
      return false;
    }
    
    return true;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Validate password
    if (!validatePassword(password)) {
      setError('Password does not meet requirements');
      return;
    }
    
    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Register parent
      await registerParent(email, password, firstName, lastName);
      
      // Show success alert if available
      if (alerts) {
        alerts.success('Account created successfully! Please log in with your new credentials.');
      }
      
      // Navigate to login page instead of dashboard
      // This ensures the user is properly authenticated before accessing protected routes
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already in use. Please use a different email or log in.');
      } else {
        setError('Failed to create an account. Please try again.');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <RegisterContainer>
      <ToadMascot 
        size={120} 
        message="Let's get started!" 
      />
      
      <RegisterForm onSubmit={handleSubmit}>
        <Heading>Create an Account</Heading>
        <Subheading>Sign up as a parent to manage tasks for your kids</Subheading>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <FormRow>
          <FormGroup>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </FormGroup>
        </FormRow>
        
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
            placeholder="Create a password"
            required
          />
          <PasswordRequirements>
            <li>At least 8 characters long</li>
            <li>Contains at least one uppercase letter</li>
            <li>Contains at least one lowercase letter</li>
            <li>Contains at least one number</li>
          </PasswordRequirements>
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
          />
        </FormGroup>
        
        <ButtonContainer>
          <StyledLink to="/login">Already have an account? Log in</StyledLink>
          <SubmitButton type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </SubmitButton>
        </ButtonContainer>
      </RegisterForm>
    </RegisterContainer>
  );
};

export default Register;

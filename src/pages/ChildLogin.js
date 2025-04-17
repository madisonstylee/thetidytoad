import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import ToadMascot from '../components/ToadMascot';
import { 
  findChildProfile, 
  verifyChildPin, 
  createChildSession 
} from '../services/sessionService';
import { 
  collection, 
  query, 
  where, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../services/firebase';

// Styled components
const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  max-width: 500px;
  margin: 0 auto;
`;

const LoginForm = styled.form`
  width: 100%;
  background-color: var(--background-light);
  padding: 1.5rem;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-md);
`;

const Heading = styled.h1`
  font-family: var(--font-family-fun);
  color: var(--accent-color);
  text-align: center;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--background-dark);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--background-dark);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  transition: border-color 0.2s;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`;

const PinContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
`;

const PinDigit = styled.input`
  width: 3rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
  border: 2px solid var(--background-dark);
  border-radius: var(--border-radius-md);
  margin: 0 0.25rem;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(244, 67, 54, 0.1);
  padding: 0.75rem;
  border-radius: var(--border-radius-md);
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--accent-color-dark);
  }
  
  &:disabled {
    background-color: var(--background-dark);
    cursor: not-allowed;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 1.5rem 0;
  
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

const HelpText = styled.p`
  text-align: center;
  margin-top: 1rem;
  font-size: 0.9rem;
  color: var(--text-color-light);
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Step = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.active ? 'var(--accent-color)' : 'var(--background-dark)'};
  margin: 0 5px;
`;

/**
 * ChildLogin component for PIN-based child login
 * @returns {JSX.Element} - Rendered component
 */
const ChildLogin = ({ alerts }) => {
  const [step, setStep] = useState(1); // 1: Family Email, 2: Child Selection, 3: PIN
  const [familyEmail, setFamilyEmail] = useState('');
  const [selectedChild, setSelectedChild] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [childProfile, setChildProfile] = useState(null);
  
  const navigate = useNavigate();
  const { setChildMode, isLoggedIn, authMode } = useAuth();
  
  // Refs for PIN inputs
  const pinRefs = [
    React.useRef(null),
    React.useRef(null),
    React.useRef(null),
    React.useRef(null)
  ];
  
  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      if (authMode === 'child') {
        navigate('/child-dashboard');
      } else {
        navigate('/parent-dashboard');
      }
    }
  }, [isLoggedIn, authMode, navigate]);
  
  // Handle family email submission
  const handleFamilyEmailSubmit = async (e) => {
    e.preventDefault();
    
    if (!familyEmail) {
      setError('Please enter your family email');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Find parent by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', familyEmail),
        where('role', '==', 'parent')
      );
      
      const querySnapshot = await getDocs(usersQuery);
      
      if (querySnapshot.empty) {
        setError('No family found with this email. Please check the email or ask your parent for the correct email.');
        setLoading(false);
        return;
      }
      
      const parentDoc = querySnapshot.docs[0];
      const parentData = parentDoc.data();
      const familyId = parentData.familyId;
      
      // Find children for this family
      const childrenQuery = query(
        collection(db, 'children'),
        where('familyId', '==', familyId)
      );
      
      const childrenSnapshot = await getDocs(childrenQuery);
      
      if (childrenSnapshot.empty) {
        setError('No children found for this family. Please ask your parent to add you.');
        setLoading(false);
        return;
      }
      
      const childProfiles = childrenSnapshot.docs.map(doc => doc.data());
      setAvailableChildren(childProfiles);
      setStep(2);
    } catch (error) {
      console.error('Error finding family:', error);
      setError('Could not find your family. Please check the email and try again.');
    }
    
    setLoading(false);
  };
  
  // Handle child selection
  const handleChildSelect = (e) => {
    const childId = e.target.value;
    setSelectedChild(childId);
    
    if (childId) {
      const profile = availableChildren.find(child => child.id === childId);
      setChildProfile(profile);
      setStep(3);
      
      // Focus the first PIN input
      setTimeout(() => {
        if (pinRefs[0].current) {
          pinRefs[0].current.focus();
        }
      }, 100);
    }
  };
  
  // Handle PIN input
  const handlePinChange = (index, value) => {
    if (value.length > 1) {
      value = value.charAt(0);
    }
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    
    // Auto-focus next input
    if (value && index < 3) {
      pinRefs[index + 1].current.focus();
    }
  };
  
  // Handle PIN submission
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    
    const fullPin = pin.join('');
    
    if (fullPin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Verify PIN against Firestore
      if (childProfile.pin === fullPin) {
        // Create child session
        const session = createChildSession(childProfile);
        setChildMode(childProfile);
        
        // Show success alert if available
        if (alerts) {
          alerts.success(`Welcome, ${childProfile.firstName}!`);
        }
        
        // Navigate to child dashboard
        navigate('/child-dashboard');
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin(['', '', '', '']);
        
        // Focus the first PIN input
        if (pinRefs[0].current) {
          pinRefs[0].current.focus();
        }
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      setError('Could not verify your PIN. Please try again.');
    }
    
    setLoading(false);
  };
  
  // Handle back button
  const handleBack = () => {
    if (step === 2) {
      setStep(1);
      setSelectedChild('');
      setChildProfile(null);
    } else if (step === 3) {
      setStep(2);
      setPin(['', '', '', '']);
    }
  };
  
  return (
    <LoginContainer>
      <ToadMascot 
        size={120} 
        message="Hi there, friend!" 
        animate="jump"
        showRibbit={false}
      />
      
      <LoginForm onSubmit={step === 1 ? handleFamilyEmailSubmit : step === 3 ? handlePinSubmit : null}>
        <Heading>Kid Login</Heading>
        
        <StepIndicator>
          <Step active={step >= 1} />
          <Step active={step >= 2} />
          <Step active={step >= 3} />
        </StepIndicator>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        {step === 1 && (
          <FormGroup>
            <Label htmlFor="familyEmail">Parent's Email</Label>
            <Input
              id="familyEmail"
              type="email"
              value={familyEmail}
              onChange={(e) => setFamilyEmail(e.target.value)}
              placeholder="Enter your parent's email address"
              required
            />
            <HelpText>This is the email your parent used to create their account</HelpText>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Checking...' : 'Next'}
            </SubmitButton>
          </FormGroup>
        )}
        
        {step === 2 && (
          <FormGroup>
            <Label htmlFor="childSelect">Who are you?</Label>
            <Select
              id="childSelect"
              value={selectedChild}
              onChange={handleChildSelect}
              required
            >
              <option value="">Select your name</option>
              {availableChildren.map(child => (
                <option key={child.id} value={child.id}>
                  {child.firstName}
                </option>
              ))}
            </Select>
            
            <SubmitButton type="button" onClick={handleBack}>
              Back
            </SubmitButton>
          </FormGroup>
        )}
        
        {step === 3 && (
          <FormGroup>
            <Label>Enter your PIN</Label>
            <PinContainer>
              {pin.map((digit, index) => (
                <PinDigit
                  key={index}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  ref={pinRefs[index]}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                />
              ))}
            </PinContainer>
            <HelpText>Ask your parent for your PIN</HelpText>
            
            <SubmitButton type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </SubmitButton>
            
            <SubmitButton type="button" onClick={handleBack} style={{ backgroundColor: 'var(--background-dark)' }}>
              Back
            </SubmitButton>
          </FormGroup>
        )}
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

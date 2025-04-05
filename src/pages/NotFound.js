import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import ToadMascot from '../components/ToadMascot';

// Styled container for the not found page
const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 2rem;
  min-height: 60vh;
`;

// Styled heading
const Heading = styled.h1`
  font-family: var(--font-family-fun);
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

// Styled subheading
const Subheading = styled.h2`
  font-size: 1.5rem;
  color: var(--text-color);
  margin-bottom: 2rem;
`;

// Styled message
const Message = styled.p`
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  max-width: 600px;
`;

// Styled button
const Button = styled(Link)`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-color-dark);
    text-decoration: none;
    color: white;
  }
`;

/**
 * NotFound component displays a 404 page
 * @returns {JSX.Element} - Rendered component
 */
const NotFound = () => {
  return (
    <NotFoundContainer>
      <ToadMascot 
        size={150} 
        message="Oops! I can't find that page!" 
      />
      
      <Heading>404</Heading>
      <Subheading>Page Not Found</Subheading>
      
      <Message>
        The page you're looking for doesn't exist or has been moved.
        Let's hop back to a page that exists!
      </Message>
      
      <Button to="/">
        Go Home
      </Button>
    </NotFoundContainer>
  );
};

export default NotFound;

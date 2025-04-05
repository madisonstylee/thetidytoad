import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// Styled footer container
const FooterContainer = styled.footer`
  background-color: var(--background-dark);
  color: var(--text-color-light);
  padding: 2rem 1rem;
  margin-top: auto;
`;

// Styled footer content
const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

// Styled footer section
const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  @media (min-width: 768px) {
    align-items: flex-start;
  }
`;

// Styled footer title
const FooterTitle = styled.h3`
  font-family: var(--font-family-fun);
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

// Styled footer link
const FooterLink = styled(Link)`
  color: var(--text-color-light);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
    text-decoration: none;
  }
`;

// Styled external link
const ExternalLink = styled.a`
  color: var(--text-color-light);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-color);
    text-decoration: none;
  }
`;

// Styled copyright text
const Copyright = styled.p`
  font-size: 0.8rem;
  text-align: center;
  margin-top: 2rem;
  color: var(--text-color-light);
  opacity: 0.8;
`;

// Styled logo
const Logo = styled.div`
  font-family: var(--font-family-fun);
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

/**
 * Footer component displays the application footer
 * @returns {JSX.Element} - Rendered component
 */
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <Logo>
            🐸 The Tidy Toad
          </Logo>
          <p>A fun task management app for kids and parents</p>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Navigation</FooterTitle>
          <FooterLink to="/">Home</FooterLink>
          <FooterLink to="/login">Login</FooterLink>
          <FooterLink to="/register">Sign Up</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Resources</FooterTitle>
          <FooterLink to="/help">Help Center</FooterLink>
          <FooterLink to="/faq">FAQ</FooterLink>
          <FooterLink to="/contact">Contact Us</FooterLink>
        </FooterSection>
        
        <FooterSection>
          <FooterTitle>Legal</FooterTitle>
          <FooterLink to="/privacy">Privacy Policy</FooterLink>
          <FooterLink to="/terms">Terms of Service</FooterLink>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        &copy; {currentYear} The Tidy Toad. All rights reserved.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;

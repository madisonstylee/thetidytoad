import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { signOutUser } from '../services/authService';
import { clearSession } from '../services/sessionService';
import ToadMascot from './ToadMascot';

// Styled header container
const HeaderContainer = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

// Styled logo container
const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Styled slogan text
const SloganText = styled.div`
  font-family: var(--font-family-fun);
  font-size: 0.9rem;
  color: #E8F5E9;
  margin-left: 0.5rem;
  font-style: italic;
`;

// Styled logo text
const LogoText = styled(Link)`
  font-family: var(--font-family-fun);
  font-size: 1.8rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
  
  &:hover {
    text-decoration: none;
    color: white;
  }
`;

// Styled navigation container
const NavContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

// Styled navigation link
const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  margin: 0 0.3rem;
  font-family: var(--font-family-fun);
  background-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    text-decoration: none;
    color: white;
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

// Styled button
const Button = styled.button`
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--accent-color-dark);
  }
`;

// Styled user info container
const UserInfoContainer = styled.div`
  position: relative;
  
  &:hover > div:last-child {
    display: block;
  }
`;

// Styled user info
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Styled user avatar
const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--accent-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  
  img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
  }
`;

// Styled user name
const UserName = styled.span`
  font-weight: 500;
`;

// Styled dropdown menu
const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 100;
  min-width: 150px;
  display: none;
`;

// Styled dropdown item
const DropdownItem = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  text-decoration: none;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--background-light);
    text-decoration: none;
    color: var(--text-color);
  }
`;

// Styled dropdown button
const DropdownButton = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  color: var(--text-color);
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--background-light);
  }
`;

// Styled notification badge
const NotificationBadge = styled.div`
  position: relative;
  
  &::after {
    content: "${props => props.count}";
    position: absolute;
    top: -8px;
    right: -8px;
    background-color: var(--error-color);
    color: white;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

/**
 * Header component displays the application header
 * @returns {JSX.Element} - Rendered component
 */
const Header = () => {
  const { userData, childProfile, isLoggedIn, isParent, isChild, clearChildMode } = useAuth();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = async () => {
    try {
      if (isChild) {
        // Clear child session, update auth context, and navigate to login
        clearSession();
        // Use clearChildMode from AuthContext to properly update the auth state
        clearChildMode();
        navigate('/login');
      } else {
        // Sign out parent user
        await signOutUser();
        navigate('/login');
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (isChild && childProfile) {
      const firstName = childProfile.firstName || '';
      const lastName = childProfile.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (userData) {
      const firstName = userData.firstName || '';
      const lastName = userData.lastName || '';
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    return '';
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <ToadMascot size={50} />
          <div>
            <LogoText to={isLoggedIn ? (isParent ? '/parent-dashboard' : '/child-dashboard') : '/'}>
              The Tidy Toad
            </LogoText>
            <SloganText>A toad-ally awesome way to manage tasks and earn rewards!</SloganText>
          </div>
      </LogoContainer>
      
      <NavContainer>
        {isLoggedIn ? (
          <>
            {/* Parent navigation links */}
            {isParent && (
              <>
                <NavLink to="/parent-dashboard">Dashboard</NavLink>
                <NavLink to="/task-manager">Tasks</NavLink>
                <NavLink to="/reward-manager">Ribbit Reserve</NavLink>
                <NavLink to="/notifications">
                  {unreadCount > 0 ? (
                    <NotificationBadge count={unreadCount}>
                      📬
                    </NotificationBadge>
                  ) : (
                    '🔔'
                  )}
                </NavLink>
              </>
            )}
            
            {/* Child navigation links */}
            {isChild && (
              <>
                <NavLink to="/child-dashboard">Dashboard</NavLink>
                <NavLink to="/ribbit-reserve">Ribbit Reserve</NavLink>
                <NavLink to="/notifications">
                  {unreadCount > 0 ? (
                    <NotificationBadge count={unreadCount}>
                      📬
                    </NotificationBadge>
                  ) : (
                    '🔔'
                  )}
                </NavLink>
              </>
            )}
            
            {/* User dropdown */}
            <UserInfoContainer>
              <UserInfo>
                <UserAvatar>
                  {isChild && childProfile ? (
                    childProfile.profilePicture ? (
                      <img src={childProfile.profilePicture} alt={`${childProfile.firstName}'s avatar`} />
                    ) : (
                      getUserInitials()
                    )
                  ) : userData && userData.profilePicture ? (
                    <img src={userData.profilePicture} alt={`${userData.firstName}'s avatar`} />
                  ) : (
                    getUserInitials()
                  )}
                </UserAvatar>
                <UserName>
                  {isChild && childProfile ? childProfile.firstName : userData ? userData.firstName : ''}
                </UserName>
              </UserInfo>
              
              <DropdownMenu>
                {isParent && (
                  <DropdownItem to="/profile">
                    Family Settings
                  </DropdownItem>
                )}
                <DropdownButton onClick={handleLogout}>
                  Logout
                </DropdownButton>
              </DropdownMenu>
            </UserInfoContainer>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <Button as={Link} to="/register">
              Sign Up
            </Button>
          </>
        )}
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header;

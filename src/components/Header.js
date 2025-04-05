import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { signOutUser } from '../services/authService';
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
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    text-decoration: none;
    color: white;
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
  right: 1rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 100;
  min-width: 150px;
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
  const { userData, isLoggedIn, isParent, isChild, childLogout } = useAuth();
  const { unreadCount } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle dropdown menu
  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Close dropdown menu
  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      if (isChild) {
        childLogout();
      } else {
        await signOutUser();
      }
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Get user's initials for avatar
  const getUserInitials = () => {
    if (!userData) return '';
    
    const firstName = userData.firstName || '';
    const lastName = userData.lastName || '';
    
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <HeaderContainer>
      <LogoContainer>
        <ToadMascot size={50} />
        <LogoText to={isLoggedIn ? (isParent ? '/parent-dashboard' : '/child-dashboard') : '/'}>
          The Tidy Toad
        </LogoText>
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
            <div style={{ position: 'relative' }}>
              <UserInfo onClick={toggleDropdown}>
                <UserAvatar>
                  {userData.profilePicture ? (
                    <img src={userData.profilePicture} alt={`${userData.firstName}'s avatar`} />
                  ) : (
                    getUserInitials()
                  )}
                </UserAvatar>
                <UserName>{userData.firstName}</UserName>
              </UserInfo>
              
              {dropdownOpen && (
                <DropdownMenu>
                  <DropdownItem to="/profile" onClick={closeDropdown}>
                    Profile
                  </DropdownItem>
                  <DropdownButton onClick={handleLogout}>
                    Logout
                  </DropdownButton>
                </DropdownMenu>
              )}
            </div>
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

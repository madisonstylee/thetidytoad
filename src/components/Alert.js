import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for alert appearance
const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

// Animation for alert disappearance
const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-20px);
    opacity: 0;
  }
`;

// Styled container for the alert
const AlertContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  min-width: 300px;
  max-width: 90%;
  animation: ${props => props.isClosing ? slideOut : slideIn} 0.3s ease-in-out;
`;

// Styled alert box
const AlertBox = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  background-color: ${props => {
    switch (props.type) {
      case 'success':
        return 'var(--success-color)';
      case 'error':
        return 'var(--error-color)';
      case 'warning':
        return 'var(--warning-color)';
      default:
        return 'var(--info-color)';
    }
  }};
  color: white;
  font-family: var(--font-family-main);
`;

// Styled icon for the alert
const AlertIcon = styled.div`
  margin-right: 12px;
  font-size: 20px;
`;

// Styled message for the alert
const AlertMessage = styled.div`
  flex: 1;
  font-size: 14px;
`;

// Styled close button for the alert
const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-left: 12px;
  padding: 0;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
`;

/**
 * Alert component displays a notification message
 * @param {Object} props - Component props
 * @param {string} props.type - Alert type ('success', 'error', 'warning', 'info')
 * @param {string} props.message - Alert message
 * @param {number} props.duration - Duration in milliseconds before auto-closing (0 for no auto-close)
 * @param {function} props.onClose - Function to call when alert is closed
 * @returns {JSX.Element|null} - Rendered component or null if not visible
 */
const Alert = ({ type = 'info', message, duration = 5000, onClose }) => {
  const [visible, setVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  // Auto-close the alert after duration
  useEffect(() => {
    let closeTimer;
    let removeTimer;

    if (duration > 0) {
      closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
    }

    return () => {
      clearTimeout(closeTimer);
      clearTimeout(removeTimer);
    };
  }, [duration]);

  // Handle closing the alert
  const handleClose = () => {
    setIsClosing(true);
    
    // Wait for animation to complete before removing
    const removeTimer = setTimeout(() => {
      setVisible(false);
      if (onClose) {
        onClose();
      }
    }, 300); // Match animation duration
  };

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  // Get icon based on alert type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <AlertContainer isClosing={isClosing}>
      <AlertBox type={type}>
        <AlertIcon>{getIcon()}</AlertIcon>
        <AlertMessage>{message}</AlertMessage>
        <CloseButton onClick={handleClose} aria-label="Close">
          ×
        </CloseButton>
      </AlertBox>
    </AlertContainer>
  );
};

export default Alert;

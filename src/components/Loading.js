import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for the loading spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Animation for the jumping toad
const jump = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
`;

// Styled container for the loading component
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: ${props => props.fullScreen ? '100vh' : '200px'};
  width: 100%;
`;

// Styled spinner
const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: var(--primary-color);
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;

// Styled toad icon for loading
const ToadLoader = styled.div`
  font-size: 40px;
  animation: ${jump} 1s ease-in-out infinite;
  margin-bottom: 16px;
`;

// Styled text for loading message
const LoadingText = styled.p`
  font-size: 16px;
  color: var(--text-color);
  font-family: var(--font-family-fun);
`;

/**
 * Loading component displays a loading indicator
 * @param {Object} props - Component props
 * @param {string} props.message - Loading message to display
 * @param {boolean} props.fullScreen - Whether to display the loading indicator full screen
 * @param {boolean} props.useToad - Whether to use the toad icon instead of a spinner
 * @returns {JSX.Element} - Rendered component
 */
const Loading = ({ message = 'Loading...', fullScreen = false, useToad = true }) => {
  return (
    <LoadingContainer fullScreen={fullScreen}>
      {useToad ? (
        <ToadLoader role="status">
          🐸
        </ToadLoader>
      ) : (
        <Spinner role="status">
          <span className="sr-only">Loading...</span>
        </Spinner>
      )}
      <LoadingText>{message}</LoadingText>
    </LoadingContainer>
  );
};

export default Loading;

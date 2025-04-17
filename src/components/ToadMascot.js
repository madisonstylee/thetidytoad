import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for the toad's idle movement
const breathe = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

// Animation for the toad's blinking
const blink = keyframes`
  0%, 45%, 55%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
`;

// Animation for the toad's jumping
const jump = keyframes`
  0%, 100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(0.95);
  }
`;

// Animation for the toad's tongue
const tongue = keyframes`
  0%, 100% {
    transform: scaleY(0);
    opacity: 0;
  }
  10%, 90% {
    transform: scaleY(1);
    opacity: 1;
  }
  50% {
    transform: scaleY(1.2);
  }
`;

// Animation for the ribbit text
const ribbitPop = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  20% {
    opacity: 1;
    transform: scale(1.2);
  }
  80% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
`;

// Styled container for the toad mascot
const ToadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
`;

// Styled lily pad
const LilyPad = styled.div`
  position: absolute;
  bottom: 0;
  width: ${props => props.size * 0.9}px;
  height: ${props => props.size * 0.2}px;
  background-color: #4CAF50;
  border-radius: 50%;
  z-index: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 10%;
    width: 80%;
    height: 80%;
    background-color: #66BB6A;
    border-radius: 50%;
  }
`;

// Styled toad image
const ToadImage = styled.img`
  width: ${props => props.size * 0.8}px;
  height: ${props => props.size * 0.8}px;
  position: relative;
  bottom: -10px; /* Move the frog down to sit on the lily pad */
  animation: ${props => props.animate === 'jump' 
    ? jump 
    : breathe} 
    ${props => props.animate === 'jump' ? '0.6s' : '3s'} 
    ease-in-out 
    ${props => props.animate === 'jump' ? 'forwards' : 'infinite'};
  z-index: 1;
  opacity: ${props => props.loaded ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

// Fallback toad component (CSS-based) in case the SVG fails to load
const FallbackToad = styled.div`
  width: ${props => props.size * 0.8}px;
  height: ${props => props.size * 0.8}px;
  position: relative;
  background-color: #4CAF50;
  border-radius: 50%;
  z-index: 1;
  
  &::before {
    content: "";
    position: absolute;
    top: 20%;
    left: 15%;
    width: 30%;
    height: 20%;
    background-color: white;
    border-radius: 50%;
  }
  
  &::after {
    content: "";
    position: absolute;
    top: 20%;
    right: 15%;
    width: 30%;
    height: 20%;
    background-color: white;
    border-radius: 50%;
  }
`;

// Styled tongue for the toad
const Tongue = styled.div`
  position: absolute;
  top: 50%; /* Position at the middle of the frog */
  left: 50%;
  transform: translateX(-50%) scaleY(0);
  width: ${props => props.size * 0.1}px;
  height: ${props => props.size * 0.15}px;
  background-color: #FF5252;
  border-radius: 50% 50% 10% 10%;
  z-index: 2; /* Make sure tongue appears in front of the frog */
  transform-origin: top center;
  opacity: 0;
  animation: ${props => props.show ? tongue : 'none'} 0.5s ease-in-out;
`;

// Styled ribbit text
const RibbitText = styled.div`
  position: absolute;
  top: ${props => props.size * 0.2}px; /* Positioned above the frog */
  right: ${props => props.size * 0.1}px; /* Positioned to the right of the frog */
  font-family: var(--font-family-fun);
  font-size: ${props => props.size * 0.25}px;
  font-weight: bold;
  color: var(--primary-color);
  opacity: 0;
  animation: ${props => props.show ? ribbitPop : 'none'} 2s ease-in-out;
  z-index: 3; /* Make sure it appears above everything */
`;

// Styled speech bubble for the toad
const SpeechBubble = styled.div`
  position: absolute;
  top: ${props => props.size * 0.1}px;
  right: ${props => props.size * 1.1}px; /* Moved to the left of the toad */
  background-color: #E8F5E9; /* Light green background */
  border: 2px solid #81C784; /* Green border */
  border-radius: 12px; /* More square-like corners */
  padding: 12px 18px;
  font-family: var(--font-family-fun);
  font-size: ${props => props.size * 0.15}px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: ${props => props.size * 1.8}px; /* Fixed width instead of max-width */
  min-height: ${props => props.size * 0.6}px; /* Minimum height */
  display: flex;
  align-items: center;
  z-index: 1;
  
  &::after {
    content: "";
    position: absolute;
    top: 50%;
    right: -10px;
    transform: translateY(-50%);
    border-width: 10px 0 10px 10px;
    border-style: solid;
    border-color: transparent transparent transparent #81C784;
  }
  
  &::before {
    content: "";
    position: absolute;
    top: 50%;
    right: -7px;
    transform: translateY(-50%);
    border-width: 8px 0 8px 8px;
    border-style: solid;
    border-color: transparent transparent transparent #E8F5E9;
    z-index: 1;
  }
`;

// Styled name tag for the toad
const NameTag = styled.div`
  margin-top: 10px;
  font-family: var(--font-family-fun);
  font-size: ${props => props.size * 0.2}px;
  color: var(--primary-color);
  font-weight: bold;
  background-color: #E8F5E9;
  border-radius: 10px;
  padding: 2px 8px;
  border: 1px solid #81C784;
`;

/**
 * ToadMascot component displays the toad mascot
 * @param {Object} props - Component props
 * @param {number} props.size - Size of the toad in pixels
 * @param {string} props.message - Optional message for the toad to display in a speech bubble
 * @param {string} props.name - Optional name to display under the toad
 * @param {string} props.animate - Animation type ('idle', 'jump')
 * @param {function} props.onClick - Function to call when the toad is clicked
 * @param {boolean} props.showRibbit - Whether to show the ribbit text (defaults to undefined)
 * @returns {JSX.Element} - Rendered component
 */
const ToadMascot = ({ 
  size = 100, 
  message = '', 
  name = '', 
  animate = 'idle',
  onClick = null,
  showRibbit: initialShowRibbit
}) => {
  const [showTongue, setShowTongue] = useState(false);
  const [showRibbit, setShowRibbit] = useState(initialShowRibbit === undefined ? false : initialShowRibbit);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Reset animations on mount and when animate prop changes
  useEffect(() => {
    setShowTongue(false);
    setShowRibbit(false);
  }, [animate]);
  
  // Randomly show tongue and ribbit animations
  useEffect(() => {
    // Only show animations if not jumping
    if (animate !== 'jump') {
      // Random tongue animation
      const tongueInterval = setInterval(() => {
        if (Math.random() < 0.1) { // 10% chance (reduced from 20%)
          setShowTongue(true);
          setTimeout(() => setShowTongue(false), 500);
        }
      }, 10000); // Increased interval from 5000ms to 10000ms
      
      // Random ribbit animation
      const ribbitInterval = setInterval(() => {
        if (Math.random() < 0.05) { // 5% chance (reduced from 15%)
          setShowRibbit(true);
          setTimeout(() => setShowRibbit(false), 2000);
        }
      }, 15000); // Increased interval from 8000ms to 15000ms
      
      return () => {
        clearInterval(tongueInterval);
        clearInterval(ribbitInterval);
      };
    } else {
      // If jumping, make sure tongue and ribbit are hidden
      setShowTongue(false);
      setShowRibbit(false);
    }
  }, [animate]);
  
  // Handle click event
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Show tongue and ribbit when clicked if no onClick handler
      setShowTongue(true);
      setTimeout(() => setShowTongue(false), 500);
      
      setShowRibbit(true);
      setTimeout(() => setShowRibbit(false), 2000);
    }
  };
  
  return (
    <ToadContainer size={size}>
      {message && (
        <SpeechBubble size={size}>
          {message}
        </SpeechBubble>
      )}
      
      {/* Only show Ribbit text if not jumping */}
      {animate !== 'jump' && (
        <RibbitText size={size} show={showRibbit}>
          Ribbit!
        </RibbitText>
      )}
      
      <LilyPad size={size} />
      
      <div onClick={handleClick} style={{ position: 'relative', cursor: 'pointer' }}>
        {imageError ? (
          <FallbackToad size={size} />
        ) : (
          <ToadImage 
            src="/images/frog.svg" 
            size={size} 
            animate={animate}
            alt="Toad mascot"
            loading="eager"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loaded={imageLoaded}
          />
        )}
        <Tongue size={size} show={showTongue} />
      </div>
      
      {name && (
        <NameTag size={size}>
          {name}
        </NameTag>
      )}
    </ToadContainer>
  );
};

export default ToadMascot;

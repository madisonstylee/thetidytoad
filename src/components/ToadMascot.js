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

// Styled toad emoji
const ToadEmoji = styled.div`
  font-size: ${props => props.size * 0.8}px;
  animation: ${props => props.animate === 'jump' 
    ? jump 
    : breathe} 
    ${props => props.animate === 'jump' ? '0.6s' : '3s'} 
    ease-in-out 
    ${props => props.animate === 'jump' ? 'forwards' : 'infinite'};
  position: relative;
  z-index: 1;
  
  /* Left eye */
  &::before {
    content: "👁️";
    position: absolute;
    font-size: ${props => props.size * 0.2}px;
    top: ${props => props.size * 0.35}px; /* Further lowered eyes */
    left: ${props => props.size * 0.2}px;
    animation: ${blink} 4s infinite;
    z-index: 2;
  }
  
  /* Right eye */
  &::after {
    content: "👁️";
    position: absolute;
    font-size: ${props => props.size * 0.2}px;
    top: ${props => props.size * 0.35}px; /* Further lowered eyes */
    right: ${props => props.size * 0.2}px;
    animation: ${blink} 4s infinite;
    z-index: 2;
  }
`;

// Styled tongue for the toad
const Tongue = styled.div`
  position: absolute;
  bottom: ${props => props.size * 0.2}px;
  left: 50%;
  transform: translateX(-50%) scaleY(0);
  width: ${props => props.size * 0.1}px;
  height: ${props => props.size * 0.2}px;
  background-color: #FF5252;
  border-radius: 50% 50% 10% 10%;
  z-index: 0;
  transform-origin: top center;
  opacity: 0;
  animation: ${props => props.show ? tongue : 'none'} 0.5s ease-in-out;
`;

// Styled ribbit text
const RibbitText = styled.div`
  position: absolute;
  top: ${props => props.size * 0.1}px;
  left: ${props => props.size * 0.8}px;
  font-family: var(--font-family-fun);
  font-size: ${props => props.size * 0.25}px;
  font-weight: bold;
  color: var(--primary-color);
  opacity: 0;
  animation: ${props => props.show ? ribbitPop : 'none'} 2s ease-in-out;
  z-index: 2;
`;

// Styled speech bubble for the toad
const SpeechBubble = styled.div`
  position: absolute;
  top: ${props => props.size * 0.1}px;
  right: ${props => props.size * 1.1}px; /* Moved to the left of the toad */
  background-color: #E8F5E9; /* Light green background */
  border: 2px solid #81C784; /* Green border */
  border-radius: 20px;
  padding: 10px 15px;
  font-family: var(--font-family-fun);
  font-size: ${props => props.size * 0.2}px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: ${props => props.size * 1.5}px;
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
 * @returns {JSX.Element} - Rendered component
 */
const ToadMascot = ({ 
  size = 100, 
  message = '', 
  name = '', 
  animate = 'idle',
  onClick = null
}) => {
  const [showTongue, setShowTongue] = useState(false);
  const [showRibbit, setShowRibbit] = useState(false);
  
  // Randomly show tongue and ribbit animations
  useEffect(() => {
    // Only show animations if not jumping
    if (animate !== 'jump') {
      // Random tongue animation
      const tongueInterval = setInterval(() => {
        if (Math.random() < 0.2) { // 20% chance
          setShowTongue(true);
          setTimeout(() => setShowTongue(false), 500);
        }
      }, 5000);
      
      // Random ribbit animation
      const ribbitInterval = setInterval(() => {
        if (Math.random() < 0.15) { // 15% chance
          setShowRibbit(true);
          setTimeout(() => setShowRibbit(false), 2000);
        }
      }, 8000);
      
      return () => {
        clearInterval(tongueInterval);
        clearInterval(ribbitInterval);
      };
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
      
      <RibbitText size={size} show={showRibbit}>
        Ribbit!
      </RibbitText>
      
      <LilyPad size={size} />
      
      <ToadEmoji 
        size={size} 
        animate={animate}
        onClick={handleClick}
        style={{ cursor: 'pointer' }}
      >
        🐸
        <Tongue size={size} show={showTongue} />
      </ToadEmoji>
      
      {name && (
        <NameTag size={size}>
          {name}
        </NameTag>
      )}
    </ToadContainer>
  );
};

export default ToadMascot;

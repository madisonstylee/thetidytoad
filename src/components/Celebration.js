import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

// Animation for the celebration container
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

// Animation for the message
const scaleUp = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

// Animation for fireworks
const firework = keyframes`
  0% {
    transform: translate(var(--x), var(--initialY));
    width: 4px;
    opacity: 1;
  }
  50% {
    width: 4px;
    opacity: 1;
  }
  100% {
    width: var(--size);
    opacity: 0;
    transform: translate(var(--x), var(--finalY));
  }
`;

// Animation for firework particles
const fireworkParticle = keyframes`
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg) translate(var(--distance)) rotate(-360deg);
    opacity: 0;
  }
`;

// Styled container for the celebration
const CelebrationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  animation: ${props => props.isClosing ? fadeOut : fadeIn} 0.5s ease-in-out;
`;

// Styled message for the celebration
const CelebrationMessage = styled.div`
  font-family: var(--font-family-fun);
  font-size: 48px;
  color: white;
  text-align: center;
  margin-bottom: 20px;
  animation: ${scaleUp} 0.5s ease-in-out;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

// Styled toad for the celebration
const CelebrationToad = styled.div`
  font-size: 80px;
  margin-bottom: 20px;
  animation: ${scaleUp} 0.5s ease-in-out;
`;

// Styled firework
const Firework = styled.div`
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: ${props => props.color};
  --x: ${props => props.x}vw;
  --initialY: 100vh;
  --finalY: ${props => props.finalY}vh;
  --size: ${props => props.size}px;
  animation: ${firework} ${props => props.duration}s ease-out forwards;
  animation-delay: ${props => props.delay}s;
  opacity: 0;
`;

// Styled firework particle
const FireworkParticle = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: ${props => props.color};
  --distance: ${props => props.distance}px;
  transform-origin: center;
  animation: ${fireworkParticle} 0.6s ease-out forwards;
  animation-delay: ${props => props.delay}s;
  opacity: 0;
`;

/**
 * Celebration component displays a celebration animation
 * @param {Object} props - Component props
 * @param {string} props.message - Celebration message
 * @param {boolean} props.show - Whether to show the celebration
 * @param {function} props.onComplete - Function to call when celebration is complete
 * @returns {JSX.Element|null} - Rendered component or null if not visible
 */
const Celebration = ({ message = 'Great Job!', show = false, onComplete }) => {
  const [isVisible, setIsVisible] = useState(show);
  const [isClosing, setIsClosing] = useState(false);
  const [fireworks, setFireworks] = useState([]);

  // Generate random fireworks
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsClosing(false);
      
      // Generate random fireworks
      const newFireworks = [];
      const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#B388FF', '#FF4081'];
      
      for (let i = 0; i < 10; i++) {
        newFireworks.push({
          id: i,
          x: Math.random() * 100, // Random x position (0-100vw)
          finalY: Math.random() * 60 + 10, // Random final y position (10-70vh)
          size: Math.random() * 100 + 50, // Random size (50-150px)
          color: colors[Math.floor(Math.random() * colors.length)], // Random color
          duration: Math.random() * 1 + 1, // Random duration (1-2s)
          delay: Math.random() * 2 // Random delay (0-2s)
        });
      }
      
      setFireworks(newFireworks);
      
      // Auto-close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [show]);

  // Handle closing the celebration
  const handleClose = () => {
    setIsClosing(true);
    
    // Wait for animation to complete before removing
    setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, 500); // Match animation duration
  };

  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  // Generate particles for a firework
  const generateParticles = (firework) => {
    const particles = [];
    const particleCount = 12;
    const colors = ['#FF5252', '#FFD740', '#64FFDA', '#448AFF', '#B388FF', '#FF4081'];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: `${firework.id}-${i}`,
        distance: Math.random() * 100 + 50, // Random distance (50-150px)
        color: colors[Math.floor(Math.random() * colors.length)], // Random color
        delay: firework.duration + (Math.random() * 0.1) // Delay until firework reaches peak
      });
    }
    
    return particles;
  };

  return (
    <CelebrationContainer isClosing={isClosing} onClick={handleClose}>
      <CelebrationMessage>{message}</CelebrationMessage>
      <CelebrationToad>🐸</CelebrationToad>
      
      {/* Fireworks */}
      {fireworks.map(firework => (
        <React.Fragment key={firework.id}>
          <Firework
            x={firework.x}
            finalY={firework.finalY}
            size={firework.size}
            color={firework.color}
            duration={firework.duration}
            delay={firework.delay}
          />
          
          {/* Particles for each firework */}
          {generateParticles(firework).map(particle => (
            <FireworkParticle
              key={particle.id}
              distance={particle.distance}
              color={particle.color}
              delay={particle.delay}
              style={{
                top: `calc(100vh - ${firework.finalY}vh)`,
                left: `${firework.x}vw`
              }}
            />
          ))}
        </React.Fragment>
      ))}
    </CelebrationContainer>
  );
};

export default Celebration;

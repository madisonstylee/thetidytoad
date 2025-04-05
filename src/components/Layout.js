import React, { useState } from 'react';
import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';
import Alert from './Alert';

// Styled layout container
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color);
`;

// Styled main content
const Main = styled.main`
  flex: 1;
  padding: 2rem 1rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
`;

// Styled alerts container
const AlertsContainer = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 500px;
  pointer-events: none;
  
  & > * {
    pointer-events: auto;
  }
`;

/**
 * Layout component provides a consistent layout for all pages
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the layout
 * @returns {JSX.Element} - Rendered component
 */
const Layout = ({ children }) => {
  const [alerts, setAlerts] = useState([]);

  // Add a new alert
  const addAlert = (type, message, duration = 5000) => {
    const id = Date.now();
    setAlerts(prevAlerts => [...prevAlerts, { id, type, message, duration }]);
    return id;
  };

  // Remove an alert by ID
  const removeAlert = (id) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== id));
  };

  // Create context value for alerts
  const alertContextValue = {
    addAlert,
    removeAlert,
    // Helper functions for common alert types
    success: (message, duration) => addAlert('success', message, duration),
    error: (message, duration) => addAlert('error', message, duration),
    warning: (message, duration) => addAlert('warning', message, duration),
    info: (message, duration) => addAlert('info', message, duration),
  };

  return (
    <LayoutContainer>
      <Header />
      
      <Main>
        {/* Pass alert context to children */}
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, { alerts: alertContextValue });
          }
          return child;
        })}
      </Main>
      
      <Footer />
      
      {/* Display alerts */}
      <AlertsContainer>
        {alerts.map(alert => (
          <Alert
            key={alert.id}
            type={alert.type}
            message={alert.message}
            duration={alert.duration}
            onClose={() => removeAlert(alert.id)}
          />
        ))}
      </AlertsContainer>
    </LayoutContainer>
  );
};

export default Layout;

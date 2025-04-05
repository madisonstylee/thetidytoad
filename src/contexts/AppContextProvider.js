import React from 'react';
import { AuthProvider } from './AuthContext';
import { TaskProvider } from './TaskContext';
import { RewardProvider } from './RewardContext';
import { NotificationProvider } from './NotificationContext';

/**
 * AppContextProvider combines all context providers into a single component
 * This makes it easier to wrap the application with all the necessary providers
 * The order of providers is important - providers that depend on other providers
 * should be nested inside those providers
 */
const AppContextProvider = ({ children }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TaskProvider>
          <RewardProvider>
            {children}
          </RewardProvider>
        </TaskProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default AppContextProvider;

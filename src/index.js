import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import AppContextProvider from './contexts/AppContextProvider';
import './index.css';
import './mobile.css'; // Import mobile-specific styles

// Create root element
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with all necessary providers
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppContextProvider>
        <App />
      </AppContextProvider>
    </BrowserRouter>
  </React.StrictMode>
);

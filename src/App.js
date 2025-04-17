import React, { useEffect, useState, Component } from 'react';
import ToadMascot from './components/ToadMascot';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Loading from './components/Loading';

// Pages
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import ChildLogin from './pages/ChildLogin';
import Register from './pages/Register';
import ParentDashboard from './pages/ParentDashboard';
import ChildDashboard from './pages/ChildDashboard';
import RibbitReserve from './pages/RibbitReserve';
import TaskManager from './pages/TaskManager';
import RewardManager from './pages/RewardManager';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

/**
 * PrivateRoute component for protected routes
 * Redirects to login if user is not authenticated
 */
const PrivateRoute = ({ children, requiredRole = null }) => {
  const { userData, childProfile, isLoggedIn, loading, authMode } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return <Loading fullScreen message="Loading..." />;
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole) {
    // For parent routes
    if (requiredRole === 'parent') {
      if (authMode !== 'parent' || !userData || userData.role !== 'parent') {
        // If user is a child, redirect to child dashboard
        if (authMode === 'child' && childProfile) {
          return <Navigate to="/child-dashboard" replace />;
        }
        // Otherwise, redirect to login
        return <Navigate to="/login" replace />;
      }
    }
    
    // For child routes
    if (requiredRole === 'child') {
      if (authMode !== 'child' || !childProfile) {
        // If user is a parent, redirect to parent dashboard
        if (authMode === 'parent' && userData && userData.role === 'parent') {
          return <Navigate to="/parent-dashboard" replace />;
        }
        // Otherwise, redirect to login
        return <Navigate to="/login" replace />;
      }
    }
  }

  // Render children if authenticated and has required role
  return children;
};

/**
 * ErrorBoundary component to catch errors in the app
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
          <ToadMascot size={120} message="Oops! Something went wrong." />
          <h1 style={{ color: 'var(--primary-color)', marginTop: '1rem' }}>Something went wrong</h1>
          <p style={{ marginBottom: '1.5rem' }}>
            We're having trouble loading this page. Please try refreshing or going back to the dashboard.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--primary-color)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Refresh Page
            </button>
            <button
              onClick={() => {
                // Reset the error state
                this.setState({ hasError: false, error: null, errorInfo: null });
                // Navigate to dashboard
                window.location.href = '/';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--accent-color)',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '80%', margin: '2rem auto' }}>
              <h3>Error Details (Development Only):</h3>
              <p style={{ color: 'red', fontWeight: 'bold' }}>{this.state.error?.toString()}</p>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '1rem', overflow: 'auto', borderRadius: '0.5rem' }}>
                {this.state.errorInfo?.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

/**
 * App component defines the routes for the application
 * @returns {JSX.Element} - Rendered component
 */
const App = () => {
  const { userData, childProfile, isLoggedIn, authMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to appropriate dashboard based on user role
  useEffect(() => {
    if (isLoggedIn) {
      // If user is at login or register page, redirect to dashboard
      if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/child-login' || location.pathname === '/') {
        if (authMode === 'parent' && userData?.role === 'parent') {
          navigate('/parent-dashboard');
        } else if (authMode === 'child' && childProfile) {
          navigate('/child-dashboard');
        }
      }
    }
  }, [isLoggedIn, userData, childProfile, authMode, navigate, location.pathname]);

  return (
    <ErrorBoundary>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/child-login" element={<ChildLogin />} />
          <Route path="/register" element={<Register />} />
          
          {/* Parent routes */}
          <Route 
            path="/parent-dashboard" 
            element={
              <PrivateRoute requiredRole="parent">
                <ParentDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/task-manager" 
            element={
              <PrivateRoute requiredRole="parent">
                <TaskManager />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/reward-manager" 
            element={
              <PrivateRoute requiredRole="parent">
                <RewardManager />
              </PrivateRoute>
            } 
          />
          
          {/* Child routes */}
          <Route 
            path="/child-dashboard" 
            element={
              <PrivateRoute requiredRole="child">
                <ChildDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/ribbit-reserve" 
            element={
              <PrivateRoute requiredRole="child">
                <RibbitReserve />
              </PrivateRoute>
            } 
          />
          
          {/* Common routes */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/notifications" 
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            } 
          />
          
          {/* Redirect root to login or dashboard */}
          <Route 
            path="/" 
            element={
              isLoggedIn ? (
                authMode === 'parent' && userData?.role === 'parent' ? (
                  <Navigate to="/parent-dashboard" replace />
                ) : authMode === 'child' && childProfile ? (
                  <Navigate to="/child-dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
            } 
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
};

export default App;

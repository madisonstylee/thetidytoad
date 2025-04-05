import React, { useEffect, useState } from 'react';
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

/**
 * PrivateRoute component for protected routes
 * Redirects to login if user is not authenticated
 */
const PrivateRoute = ({ children, requiredRole = null }) => {
  const { userData, isLoggedIn, loading } = useAuth();
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
  if (requiredRole && userData.role !== requiredRole) {
    // Redirect parent to parent dashboard
    if (userData.role === 'parent') {
      return <Navigate to="/parent-dashboard" replace />;
    }
    
    // Redirect child to child dashboard
    if (userData.role === 'child') {
      return <Navigate to="/child-dashboard" replace />;
    }
    
    // Fallback to login
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated and has required role
  return children;
};

/**
 * App component defines the routes for the application
 * @returns {JSX.Element} - Rendered component
 */
const App = () => {
  const { userData, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to appropriate dashboard based on user role
  useEffect(() => {
    if (isLoggedIn) {
      // If user is at login or register page, redirect to dashboard
      if (location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/child-login' || location.pathname === '/') {
        if (userData.role === 'parent') {
          navigate('/parent-dashboard');
        } else if (userData.role === 'child') {
          navigate('/child-dashboard');
        }
      }
    }
  }, [isLoggedIn, userData, navigate, location.pathname]);

  return (
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
        
        {/* Redirect root to login or dashboard */}
        <Route 
          path="/" 
          element={
            isLoggedIn ? (
              userData.role === 'parent' ? (
                <Navigate to="/parent-dashboard" replace />
              ) : (
                <Navigate to="/child-dashboard" replace />
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
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import { useAuth } from '../../context/AuthContext';

export default function AuthContainer() {
  const [showLogin, setShowLogin] = useState(true);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  // If user is already logged in, redirect to home
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-pink-100 to-purple-100 p-4">
      <div className="w-full max-w-md">
        {showLogin ? (
          <Login onToggleForm={() => setShowLogin(false)} />
        ) : (
          <Signup onToggleForm={() => setShowLogin(true)} />
        )}
      </div>
    </div>
  );
}
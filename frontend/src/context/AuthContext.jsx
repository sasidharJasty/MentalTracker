import React, { createContext, useState, useEffect, useContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Create context
const AuthContext = createContext(null);

// Provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkLoggedInUser = () => {
      try {
        // For development only: Create a temporary user if none exists
        const devMode = true; // Set to false in production
        
        let user = JSON.parse(localStorage.getItem('mindscribe_user'));
        
        if (!user && devMode) {
          // Create a temporary dev user
          user = {
            id: 'dev-user-1',
            name: 'Developer',
            email: 'dev@example.com'
          };
          
          // Store the dev user
          localStorage.setItem('mindscribe_user', JSON.stringify(user));
          
          // Create users array if it doesn't exist
          const users = JSON.parse(localStorage.getItem('mindscribe_users') || '[]');
          if (!users.some(u => u.id === user.id)) {
            users.push({
              ...user,
              password: 'password123' // For dev testing only
            });
            localStorage.setItem('mindscribe_users', JSON.stringify(users));
          }
        }
        
        if (user) {
          setCurrentUser(user);
        }
      } catch (err) {
        console.error('Error checking logged in user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInUser();
  }, []);

  // Sign up - Create a new user account
  const signUp = (name, email, password) => {
    try {
      // Check if email already exists
      const existingUsers = JSON.parse(localStorage.getItem('mindscribe_users') || '[]');
      if (existingUsers.some(user => user.email === email)) {
        throw new Error('Email already in use');
      }

      // Create new user
      const newUser = {
        id: uuidv4(),
        name,
        email,
        password, // In a real app, NEVER store plain passwords
        createdAt: new Date().toISOString()
      };

      // Save user to "database"
      existingUsers.push(newUser);
      localStorage.setItem('mindscribe_users', JSON.stringify(existingUsers));

      // Log in the user
      const userToStore = { ...newUser };
      delete userToStore.password; // Don't store password in session
      
      localStorage.setItem('mindscribe_user', JSON.stringify(userToStore));
      setCurrentUser(userToStore);
      
      return userToStore;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in - Log in an existing user
  const signIn = (email, password) => {
    try {
      const users = JSON.parse(localStorage.getItem('mindscribe_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password');
      }

      // Store user in session (excluding password)
      const userToStore = { ...user };
      delete userToStore.password;
      
      localStorage.setItem('mindscribe_user', JSON.stringify(userToStore));
      setCurrentUser(userToStore);
      
      return userToStore;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign out - Log out the current user
  const signOut = () => {
    localStorage.removeItem('mindscribe_user');
    setCurrentUser(null);
  };

  // User storage helper
  const userStorage = {
    // Get item with user-specific key
    getItem: (key) => {
      if (!currentUser) return null;
      const userKey = `user_${currentUser.id}_${key}`;
      return localStorage.getItem(userKey);
    },
    
    // Set item with user-specific key
    setItem: (key, value) => {
      if (!currentUser) return;
      const userKey = `user_${currentUser.id}_${key}`;
      localStorage.setItem(userKey, value);
    },
    
    // Remove item with user-specific key
    removeItem: (key) => {
      if (!currentUser) return;
      const userKey = `user_${currentUser.id}_${key}`;
      localStorage.removeItem(userKey);
    },
    
    // Clear all user data
    clearUserData: () => {
      if (!currentUser) return;
      
      // Get all keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`user_${currentUser.id}_`)) {
          localStorage.removeItem(key);
        }
      }
    }
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    userStorage,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    clearError: () => setError(null)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
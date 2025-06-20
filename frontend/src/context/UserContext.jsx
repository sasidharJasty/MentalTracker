import React, { createContext, useState, useContext, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // You might need to install this package

// Create the context
const UserContext = createContext();

// Create a provider component
export function UserProvider({ children }) {
  const [userId, setUserId] = useState(null);
  
  useEffect(() => {
    // Check if user already has an ID
    let id = localStorage.getItem('mindscribe_user_id');
    
    // If not, create a new one
    if (!id) {
      id = uuidv4();
      localStorage.setItem('mindscribe_user_id', id);
    }
    
    setUserId(id);
  }, []);
  
  // Helper functions for user-specific storage
  const userStorage = {
    // Get item with user-specific key
    getItem: (key) => {
      if (!userId) return null;
      return localStorage.getItem(`${userId}_${key}`);
    },
    
    // Set item with user-specific key
    setItem: (key, value) => {
      if (!userId) return;
      localStorage.setItem(`${userId}_${key}`, value);
    },
    
    // Remove item with user-specific key
    removeItem: (key) => {
      if (!userId) return;
      localStorage.removeItem(`${userId}_${key}`);
    }
  };
  
  return (
    <UserContext.Provider value={{ userId, userStorage }}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook to use the user context
export function useUser() {
  return useContext(UserContext);
}
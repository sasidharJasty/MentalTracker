import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  
  // Use a fallback approach to handle potential auth issues
  const [auth, setAuth] = useState({
    currentUser: { name: 'User', email: 'user@example.com' },
    signOut: () => console.log('Fallback signOut'),
    userStorage: {
      clearUserData: () => console.log('Fallback clearUserData')
    }
  });
  
  // Try to get the real auth context
  useEffect(() => {
    try {
      const authContext = useAuth();
      if (authContext) {
        setAuth(authContext);
        
        // Set initial form values
        if (authContext.currentUser) {
          setName(authContext.currentUser.name || '');
          setEmail(authContext.currentUser.email || '');
        }
      }
    } catch (error) {
      console.error("Error using auth context in Settings:", error);
    }
  }, []);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    setMessage(null);
    
    if (!auth.currentUser) {
      setMessage({ type: 'error', text: 'You must be logged in to update your profile' });
      return;
    }
    
    // In a real app, you would call an API to update the user's profile
    // For this simplified example, we'll just update the localStorage
    
    try {
      // Get all users
      const users = JSON.parse(localStorage.getItem('mindscribe_users') || '[]');
      
      // Find the current user
      const userIndex = users.findIndex(u => u.id === auth.currentUser.id);
      
      if (userIndex === -1) {
        setMessage({ type: 'error', text: 'User not found' });
        return;
      }
      
      // Update user data
      users[userIndex] = {
        ...users[userIndex],
        name,
        email
      };
      
      // Update password if provided
      if (password) {
        if (password !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          return;
        }
        
        users[userIndex].password = password;
      }
      
      // Save updated users
      localStorage.setItem('mindscribe_users', JSON.stringify(users));
      
      // Update current user in session
      const updatedUser = { ...users[userIndex] };
      delete updatedUser.password; // Don't store password in session
      
      localStorage.setItem('mindscribe_user', JSON.stringify(updatedUser));
      
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Clear password fields
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: 'Failed to update profile' });
    }
  };

  const handleExportData = () => {
    if (!auth.currentUser) return;
    
    try {
      // Get all user data
      const journalEntries = JSON.parse(auth.userStorage.getItem('journalEntries')) || [];
      const conversations = JSON.parse(auth.userStorage.getItem('conversations')) || [];
      
      // Create export object
      const exportData = {
        user: {
          name: auth.currentUser.name,
          email: auth.currentUser.email
        },
        journalEntries,
        conversations,
        exportDate: new Date().toISOString()
      };
      
      // Convert to JSON string
      const dataStr = JSON.stringify(exportData, null, 2);
      
      // Create download link
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `mindscribe-export-${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      setMessage({ type: 'success', text: 'Data exported successfully' });
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  const handleDeleteAccount = () => {
    if (!auth.currentUser || !window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete user data
      auth.userStorage.clearUserData();
      
      // Remove user from users list
      const users = JSON.parse(localStorage.getItem('mindscribe_users') || '[]');
      const updatedUsers = users.filter(u => u.id !== auth.currentUser.id);
      localStorage.setItem('mindscribe_users', JSON.stringify(updatedUsers));
      
      // Sign out
      auth.signOut();
      
      // Show success message (this might not be seen if we redirect)
      setMessage({ type: 'success', text: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({ type: 'error', text: 'Failed to delete account' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200">
      <h2 className="text-2xl font-bold text-pink-600 mb-6">⚙️ Settings</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-lg ${
          message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Profile Settings</h3>
        
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-pink-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-pink-500"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              New Password (leave blank to keep current)
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-pink-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-pink-500"
            />
          </div>
          
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Update Profile
          </button>
        </form>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Data Management</h3>
        
        <div className="flex flex-col space-y-4">

          
          <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-600">
            <p>Your data is stored locally in your browser and is never sent to a server (except when processing with AI).</p>
            <p className="mt-2">Exporting your data allows you to back it up or transfer it to another device.</p>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-4">Danger Zone</h3>
        
        <button
          onClick={handleDeleteAccount}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Delete My Account
        </button>
        
        <p className="text-sm text-gray-500 mt-2">
          This will permanently delete all your data and cannot be undone.
        </p>
      </div>
    </div>
  );
}
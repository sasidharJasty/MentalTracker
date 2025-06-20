import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [showMenu, setShowMenu] = useState(false);
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = () => {
    signOut();
    navigate('/login');
  };
  
  return (
    <header className="bg-white shadow-md py-3 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-pink-600">EmotiJournal</h1>
        
        {currentUser && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-700 hidden md:inline">{currentUser.name}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
                <div className="px-4 py-2 text-xs text-gray-400">
                  Signed in as
                </div>
                <div className="px-4 py-1 text-sm text-gray-700">
                  {currentUser.email}
                </div>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleSignOut}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
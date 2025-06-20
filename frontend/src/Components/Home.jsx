import React, { useState, useEffect } from 'react';
import JournalEditor from './JournalEditor';
import MemoryGraph from './MemoryGraph';
import Dashboard from './dashboard';
import EntryHistory from './EntryHistory';
import VoiceCompanion from './voiceCompanion';
import EmotionTrends from './EmotionTrends';
import Settings from './Settings';
import { useAuth } from '../context/AuthContext';

// Fallback auth function in case the real one isn't available yet
const fallbackAuth = {
  currentUser: { name: 'Guest User', id: 'guest-user', email: 'guest@example.com' },
  userStorage: {
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: key => localStorage.removeItem(key)
  },
  loading: false
};

export default function Home() {
  const [auth, setAuth] = useState(fallbackAuth);
  const [activeTab, setActiveTab] = useState('journal');
  
  // Try to get the real auth context safely
  useEffect(() => {
    try {
      const authContext = useAuth();
      if (authContext) {
        setAuth(authContext);
      }
    } catch (error) {
      console.error("Error using auth context:", error);
      // Keep using fallback
    }
  }, []);
  
  const { currentUser, loading } = auth;
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-pink-700 mb-2">
          Welcome, {currentUser?.name || 'Friend'}
        </h1>
        <p className="text-gray-600">
          Express yourself, track your emotions, and gain insights about your emotional journey.
        </p>
      </div>
      
      {/* Navigation Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex flex-wrap space-x-2 md:space-x-8">
          <button
            onClick={() => setActiveTab('journal')}
            className={`py-4 px-1 ${activeTab === 'journal' 
              ? 'border-b-2 border-pink-500 text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'} font-medium`}
          >
            Journal
          </button>
          <button
            onClick={() => setActiveTab('memory-map')}
            className={`py-4 px-1 ${activeTab === 'memory-map' 
              ? 'border-b-2 border-pink-500 text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'} font-medium`}
          >
            Memory Map
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`py-4 px-1 ${activeTab === 'insights' 
              ? 'border-b-2 border-pink-500 text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'} font-medium`}
          >
            Insights & History
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-4 px-1 ${activeTab === 'voice' 
              ? 'border-b-2 border-pink-500 text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'} font-medium`}
          >
            Voice Companion
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 px-1 ${activeTab === 'settings' 
              ? 'border-b-2 border-pink-500 text-pink-600' 
              : 'text-gray-500 hover:text-gray-700'} font-medium`}
          >
            Settings
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'journal' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <JournalEditor />
          </div>
          <div>
            <Dashboard />
          </div>
        </div>
      )}
      
      {activeTab === 'memory-map' && (
        <div className="w-full">
          <MemoryGraph />
        </div>
      )}
      
      {activeTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <EmotionTrends />
          </div>
          <div>
            <EntryHistory />
          </div>
        </div>
      )}
      
      {activeTab === 'voice' && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <VoiceCompanion />
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div className="flex justify-center">
          <div className="w-full max-w-2xl">
            <Settings />
          </div>
        </div>
      )}
    </div>
  );
}
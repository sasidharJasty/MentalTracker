import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function EntryHistory() {
  const [entries, setEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const { userStorage, currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    
    // Load user-specific entries
    const loadEntries = () => {
      try {
        const storedEntries = JSON.parse(userStorage.getItem('journalEntries')) || [];
        
        // Sort entries by timestamp (newest first)
        const sortedEntries = [...storedEntries].sort((a, b) => {
          if (!a.timestamp || !b.timestamp) return 0;
          return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        setEntries(sortedEntries);
      } catch (error) {
        console.error('Error loading entries:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadEntries();
    
    // Listen for updates to entries
    const handleJournalUpdated = () => {
      loadEntries();
    };
    
    window.addEventListener('journalUpdated', handleJournalUpdated);
    
    return () => {
      window.removeEventListener('journalUpdated', handleJournalUpdated);
    };
  }, [userStorage, currentUser]);

  const deleteEntry = (id) => {
    if (!currentUser) return;
    
    // Filter out the entry to delete
    const updatedEntries = entries.filter(entry => entry.id !== id);
    
    // Update localStorage
    userStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
    
    // Update state
    setEntries(updatedEntries);
    
    // If the selected entry was deleted, clear the selection
    if (selectedEntry && selectedEntry.id === id) {
      setSelectedEntry(null);
    }
    
    // Notify other components
    window.dispatchEvent(new CustomEvent('journalUpdated'));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (entries.length === 0) {
    return (
      <div>
        <h2 className="text-4xl mb-4 text-pink-600">📜 Memory Web</h2>
        <p className="text-pink-500 bg-white p-4 rounded-xl shadow">No journal entries yet. Start writing to see your entries here!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-4xl mb-4 text-pink-600">📜 Memory Web</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-xl p-4 shadow-md border border-pink-200"
          >
            <p className="text-sm text-gray-400 italic">{new Date(entry.timestamp).toLocaleString()}</p>
            <p className="font-semibold text-pink-700 mt-2">Mood: {entry.mood}</p>
            <p className="text-gray-700 mt-1 text-sm whitespace-pre-wrap">{entry.summary}</p>
            <button
              onClick={() => deleteEntry(entry.id)}
              className="text-red-500 mt-2"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
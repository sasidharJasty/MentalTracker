import React, { useEffect, useState } from 'react';

export default function EntryHistory() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('journalEntries') || '[]');
    setEntries(stored);
  }, []);

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
          </div>
        ))}
      </div>
    </div>
  );
}
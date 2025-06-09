import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

const genAI = new GoogleGenAI({
  apiKey: "AIzaSyCkZxJra9GCBy7XDquZ9eSts8D_07JaArI"
});

export default function JournalEditor() {
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleAnalyze = async () => {
    if (!entry.trim()) {
      alert('Please enter a journal entry before analyzing.');
      return;
    }

    setLoading(true);
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-1.5-flash', // You can also use 'gemini-2.0-flash' if available
        contents: `Analyze the emotional tone and summarize this journal entry:\n"""${entry}"""\nReturn a list of emotional words and a summary.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              words: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              summary: {
                type: Type.STRING
              }
            },
            required: ['words', 'summary']
          }
        }
      });

      const json = JSON.parse(result.text);
      console.log('Structured response:', json);

      const newEntry = {
        id: Date.now(),
        text: entry,
        mood: json.words.join(', '),
        summary: json.summary,
        timestamp: new Date().toLocaleString()
      };

      const stored = JSON.parse(localStorage.getItem('journalEntries')) || [];
      const updatedEntries = [...stored, newEntry];
      localStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

      setFeedback({ mood: newEntry.mood, summary: newEntry.summary });
      setEntry('');
    } catch (error) {
      console.error('Error analyzing entry:', error);
      setFeedback({ error: 'An error occurred. Please try again.' });
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-300 mb-10">
      <textarea
        className="w-full h-40 p-3 font-pixel text-md bg-pink-50 border-2 border-pink-200 rounded-lg focus:outline-pink-500"
        placeholder="Write something deep, weird, or poetic..."
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <button
        className="mt-4 bg-pink-600 text-white px-5 py-2 rounded-lg hover:bg-pink-700"
        onClick={handleAnalyze}
        disabled={loading}
      >
        {loading ? 'Analyzing...' : 'Summon the Muse ✨'}
      </button>

      {feedback && (
        <div className="mt-6 p-4 bg-pink-100 border-l-4 border-pink-400">
          {feedback.error ? (
            <p className="text-lg text-pink-800">{feedback.error}</p>
          ) : (
            <>
              <p className="text-lg text-pink-800"><strong>Mood:</strong> {feedback.mood}</p>
              <p className="text-md mt-2 text-pink-700 whitespace-pre-line">{feedback.summary}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

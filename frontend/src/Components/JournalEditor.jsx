import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useAuth } from '../context/AuthContext';

// Initialize the API with your API key from environment variables
const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY // Use environment variable
});
console.log(import.meta.env.VITE_GOOGLE_API_KEY);
export default function JournalEditor() {
  const [entry, setEntry] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const { userStorage, currentUser } = useAuth(); // Get user-specific storage

  const handleAnalyze = async () => {
    if (!entry.trim()) return;
    if (!currentUser) {
      console.error("User not authenticated");
      return;
    }
    
    setLoading(true);
    setFeedback(null);
    
    try {
      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an advanced emotional analysis AI. Your task is to analyze the following journal entry and provide a detailed emotional breakdown. 

        Journal Entry:
        """
        ${entry}
        """

        Please provide a structured JSON response with the following details:
        1. A list of 5-7 emotional words that best describe the tone and mood of the journal entry.
        2. A concise 2-3 sentence summary of the journal entry, capturing its essence.
        3. Emotion scores (values between 0 and 1) for the following emotions: happiness, sadness, joy, anxiety, anger, and calm.
        4. The dominant emotion that stands out the most in the journal entry.

        Ensure the response is well-formatted and adheres to the JSON schema provided.`,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              words: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5-7 emotional words that describe the journal entry"
              },
              summary: {
                type: Type.STRING,
                description: "A 2-3 sentence summary of the journal entry"
              },
              emotionScores: {
                type: Type.OBJECT,
                properties: {
                  happiness: { type: Type.NUMBER, description: "Score from 0-1" },
                  sadness: { type: Type.NUMBER, description: "Score from 0-1" },
                  joy: { type: Type.NUMBER, description: "Score from 0-1" },
                  anxiety: { type: Type.NUMBER, description: "Score from 0-1" },
                  anger: { type: Type.NUMBER, description: "Score from 0-1" },
                  calm: { type: Type.NUMBER, description: "Score from 0-1" }
                }
              },
              dominantEmotion: {
                type: Type.STRING,
                description: "The most prominent emotion in the journal entry"
              }
            },
            required: ['words', 'summary', 'emotionScores', 'dominantEmotion']
          }
        }
      });

      // Parse the JSON response
      const analysisData = JSON.parse(result.text);
      console.log('Structured response:', analysisData);

      // Create and save the new entry
      const newEntry = {
        id: Date.now(),
        text: entry,
        mood: Array.isArray(analysisData.words) ? analysisData.words.join(', ') : analysisData.words,
        summary: analysisData.summary,
        timestamp: new Date().toLocaleString(),
        emotionScores: analysisData.emotionScores,
        dominantEmotion: analysisData.dominantEmotion,
        userId: currentUser.id // Add user ID to entry
      };

      const stored = JSON.parse(userStorage.getItem('journalEntries')) || [];
      const updatedEntries = [...stored, newEntry];
      userStorage.setItem('journalEntries', JSON.stringify(updatedEntries));

      // Dispatch a custom event to notify other components
      window.dispatchEvent(new CustomEvent('journalUpdated'));

      setFeedback({ 
        mood: newEntry.mood, 
        summary: newEntry.summary,
        dominantEmotion: newEntry.dominantEmotion
      });
    } catch (error) {
      console.error('Error analyzing journal entry:', error);
      setFeedback({
        error: 'Could not analyze your entry. Please try again.'
      });
    } finally {
      setLoading(false);
    }
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
              <p className="text-lg text-pink-800">
                <strong>Mood:</strong> {feedback.mood}
              </p>
              <p className="text-md mt-2 text-pink-700 whitespace-pre-line">
                <strong>Dominant Emotion:</strong> {feedback.dominantEmotion}
              </p>
              <p className="text-md mt-2 text-pink-700 whitespace-pre-line">{feedback.summary}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
/*import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';

const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY
});*/

export default function VoiceCompanion() {
    /*
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const { userStorage, currentUser } = useAuth();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const finalTranscript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      setTranscript(finalTranscript);
    };

    recognition.onerror = (e) => {
      setError(`Speech recognition error: ${e.error}`);
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not initialized.');
      return;
    }

    setError(null);

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      if (transcript.trim()) {
        handleAnalyze(transcript.trim());
      }
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleAnalyze = async (spokenText) => {
    if (!spokenText) return;
    setLoading(true);
    setResponse('');
    setError(null);

    try {
      const journalEntries = JSON.parse(userStorage.getItem('journalEntries')) || [];
      const context = journalEntries.length
        ? `Recent moods: ${journalEntries.slice(-3).map(e => e.dominantEmotion).join(', ')}`
        : 'No recent journal entries available.';

      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are a kind, supportive voice companion for a journaling app.

        Context:
        ${context}

        User said:
        "${spokenText}"

        Please respond empathetically and conversationally in 2–3 sentences. If they seem distressed, kindly suggest they write in their journal or speak to someone they trust.`,
        config: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      });

      const aiResponse = result.text;
      if (!aiResponse) throw new Error("Empty response from Gemini AI.");
      setResponse(aiResponse);

      if (currentUser) {
        const history = JSON.parse(userStorage.getItem('conversations')) || [];
        history.push({
          id: Date.now(),
          transcript: spokenText,
          response: aiResponse,
          timestamp: new Date().toISOString(),
          userId: currentUser.id
        });
        userStorage.setItem('conversations', JSON.stringify(history));
      }

      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(aiResponse);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('AI Error:', err);
      setError('Could not process your voice. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-300 mb-10">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">🎤 Voice Companion</h2>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">{error}</div>}

      <div className="flex flex-col items-center">
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isListening ? 'bg-red-500 animate-pulse' : 'bg-pink-500 hover:bg-pink-600'
          } text-white`}
        >
          <span className="text-3xl">{isListening ? '⏹️' : '🎤'}</span>
        </button>

        {isListening && <p className="text-pink-500 mb-4 font-medium">Listening...</p>}

        {transcript && (
          <div className="bg-pink-50 p-4 rounded-lg mb-4 w-full max-w-lg text-gray-800 shadow-inner">
            <strong>You said:</strong> <br />
            {transcript}
          </div>
        )}

        {loading && (
          <div className="my-4">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-400 border-t-transparent"></div>
          </div>
        )}

        {response && (
          <div className="bg-purple-50 p-4 rounded-lg mb-4 w-full max-w-lg border-l-4 border-purple-400 text-gray-800">
            <strong>Companion:</strong> <br />
            {response}
          </div>
        )}

        <div className="text-sm text-center text-gray-500 mt-2">
          <p>Press the mic and speak your thoughts.</p>
          <p>I’ll listen and respond with care.</p>
          {!currentUser && (
            <p className="text-yellow-600 mt-2">Note: Sign in to save conversations.</p>
          )}
        </div>
      </div>
    </div>
  );*/
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border-2 border-pink-300 mb-10">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">🎤 Voice Companion</h2>
      
      <div className="flex flex-col items-center py-8">
        <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mb-6">
          <span className="text-3xl">🔜</span>
        </div>
        
        <p className="text-xl font-medium text-gray-800 mb-2">Coming Soon!</p>
        <p className="text-gray-600 text-center">
          Our voice companion feature is currently under development.
        </p>
      </div>
    </div>
  );
}

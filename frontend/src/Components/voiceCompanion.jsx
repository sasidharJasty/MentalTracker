import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';

// Initialize the API with your API key from environment variables
const genAI = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY
});

export default function VoiceCompanion() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  
  // Use a fallback approach to handle potential auth issues
  const [auth, setAuth] = useState({
    currentUser: null,
    userStorage: {
      getItem: key => localStorage.getItem(key),
      setItem: (key, value) => localStorage.setItem(key, value)
    }
  });
  
  // Try to get the real auth context
  useEffect(() => {
    try {
      const authContext = useAuth();
      if (authContext && authContext.currentUser) {
        setAuth(authContext);
      }
    } catch (error) {
      console.error("Error using auth context in VoiceCompanion:", error);
    }
  }, []);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setTranscript(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    } else {
      setError('Speech recognition not supported in this browser.');
    }
    
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.error("Error stopping speech recognition:", e);
        }
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not available');
      return;
    }
    
    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        
        // If there's a transcript, process it
        if (transcript.trim()) {
          processTranscript(transcript);
        }
      } catch (e) {
        console.error("Error stopping speech recognition:", e);
        setError("Error stopping speech recognition. Please try again.");
      }
    } else {
      try {
        setTranscript('');
        setResponse('');
        setError(null);
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setError("Error starting speech recognition. Please try again.");
      }
    }
  };

  const processTranscript = async (text) => {
    setIsLoading(true);
    
    try {
      // Get recent journal entries for context
      const journalEntries = JSON.parse(auth.userStorage.getItem('journalEntries')) || [];
      const recentEntries = journalEntries.slice(-3); // Get the last 3 entries
      
      const recentMood = recentEntries.length > 0 
        ? `Recent moods: ${recentEntries.map(e => e.dominantEmotion).join(', ')}`
        : 'No recent journal entries';
      
      const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an empathetic voice assistant for a mental health journaling app. 
        The user is speaking to you about their thoughts and feelings.
        
        Context about the user:
        ${recentMood}
        
        User's voice input: "${text}"
        
        Respond in a supportive, empathetic manner. Keep your response conversational and concise (around 2-3 sentences).
        If the user seems to be in distress, acknowledge their feelings and suggest they might want to write in their journal or speak to a professional.
        Your goal is to make the user feel heard and supported.`,
        config: {
          temperature: 0.7,
          maxOutputTokens: 256,
        }
      });
      
      const responseText = result.text || "I'm here to listen and support you.";
      setResponse(responseText);
      
      // Save the conversation to the user's history
      const conversations = JSON.parse(auth.userStorage.getItem('conversations')) || [];
      conversations.push({
        id: Date.now(),
        transcript: text,
        response: responseText,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.id || 'guest'
      });
      auth.userStorage.setItem('conversations', JSON.stringify(conversations));
      
      // Read response aloud
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(responseText);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error('Error processing voice input:', err);
      setError('Sorry, I had trouble understanding that. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-pink-200">
      <h2 className="text-2xl font-bold text-pink-600 mb-4">🎤 Voice Companion</h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4">
          {error}
        </div>
      )}
      
      <div className="flex flex-col items-center">
        <button
          onClick={toggleListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isListening 
              ? 'bg-red-500 animate-pulse' 
              : 'bg-pink-500 hover:bg-pink-600'
          } text-white`}
        >
          {isListening ? (
            <span className="text-3xl">⏹️</span>
          ) : (
            <span className="text-3xl">🎤</span>
          )}
        </button>
        
        <div className="text-center">
          {isListening && (
            <p className="text-pink-500 font-medium mb-2">Listening...</p>
          )}
          
          {transcript && (
            <div className="bg-pink-50 p-4 rounded-lg mb-4 w-full max-w-lg">
              <p className="text-gray-700">{transcript}</p>
            </div>
          )}
          
          {isLoading && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          )}
          
          {response && (
            <div className="bg-purple-50 p-4 rounded-lg mb-4 w-full max-w-lg border-l-4 border-purple-400">
              <p className="text-gray-700">{response}</p>
            </div>
          )}
        </div>
        
        <div className="text-center mt-4 text-sm text-gray-500">
          <p>Click the microphone button and speak to me.</p>
          <p>I'm here to listen and support your emotional journey.</p>
        </div>
      </div>
    </div>
  );
}
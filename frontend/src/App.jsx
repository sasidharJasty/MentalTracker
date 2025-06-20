import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './Components/Auth/ProtectedRoute';
import AuthContainer from './Components/Auth/AuthContainer';
import Home from './Components/Home';
import Header from './Components/Header';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-pink-50">
          <Routes>
            <Route path="/login" element={<AuthContainer />} />
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <>
                    <Header />
                    <Home />
                  </>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
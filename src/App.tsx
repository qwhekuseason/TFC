import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Auth from './components/Auth';
import FamilySelection from './components/FamilySelection';
import FamilyDashboard from './components/FamilyDashboard';

function AppContent() {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Auth />;
  }

  if (!userData?.familyId) {
    return <FamilySelection />;
  }

  return <FamilyDashboard />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<AppContent />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
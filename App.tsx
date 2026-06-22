import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './components/Layout';
import Landing from './Landing';
import Dashboard from './Dashboard';

// Placeholder components
import Learn from './Learn';
import Block1 from './Block1';
import Block2 from './Block2';
import Block3 from './Block3';
import Block4 from './Block4';
import Block5 from './Block5';

import AISimulator from './AISimulator';
import ScamCheck from './ScamCheck';
import KBCQuiz from './KBCQuiz';

import Community from './Community';
import Help from './Help';
import SettingsPage from './Settings';
import DeepfakeLab from './DeepfakeLab';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/learn" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
            <Route path="/learn/block1" element={<ProtectedRoute><Block1 /></ProtectedRoute>} />
            <Route path="/learn/block2" element={<ProtectedRoute><Block2 /></ProtectedRoute>} />
            <Route path="/learn/block3" element={<ProtectedRoute><Block3 /></ProtectedRoute>} />
            <Route path="/learn/block4" element={<ProtectedRoute><Block4 /></ProtectedRoute>} />
            <Route path="/learn/block5" element={<ProtectedRoute><Block5 /></ProtectedRoute>} />
            <Route path="/ai-test" element={<ProtectedRoute><AISimulator /></ProtectedRoute>} />
            <Route path="/scam-check" element={<ProtectedRoute><ScamCheck /></ProtectedRoute>} />
            <Route path="/quiz" element={<ProtectedRoute><KBCQuiz /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/awareness-lab" element={<ProtectedRoute><DeepfakeLab /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

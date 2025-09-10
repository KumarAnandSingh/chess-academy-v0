// This is the backup of the original App.tsx - keeping for reference
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layout components
import Layout from './components/ui/Layout';

// Page components (we'll create these)
import DashboardPage from './pages/DashboardPage';
import LessonsPage from './pages/LessonsPage';
import LessonPage from './pages/LessonPage';
import PuzzlesPage from './pages/PuzzlesPage';
import PlayComputerPage from './pages/PlayComputerPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import SettingsPage from './pages/SettingsPage';
import DebugPage from './pages/DebugPage';

// Auth components
import { GoogleCallback } from './components/auth/GoogleCallback';
import { AuthSuccess } from './components/auth/AuthSuccess';

// Stores and providers
import { AuthProvider } from './components/auth/AuthProvider';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Import ProtectedRoute for authentication
import { ProtectedRoute, PublicRoute } from './components/auth/ProtectedRoute';

// Wrapper components for different route types
const AuthRequiredRoute: React.FC<{ children: React.ReactNode; featureName?: string }> = ({ 
  children, 
  featureName 
}) => {
  return (
    <ProtectedRoute requireAuth={true} featureName={featureName}>
      {children}
    </ProtectedRoute>
  );
};

const PublicAppRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PublicRoute>
      {children}
    </PublicRoute>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Home Route - redirects to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Public Dashboard - No authentication needed */}
            <Route path="/dashboard" element={
              <PublicAppRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </PublicAppRoute>
            } />
            
            {/* Protected Lesson Routes - Authentication Required */}
            <Route path="/lessons" element={
              <AuthRequiredRoute featureName="chess lessons">
                <Layout>
                  <LessonsPage />
                </Layout>
              </AuthRequiredRoute>
            } />
            
            <Route path="/lessons/:lessonId" element={
              <AuthRequiredRoute featureName="this lesson">
                <Layout>
                  <LessonPage />
                </Layout>
              </AuthRequiredRoute>
            } />
            
            {/* Protected Puzzles Route - Authentication Required */}
            <Route path="/puzzles" element={
              <AuthRequiredRoute featureName="chess puzzles">
                <Layout>
                  <PuzzlesPage />
                </Layout>
              </AuthRequiredRoute>
            } />
            
            {/* Protected Play Route - Authentication Required */}
            <Route path="/play" element={
              <AuthRequiredRoute featureName="playing against computer">
                <Layout>
                  <PlayComputerPage />
                </Layout>
              </AuthRequiredRoute>
            } />
            
            {/* Protected Profile Route - Authentication Required */}
            <Route path="/profile" element={
              <AuthRequiredRoute featureName="your profile">
                <Layout>
                  <ProfilePage />
                </Layout>
              </AuthRequiredRoute>
            } />
            
            {/* Public Leaderboard - No authentication needed */}
            <Route path="/leaderboard" element={
              <PublicAppRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
              </PublicAppRoute>
            } />
            
            {/* Protected Settings Route - Authentication Required */}
            <Route path="/settings" element={
              <AuthRequiredRoute featureName="settings">
                <Layout>
                  <SettingsPage />
                </Layout>
              </AuthRequiredRoute>
            } />
            
            <Route path="/debug" element={
              <PublicAppRoute>
                <Layout>
                  <DebugPage />
                </Layout>
              </PublicAppRoute>
            } />

            {/* Auth routes */}
            <Route path="/auth/callback" element={<GoogleCallback />} />
            <Route path="/auth/success" element={<AuthSuccess />} />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
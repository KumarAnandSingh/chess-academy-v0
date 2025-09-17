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
import MultiplayerPage from './pages/MultiplayerPage';
import GamePage from './pages/GamePage';

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

// Simple wrapper component - no authentication needed
const AppRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
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

            {/* Main App Routes - No authentication needed */}
            <Route path="/dashboard" element={
              <AppRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/lessons" element={
              <AppRoute>
                <Layout>
                  <LessonsPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/lessons/:lessonId" element={
              <AppRoute>
                <Layout>
                  <LessonPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/puzzles" element={
              <AppRoute>
                <Layout>
                  <PuzzlesPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/play" element={
              <AppRoute>
                <Layout>
                  <PlayComputerPage />
                </Layout>
              </AppRoute>
            } />

            <Route path="/multiplayer" element={
              <AppRoute>
                <Layout>
                  <MultiplayerPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/profile" element={
              <AppRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/leaderboard" element={
              <AppRoute>
                <Layout>
                  <LeaderboardPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/settings" element={
              <AppRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </AppRoute>
            } />
            
            <Route path="/debug" element={
              <AppRoute>
                <Layout>
                  <DebugPage />
                </Layout>
              </AppRoute>
            } />

            {/* Game Route - Full screen without Layout */}
            <Route path="/game/:gameId" element={
              <AppRoute>
                <GamePage />
              </AppRoute>
            } />

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

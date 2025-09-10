import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

const HomePage: React.FC = () => {
  const { loginDemo } = useAuthStore();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    loginDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold mb-6" style={{ color: 'var(--color-text-primary)' }}>
          Chess Academy
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Master chess through interactive lessons, puzzles, and AI-powered coaching. 
          From beginner to advanced - learn at your own pace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link 
            to="/register" 
            className="inline-flex items-center justify-center text-lg px-8 py-3 rounded-lg transition-all duration-200 border-2"
            style={{ 
              backgroundColor: 'var(--color-surface-elevated)', 
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            Create Account
          </Link>
          <Link 
            to="/login" 
            className="inline-flex items-center justify-center text-lg px-8 py-3 rounded-lg transition-all duration-200 border-2"
            style={{ 
              backgroundColor: 'transparent', 
              color: 'var(--color-text-secondary)',
              borderColor: 'var(--color-border-default)'
            }}
          >
            Sign In
          </Link>
        </div>
        
        <div className="mb-8">
          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 border-2"
            style={{ 
              backgroundColor: 'var(--color-accent-primary)', 
              color: 'white',
              borderColor: 'var(--color-accent-primary)'
            }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            🚀 Continue as Guest
          </button>
          <p className="text-sm mt-2" style={{ color: 'var(--color-text-secondary)' }}>
            Start learning immediately - no signup required!
          </p>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-accent-primary-subtle)' }}>
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Interactive Lessons</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>90 structured lessons from basics to advanced tactics</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-success-subtle)' }}>
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Chess Puzzles</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Thousands of puzzles to sharpen your tactical skills</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--color-warning-subtle)' }}>
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>AI Coach</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Personalized feedback and adaptive learning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
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
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-6">
          Chess Academy
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Master chess through interactive lessons, puzzles, and AI-powered coaching. 
          From beginner to advanced - learn at your own pace.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            to="/register" 
            className="btn-primary text-lg px-8 py-3"
          >
            Start Learning
          </Link>
          <Link 
            to="/login" 
            className="btn-outline text-lg px-8 py-3"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-6">
          <button
            onClick={handleDemoLogin}
            className="inline-flex items-center px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Try Demo Mode - Skip Registration
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Jump straight into the chess learning experience!
          </p>
        </div>
        
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Interactive Lessons</h3>
            <p className="text-gray-600">90 structured lessons from basics to advanced tactics</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Chess Puzzles</h3>
            <p className="text-gray-600">Thousands of puzzles to sharpen your tactical skills</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Coach</h3>
            <p className="text-gray-600">Personalized feedback and adaptive learning</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
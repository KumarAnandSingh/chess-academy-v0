import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Crown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

export const AuthSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setTokens } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processSuccess = async () => {
      try {
        const token = searchParams.get('token');
        const refreshToken = searchParams.get('refreshToken');

        if (!token) {
          console.error('No access token in success URL');
          navigate('/auth/error?message=Missing authentication token');
          return;
        }

        // Set the tokens in the auth store
        setTokens(token, refreshToken || undefined);

        // Get user profile with the token
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setUser(data.data.user, token, refreshToken || undefined);
          }
        }

        setIsProcessing(false);
        
        // Redirect after successful processing
        setTimeout(() => {
          const returnTo = sessionStorage.getItem('auth_return_to') || '/dashboard';
          sessionStorage.removeItem('auth_return_to');
          navigate(returnTo);
        }, 2000);

      } catch (error) {
        console.error('Error processing auth success:', error);
        navigate('/auth/error?message=Failed to complete authentication');
      }
    };

    processSuccess();
  }, [searchParams, setUser, setTokens, navigate]);

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 text-lg">Completing your sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="max-w-md mx-auto text-center bg-white rounded-3xl shadow-2xl p-8 border border-green-200"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center relative overflow-hidden"
        >
          <CheckCircle className="w-10 h-10 text-white z-10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-500 opacity-50"
          />
        </motion.div>

        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Chess Academy!
          </h1>
          <p className="text-gray-600 text-lg">
            Your account has been successfully created and you're now signed in.
          </p>
        </motion.div>

        {/* Welcome Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-3 mb-6"
        >
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Crown className="w-4 h-4 text-yellow-500 mr-3" />
            <span>Your chess journey begins now!</span>
          </div>
          <div className="flex items-center justify-center text-sm text-gray-600">
            <Sparkles className="w-4 h-4 text-purple-500 mr-3" />
            <span>Start learning and track your progress</span>
          </div>
        </motion.div>

        {/* Loading indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500"
        >
          Redirecting you to your dashboard...
        </motion.div>
      </motion.div>
    </div>
  );
};
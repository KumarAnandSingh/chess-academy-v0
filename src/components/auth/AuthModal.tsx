import React, { useState, useEffect } from 'react';
import { X, Crown, Mail, Lock, Eye, EyeOff, User, Chrome, Sparkles, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '../../lib/utils';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  className?: string;
}

interface FormData {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
  general?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  className,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    username: '',
    displayName: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, loginWithGoogle, loginDemo, isLoading, error, clearError } = useAuthStore();

  // Reset mode and form when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setFormData({ email: '', password: '', username: '', displayName: '' });
      setErrors({});
      setShowPassword(false);
      clearError();
    }
  }, [isOpen, initialMode, clearError]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (mode === 'register') {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.displayName) {
        newErrors.displayName = 'Display name is required';
      } else if (formData.displayName.length < 2) {
        newErrors.displayName = 'Display name must be at least 2 characters';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register({
          email: formData.email,
          password: formData.password,
          username: formData.username!,
          displayName: formData.displayName!
        });
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithGoogle();
      // Note: Google auth will redirect, so we don't close the modal here
    } catch (err) {
      setErrors({ general: 'Google authentication failed. Please try again.' });
    }
  };

  const handleDemoLogin = async () => {
    try {
      loginDemo();
      onClose();
    } catch (err) {
      setErrors({ general: 'Demo login failed. Please try again.' });
    }
  };

  if (!isOpen) return null;

  const isLoadingState = isLoading || isSubmitting;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0"
          onClick={onClose}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn(
            "relative w-full max-w-md sm:max-w-lg mx-auto my-2 sm:my-8",
            "bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden",
            "border border-gray-200 max-h-[95vh] overflow-y-auto",
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header Section with Gradient */}
          <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 px-8 py-12 text-white">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Crown className="w-10 h-10 text-white" />
              </motion.div>
              <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-2"
              >
                {mode === 'login' ? 'Welcome Back!' : 'Join Chess Academy'}
              </motion.h1>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-white/80 text-lg"
              >
                {mode === 'login' 
                  ? 'Continue your chess mastery journey' 
                  : 'Start your path to chess excellence'
                }
              </motion.p>
            </div>
          </div>

          {/* Form Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-8 py-8"
          >
            {/* Error Display */}
            {(errors.general || error) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3"
              >
                <Shield className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">
                  {errors.general || error}
                </p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange('email')}
                    placeholder="Enter your email"
                    className={cn(
                      "w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200",
                      "text-gray-900 placeholder-gray-400",
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20",
                      "focus:outline-none focus:ring-4"
                    )}
                    disabled={isLoadingState}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Register Fields */}
              {mode === 'register' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.username}
                        onChange={handleInputChange('username')}
                        placeholder="Choose a username"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200",
                          "text-gray-900 placeholder-gray-400",
                          errors.username
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        disabled={isLoadingState}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600">{errors.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <div className="relative">
                      <Sparkles className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={handleInputChange('displayName')}
                        placeholder="Your display name"
                        className={cn(
                          "w-full pl-12 pr-4 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200",
                          "text-gray-900 placeholder-gray-400",
                          errors.displayName
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                            : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20",
                          "focus:outline-none focus:ring-4"
                        )}
                        disabled={isLoadingState}
                      />
                    </div>
                    {errors.displayName && (
                      <p className="mt-2 text-sm text-red-600">{errors.displayName}</p>
                    )}
                  </div>
                </>
              )}

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange('password')}
                    placeholder={mode === 'register' ? 'Create a strong password' : 'Enter your password'}
                    className={cn(
                      "w-full pl-12 pr-12 py-4 border-2 rounded-xl bg-gray-50 focus:bg-white transition-all duration-200",
                      "text-gray-900 placeholder-gray-400",
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-200 focus:border-blue-500 focus:ring-blue-500/20",
                      "focus:outline-none focus:ring-4"
                    )}
                    disabled={isLoadingState}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={isLoadingState}
              >
                {isLoadingState ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-sm text-gray-500 bg-white">Or continue with</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            {/* Social & Demo Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleAuth}
                disabled={isLoadingState}
                className="py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50"
              >
                <Chrome className="w-5 h-5 mr-2" />
                Google
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleDemoLogin}
                disabled={isLoadingState}
                className="py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl font-medium transition-all duration-200 hover:bg-gray-50"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Try Demo
              </Button>
            </div>

            {/* Mode Switch */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <span className="text-gray-600">
                {mode === 'login' ? "Don't have an account?" : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-200"
                disabled={isLoadingState}
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
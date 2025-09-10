import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormField, FormHeader, FormFooter } from '../ui/form';
import { LoadingSpinner } from '../ui/loading-spinner';
import { cn } from '../../lib/utils';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onClose?: () => void;
  className?: string;
}

interface FormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({ 
  onSwitchToRegister, 
  onClose,
  className 
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loginWithGoogle, isLoading, error, clearError, deviceInfo } = useAuthStore();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData);
      onClose?.();
    } catch (err) {
      setErrors({ general: error || 'Login failed. Please try again.' });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      onClose?.();
    } catch (err) {
      setErrors({ general: 'Google login failed. Please try again.' });
    }
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@chessacademy.com',
      password: 'demo123',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "w-full max-w-md mx-auto p-6 bg-card rounded-lg shadow-mobile-card",
        "mobile:p-8 mobile:max-w-sm",
        className
      )}
    >
      <FormHeader
        title="Welcome Back"
        subtitle="Sign in to continue your chess journey"
      />

      <Form onSubmit={handleSubmit}>
        {(errors.general || error) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 bg-destructive/10 border border-destructive/20 rounded-md"
          >
            <p className="text-sm text-destructive mobile:text-base">
              {errors.general || error}
            </p>
          </motion.div>
        )}

        <FormField
          label="Email Address"
          error={errors.email}
          required
        >
          <Input
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            startIcon={<Mail className="w-4 h-4" />}
            autoComplete="email"
            disabled={isLoading}
          />
        </FormField>

        <FormField
          label="Password"
          error={errors.password}
          required
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            startIcon={<Lock className="w-4 h-4" />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            autoComplete="current-password"
            disabled={isLoading}
          />
        </FormField>

        <div className="flex items-center justify-between text-sm mobile:text-base">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <span className="text-muted-foreground">Remember me</span>
          </label>
          
          <button
            type="button"
            className="text-primary hover:underline font-medium"
            disabled={isLoading}
          >
            Forgot password?
          </button>
        </div>

        <Button
          type="submit"
          className={cn(
            "w-full h-11 text-base font-medium",
            "mobile:h-12 mobile:text-lg",
            "touch:h-12"
          )}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" variant="secondary" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm mobile:text-base">
            <span className="px-4 bg-card text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 text-base",
              "mobile:h-12 mobile:text-lg",
              "touch:h-12"
            )}
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 text-base text-muted-foreground",
              "mobile:h-12 mobile:text-lg",
              "touch:h-12"
            )}
            onClick={handleDemoLogin}
            disabled={isLoading}
          >
            Try Demo
          </Button>
        </div>
      </Form>

      <FormFooter>
        <div className="text-center">
          <span className="text-muted-foreground mobile:text-lg">
            Don't have an account?{' '}
          </span>
          <button
            onClick={onSwitchToRegister}
            className="text-primary hover:underline font-medium mobile:text-lg"
            disabled={isLoading}
          >
            Sign up
          </button>
        </div>
      </FormFooter>
    </motion.div>
  );
};
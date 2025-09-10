import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Chrome } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Form, FormField, FormHeader, FormFooter } from '../ui/form';
import { LoadingSpinner } from '../ui/loading-spinner';
import { cn } from '../../lib/utils';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
  className?: string;
}

interface FormData {
  email: string;
  username: string;
  displayName: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  email?: string;
  username?: string;
  displayName?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

const passwordStrengthLevels = [
  { label: 'Very Weak', color: 'bg-red-500', minLength: 0 },
  { label: 'Weak', color: 'bg-orange-500', minLength: 6 },
  { label: 'Fair', color: 'bg-yellow-500', minLength: 8 },
  { label: 'Good', color: 'bg-blue-500', minLength: 10 },
  { label: 'Strong', color: 'bg-green-500', minLength: 12 },
];

export const RegisterForm: React.FC<RegisterFormProps> = ({ 
  onSwitchToLogin, 
  onClose,
  className 
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    username: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const { register, loginWithGoogle, isLoading, error, clearError, deviceInfo } = useAuthStore();

  const getPasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Username validation
    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Display name validation
    if (!formData.displayName) {
      newErrors.displayName = 'Display name is required';
    } else if (formData.displayName.length < 2) {
      newErrors.displayName = 'Display name must be at least 2 characters';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    } else if (getPasswordStrength(formData.password) < 2) {
      newErrors.password = 'Password is too weak. Use uppercase, lowercase, numbers, and symbols.';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Terms acceptance
    if (!acceptTerms) {
      newErrors.general = 'Please accept the terms and conditions';
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
      await register({
        email: formData.email,
        username: formData.username,
        displayName: formData.displayName,
        password: formData.password,
      });
      onClose?.();
    } catch (err) {
      setErrors({ general: error || 'Registration failed. Please try again.' });
    }
  };

  const handleGoogleRegister = async () => {
    try {
      await loginWithGoogle();
      onClose?.();
    } catch (err) {
      setErrors({ general: 'Google registration failed. Please try again.' });
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthLevel = passwordStrengthLevels[Math.min(passwordStrength, 4)];

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
        title="Join Chess Academy"
        subtitle="Create your account to start learning"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Username"
            error={errors.username}
            required
          >
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={handleInputChange('username')}
              error={errors.username}
              startIcon={<User className="w-4 h-4" />}
              autoComplete="username"
              disabled={isLoading}
            />
          </FormField>

          <FormField
            label="Display Name"
            error={errors.displayName}
            required
          >
            <Input
              type="text"
              placeholder="Your name"
              value={formData.displayName}
              onChange={handleInputChange('displayName')}
              error={errors.displayName}
              startIcon={<User className="w-4 h-4" />}
              autoComplete="name"
              disabled={isLoading}
            />
          </FormField>
        </div>

        <FormField
          label="Password"
          error={errors.password}
          required
        >
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
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
            autoComplete="new-password"
            disabled={isLoading}
          />
          
          {formData.password && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      strengthLevel.color
                    )}
                    style={{ width: `${(passwordStrength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground mobile:text-sm">
                  {strengthLevel.label}
                </span>
              </div>
            </div>
          )}
        </FormField>

        <FormField
          label="Confirm Password"
          error={errors.confirmPassword}
          required
        >
          <Input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            error={errors.confirmPassword}
            startIcon={<Lock className="w-4 h-4" />}
            endIcon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="p-1 hover:text-foreground transition-colors"
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            }
            autoComplete="new-password"
            disabled={isLoading}
          />
        </FormField>

        <div className="space-y-4">
          <label className="flex items-start space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-primary"
              disabled={isLoading}
            />
            <span className="text-sm text-muted-foreground mobile:text-base leading-relaxed">
              I agree to the{' '}
              <a href="/terms" className="text-primary hover:underline">
                Terms of Service
              </a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </span>
          </label>
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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm mobile:text-base">
            <span className="px-4 bg-card text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full h-11 text-base",
            "mobile:h-12 mobile:text-lg",
            "touch:h-12"
          )}
          onClick={handleGoogleRegister}
          disabled={isLoading}
        >
          <Chrome className="w-4 h-4 mr-2" />
          Continue with Google
        </Button>
      </Form>

      <FormFooter>
        <div className="text-center">
          <span className="text-muted-foreground mobile:text-lg">
            Already have an account?{' '}
          </span>
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium mobile:text-lg"
            disabled={isLoading}
          >
            Sign in
          </button>
        </div>
      </FormFooter>
    </motion.div>
  );
};
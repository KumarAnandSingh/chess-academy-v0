import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { cn } from '../../lib/utils';

export const GoogleCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, isLoading } = useAuthStore();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Handle OAuth errors from Google
        if (error) {
          let message = 'Google authentication failed';
          
          switch (error) {
            case 'access_denied':
              message = 'Access denied. You cancelled the authentication process.';
              break;
            case 'invalid_request':
              message = 'Invalid authentication request.';
              break;
            case 'unsupported_response_type':
              message = 'Unsupported response type.';
              break;
            default:
              message = errorDescription || `Authentication failed: ${error}`;
          }

          setErrorMessage(message);
          setStatus('error');
          return;
        }

        // Handle missing authorization code
        if (!code) {
          setErrorMessage('No authorization code received from Google.');
          setStatus('error');
          return;
        }

        // Process the callback
        await handleGoogleCallback(code, state || undefined);
        setStatus('success');
        
        // Redirect after successful authentication
        setTimeout(() => {
          const returnTo = sessionStorage.getItem('auth_return_to') || '/';
          sessionStorage.removeItem('auth_return_to');
          navigate(returnTo);
        }, 2000);

      } catch (err) {
        console.error('Google callback error:', err);
        setErrorMessage(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, handleGoogleCallback, navigate]);

  const handleRetry = () => {
    // Redirect to Google OAuth
    const params = new URLSearchParams({
      redirect_uri: window.location.origin + '/auth/callback',
    });
    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={cn(
          "w-full max-w-md mx-auto p-8 bg-card rounded-lg shadow-mobile-card text-center",
          "mobile:p-10 mobile:max-w-sm"
        )}
      >
        <div className="mb-6">
          {status === 'loading' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-primary/10 rounded-full">
                <LoadingSpinner size="lg" variant="primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mobile:text-2xl">
                  Authenticating...
                </h2>
                <p className="text-muted-foreground mt-2 mobile:text-lg">
                  Please wait while we complete your Google sign-in
                </p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-green-100 dark:bg-green-900/20 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mobile:text-2xl">
                  Success!
                </h2>
                <p className="text-muted-foreground mt-2 mobile:text-lg">
                  You have been successfully authenticated. Redirecting you now...
                </p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center space-y-4"
            >
              <div className="p-4 bg-destructive/10 rounded-full">
                <XCircle className="w-8 h-8 text-destructive" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-foreground mobile:text-2xl">
                  Authentication Failed
                </h2>
                {errorMessage && (
                  <p className="text-destructive mt-2 mobile:text-lg">
                    {errorMessage}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-3"
          >
            <Button
              onClick={handleRetry}
              className={cn(
                "w-full h-11 text-base font-medium",
                "mobile:h-12 mobile:text-lg"
              )}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" variant="secondary" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className={cn(
                "w-full h-11 text-base",
                "mobile:h-12 mobile:text-lg"
              )}
              disabled={isLoading}
            >
              Go to Home
            </Button>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="text-sm text-muted-foreground mt-4 mobile:text-base"
          >
            This may take a few seconds...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
};
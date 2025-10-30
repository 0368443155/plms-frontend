'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, fetchUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      // Check for error
      const errorParam = searchParams.get('error');
      if (errorParam) {
        setError('Google authentication failed. Please try again.');
        setTimeout(() => router.push('/login'), 3000);
        return;
      }

      // Get tokens from URL
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      console.log('Callback received:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

      if (accessToken && refreshToken) {
        try {
          // Save tokens
          setTokens(accessToken, refreshToken);
          
          // Fetch user info
          await fetchUser();
          
          console.log('Google login successful, redirecting...');
          
          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Callback error:', error);
          setError('Failed to complete login. Please try again.');
          setTimeout(() => router.push('/login'), 3000);
        }
      } else {
        setError('Invalid callback. Missing tokens.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, setTokens, fetchUser, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500 mt-2">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto" />
        <p className="mt-4 text-gray-600">Completing Google sign in...</p>
        <p className="text-sm text-gray-500 mt-2">Please wait...</p>
      </div>
    </div>
  );
}
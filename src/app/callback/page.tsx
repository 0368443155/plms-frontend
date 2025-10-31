'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, fetchUser } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      console.log('🔄 Processing Google callback...');
      
      try {
        const errorParam = searchParams.get('error');
        if (errorParam) {
          setStatus('error');
          setErrorMessage(decodeURIComponent(errorParam));
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        console.log('Tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });

        if (accessToken && refreshToken) {
          // Save tokens
          setTokens(accessToken, refreshToken);
          console.log('✅ Tokens saved');
          
          // Fetch user
          await fetchUser();
          console.log('✅ User fetched');
          
          setStatus('success');
          
          // Redirect
          setTimeout(() => {
            router.push('/dashboard');
          }, 1000);
        } else {
          throw new Error('Missing tokens');
        }
      } catch (error: any) {
        console.error('Callback error:', error);
        setStatus('error');
        setErrorMessage(error.message || 'Authentication failed');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    processCallback();
  }, [searchParams, setTokens, fetchUser, router]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Authentication Failed</h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Success!</h2>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Completing Sign In</h2>
        <p className="text-gray-600">Please wait...</p>
      </div>
    </div>
  );
}
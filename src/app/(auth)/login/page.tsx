'use client';

import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      toast.error('Authentication Error', {
        description: decodeURIComponent(error),
      });
    }
  }, [searchParams]);

  return <LoginForm />;
}
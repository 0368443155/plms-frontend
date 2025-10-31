'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { useEffect } from 'react';
import { toast } from 'sonner';

function LoginPageInner() {
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading login...</div>}>
      <LoginPageInner />
    </Suspense>
  );
}

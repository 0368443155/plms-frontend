import ForgotPasswordForm from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Forgot Password - PLMS',
  description: 'Reset your password',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
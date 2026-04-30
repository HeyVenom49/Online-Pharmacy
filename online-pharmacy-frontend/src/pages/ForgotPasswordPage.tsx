import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { HeartPulse, Mail, Lock, Shield, CheckCircle, AlertCircle, ArrowRight, Key } from 'lucide-react';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, resetPassword, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<'email' | 'otp' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');
    setSuccessMessage('');
    setIsAnimating(true);

    try {
      await requestPasswordReset(email);
      setIsAnimating(false);
      setStep('otp');
      setSuccessMessage('OTP sent! Check your email for the verification code.');
    } catch {
      setIsAnimating(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (newPassword !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return;
    }

    setIsAnimating(true);
    try {
      await resetPassword(email, otpCode, newPassword);
      setIsAnimating(false);
      setStep('success');
    } catch {
      setIsAnimating(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtpCode('');
    setNewPassword('');
    setConfirmPassword('');
    clearError();
    setSuccessMessage('');
  };

  if (step === 'success') {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-soft p-8 border border-slate-100 text-center animate-scale-in">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Password Reset Successful</h2>
            <p className="text-slate-600 mb-8">
              Your password has been reset successfully. You can now login with your new password.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full h-12">
              Go to Login
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center space-y-8 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl animate-float"
                style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}
              >
                <Key className="h-12 w-12 text-white" strokeWidth={2.4} />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">
              Reset Your <span className="text-gradient">Password</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Don't worry, we got you covered. Enter your email and we'll send you a secure reset code.
            </p>
          </div>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-success" />
              <span>Secure process</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Quick recovery</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex justify-center mb-8">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}
            >
              <Key className="h-8 w-8 text-white" strokeWidth={2.4} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8 border border-slate-100 animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {step === 'email' ? 'Reset Password' : 'Verify OTP'}
              </h2>
              <p className="text-slate-600">
                {step === 'email'
                  ? "Enter your email to receive a reset code"
                  : 'Enter the OTP and your new password'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-down">
                <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {successMessage && step === 'otp' && (
              <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-3 animate-slide-down">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {step === 'email' ? (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12" loading={loading && isAnimating}>
                  Send Reset Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-slate-600">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-5">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-slate-600 mb-1">We've sent a code to</p>
                  <p className="font-semibold text-slate-900">{email}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="reset-otp" className="text-sm font-medium text-slate-700">Verification Code</label>
                  <Input
                    id="reset-otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    pattern="[0-9]{6}"
                    required
                    className="h-14 text-center text-xl tracking-[0.5em] font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-password" className="text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirm-new-password" className="text-sm font-medium text-slate-700">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirm-new-password"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                {validationError && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-700">{validationError}</p>
                  </div>
                )}

                <Button type="submit" className="w-full h-12" loading={loading && isAnimating}>
                  Reset Password
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <button
                  type="button"
                  onClick={handleBackToEmail}
                  className="w-full text-center text-sm text-slate-600 hover:text-primary transition-colors"
                >
                  &larr; Use different email
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4" />
                <span>Your information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
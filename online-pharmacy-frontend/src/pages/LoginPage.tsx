import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { HeartPulse, Mail, Lock, Shield, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithOtp, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsAnimating(true);
    try {
      const result = await login(email, password);
      setIsAnimating(false);
      if (result.requiresOtp) {
        setPendingEmail(email);
        setStep('otp');
      } else {
        const storedUser = (() => {
          try {
            const stored = localStorage.getItem('user');
            return stored ? JSON.parse(stored) : null;
          } catch {
            return null;
          }
        })();
        if (storedUser?.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      }
    } catch {
      setIsAnimating(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsAnimating(true);
    
    console.log('Starting OTP submit with:', pendingEmail, otpCode);
    
    try {
      await loginWithOtp(pendingEmail, otpCode);
      console.log('loginWithOtp succeeded');
    } catch (err: any) {
      console.error('loginWithOtp failed:', err?.response?.data || err);
      setIsAnimating(false);
      return;
    }
    
    setIsAnimating(false);
    
    // Read from localStorage directly since store might not be updated yet
    const userJson = localStorage.getItem('user');
    const user = userJson ? JSON.parse(userJson) : null;
    console.log('Redirecting user:', user);
    
    const target = user?.role === 'ADMIN' ? '/admin/dashboard' : '/';
    window.location.href = target;
  };

  const handleBackToCredentials = () => {
    setStep('credentials');
    setOtpCode('');
    clearError();
  };

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
                <HeartPulse className="h-12 w-12 text-white" strokeWidth={2.4} />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-success animate-pulse" />
              <div className="absolute -bottom-1 -left-3 h-4 w-4 rounded-full bg-primary-light animate-pulse-soft" />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-slate-900">
              Welcome to <span className="text-gradient">PharmaCare</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Your trusted healthcare partner. Order genuine medicines and health products from the comfort of your home.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/80 shadow-sm">
              <Shield className="h-8 w-8 text-success mb-2" />
              <span className="text-sm font-medium text-slate-700">100% Genuine</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/80 shadow-sm">
              <svg className="h-8 w-8 text-primary mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Quick Delivery</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-2xl bg-white/80 shadow-sm">
              <svg className="h-8 w-8 text-warning mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm font-medium text-slate-700">Secure</span>
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
              <HeartPulse className="h-8 w-8 text-white" strokeWidth={2.4} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-soft p-8 border border-slate-100 animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {step === 'credentials' ? 'Sign In' : 'Verify OTP'}
              </h2>
              <p className="text-slate-600">
                {step === 'credentials'
                  ? 'Access your PharmaCare account'
                  : 'Enter the verification code sent to your email'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-down">
                <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {step === 'credentials' ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-medium" loading={loading && isAnimating}>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-500">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-slate-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-primary font-medium hover:underline">
                    Create one now
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-slate-600 mb-1">We've sent a code to</p>
                  <p className="font-semibold text-slate-900">{pendingEmail}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-slate-700">Verification Code</label>
                  <div className="relative">
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      pattern="[0-9]{6}"
                      required
                      className="pl-11 h-14 text-center text-xl tracking-[0.5em] font-medium"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 text-base font-medium" loading={loading && isAnimating}>
                  Verify & Sign In
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleBackToCredentials}
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    &larr; Use different email
                  </button>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => {
                      login(pendingEmail, password);
                    }}
                  >
                    Resend code
                  </button>
                </div>
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
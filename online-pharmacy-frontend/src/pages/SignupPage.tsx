import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { HeartPulse, User, Mail, Phone, Lock, Shield, CheckCircle, AlertCircle, ArrowRight, Check } from 'lucide-react';

export function SignupPage() {
  const navigate = useNavigate();
  const { signup, verifySignupOtp, loading, error, clearError } = useAuthStore();

  const [step, setStep] = useState<'details' | 'otp'>('details');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [validationError, setValidationError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  const passwordRequirements = [
    { test: (p: string) => p.length >= 8, label: 'At least 8 characters' },
    { test: (p: string) => /[A-Z]/.test(p), label: 'One uppercase letter' },
    { test: (p: string) => /[0-9]/.test(p), label: 'One number' },
  ];

  const isPasswordValid = passwordRequirements.every(req => req.test(password));

  useEffect(() => {
    return () => {
      clearError();
    };
  }, []);

  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError('');

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    if (!isPasswordValid) {
      setValidationError('Please meet all password requirements');
      return;
    }

    setIsAnimating(true);
    try {
      await signup(name, email, password, mobile);
      setIsAnimating(false);
      setStep('otp');
      setSuccessMessage('OTP sent! Check your email for the verification code.');
    } catch {
      setIsAnimating(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setIsAnimating(true);
    try {
      await verifySignupOtp(email, otpCode, name, password, mobile);
      setIsAnimating(false);
      navigate('/');
    } catch {
      setIsAnimating(false);
    }
  };

  const handleBackToDetails = () => {
    setStep('details');
    setOtpCode('');
    clearError();
    setSuccessMessage('');
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
              Join <span className="text-gradient">PharmaCare</span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              Create your account and get access to genuine medicines, easy ordering, and doorstep delivery.
            </p>
          </div>
          <div className="space-y-3 text-left max-w-sm mx-auto">
            {[
              'Order medicines from verified pharmacies',
              'Get prescription uploaded and tracked',
              'Enjoy doorstep delivery across India',
              'Access exclusive health deals',
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/80">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                  <Check className="h-4 w-4 text-success" />
                </div>
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
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
                {step === 'details' ? 'Create Account' : 'Verify Email'}
              </h2>
              <p className="text-slate-600">
                {step === 'details'
                  ? 'Start your healthcare journey with us'
                  : 'Enter the verification code sent to your email'}
              </p>
            </div>

            {(error || validationError) && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 animate-slide-down">
                <AlertCircle className="h-5 w-5 text-danger mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error || validationError}</p>
              </div>
            )}

            {successMessage && step === 'otp' && (
              <div className="mb-6 p-4 rounded-xl bg-success/10 border border-success/20 flex items-start gap-3 animate-slide-down">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            )}

            {step === 'details' ? (
              <form onSubmit={handleDetailsSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

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
                  <label htmlFor="mobile" className="text-sm font-medium text-slate-700">Mobile Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                  <div className="space-y-1.5 mt-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className={`flex items-center gap-2 text-xs transition-colors ${req.test(password) ? 'text-success' : 'text-slate-400'}`}>
                        <div className={`flex h-4 w-4 items-center justify-center rounded-full transition-colors ${req.test(password) ? 'bg-success text-white' : 'bg-slate-200'}`}>
                          {req.test(password) && <Check className="h-2.5 w-2.5" />}
                        </div>
                        {req.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="pl-11 h-12"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium" 
                  loading={loading && isAnimating}
                  disabled={!isPasswordValid}
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <p className="text-center text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            ) : (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                  <p className="text-sm text-slate-600 mb-1">We've sent a code to</p>
                  <p className="font-semibold text-slate-900">{email}</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="otp" className="text-sm font-medium text-slate-700">Verification Code</label>
                  <Input
                    id="otp"
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

                <Button type="submit" className="w-full h-12 text-base font-medium" loading={loading && isAnimating}>
                  Verify & Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={handleBackToDetails}
                    className="text-slate-600 hover:text-primary transition-colors"
                  >
                    &larr; Edit details
                  </button>
                  <button
                    type="button"
                    className="text-slate-500 hover:text-slate-700 transition-colors"
                    onClick={() => signup(name, email, password, mobile)}
                  >
                    Resend code
                  </button>
                </div>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="h-4 w-4" />
                <span>By creating an account, you agree to our Terms of Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
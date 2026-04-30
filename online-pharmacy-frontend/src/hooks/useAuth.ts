import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth';
import { getErrorMessage } from '../lib/errorMessage';
import type {
  User,
  LoginRequest,
  SignupRequest,
  OtpRequest,
  OtpVerificationRequest,
  AuthResponse,
  OtpResponse,
} from '../types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const ROLE_KEY = 'userRole';

function persistSession(response: AuthResponse, emailFallback?: string): User {
  const token = response.token;
  if (token && token !== 'null') {
    localStorage.setItem(TOKEN_KEY, token);
  }
  localStorage.setItem(ROLE_KEY, response.role);
  const userData: User = {
    id: response.userId,
    name: response.name || '',
    email: response.email || emailFallback || '',
    mobile: response.mobile ?? '',
    role: response.role,
    status: 'ACTIVE',
  };
  localStorage.setItem(USER_KEY, JSON.stringify(userData));
  return userData;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (token && token !== 'null' && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authApi.login(data);
    const needsOtp =
      response.otpRequired === true ||
      (!response.token && response.userId != null);

    if (needsOtp) {
      return response;
    }

    const userData = persistSession(response, data.email);
    setUser(userData);
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);
  const getRole = useCallback(() => localStorage.getItem(ROLE_KEY), []);
  const isAdmin = useCallback(() => getRole() === 'ADMIN', [getRole]);

  return {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    getToken,
    getRole,
    isAdmin,
  };
}

export function useOtpAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const requestLoginOtp = async (data: OtpRequest): Promise<OtpResponse> => {
    setLoading(true);
    setError('');
    try {
      return await authApi.generateLoginOtp(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to send OTP');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOtp = async (data: OtpVerificationRequest): Promise<OtpResponse> => {
    setLoading(true);
    setError('');
    try {
      return await authApi.verifyLoginOtp(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Invalid OTP');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const completeOtpLogin = async (email: string): Promise<AuthResponse> => {
    setLoading(true);
    setError('');
    try {
      const response = await authApi.completeOtpLogin(email);
      persistSession(response, email);
      return response;
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to complete login');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestSignupOtp = async (data: SignupRequest): Promise<OtpResponse> => {
    setLoading(true);
    setError('');
    try {
      return await authApi.signupWithOtp(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to send OTP');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOtp = async (params: {
    email: string;
    otpCode: string;
    name: string;
    password: string;
    mobile?: string;
  }): Promise<AuthResponse> => {
    setLoading(true);
    setError('');
    try {
      return await authApi.verifySignupOtp(params);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Invalid OTP');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const requestPasswordReset = async (data: OtpRequest): Promise<OtpResponse> => {
    setLoading(true);
    setError('');
    try {
      return await authApi.requestPasswordReset(data);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to send reset OTP');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (params: {
    email: string;
    otpCode: string;
    newPassword: string;
  }): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await authApi.resetPassword(params);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to reset password');
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    requestLoginOtp,
    verifyLoginOtp,
    completeOtpLogin,
    requestSignupOtp,
    verifySignupOtp,
    requestPasswordReset,
    resetPassword,
  };
}

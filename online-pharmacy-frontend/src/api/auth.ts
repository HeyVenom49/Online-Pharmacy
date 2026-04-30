import apiClient, { authClient, AUTH_BASE_URL } from '../lib/apiClient';
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  OtpRequest,
  OtpVerificationRequest,
  OtpResponse,
} from '../types';

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authClient.post<ApiResponse<AuthResponse>>('/login', data);
    return response.data.data;
  },

  generateLoginOtp: async (data: OtpRequest): Promise<OtpResponse> => {
    const response = await authClient.post<ApiResponse<OtpResponse>>('/otp/generate', data);
    return response.data.data;
  },

  signup: async (data: SignupRequest): Promise<User> => {
    const response = await authClient.post<ApiResponse<User>>('/signup', data);
    return response.data.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },

  signupWithOtp: async (data: SignupRequest): Promise<OtpResponse> => {
    const response = await authClient.post<ApiResponse<OtpResponse>>('/signup/otp/generate', data);
    return response.data.data;
  },

  verifySignupOtp: async (params: {
    email: string;
    otpCode: string;
    name: string;
    password: string;
    mobile?: string;
  }): Promise<AuthResponse> => {
    const response = await authClient.post<ApiResponse<AuthResponse>>('/signup/otp/verify', null, {
      params,
    });
    return response.data.data;
  },

  verifyLoginOtp: async (data: OtpVerificationRequest): Promise<OtpResponse> => {
    const response = await authClient.post<ApiResponse<OtpResponse>>('/otp/verify', data);
    return response.data.data;
  },

  completeOtpLogin: async (email: string): Promise<AuthResponse> => {
    const response = await authClient.post<ApiResponse<AuthResponse>>(`/verify-otp-login?email=${encodeURIComponent(email)}`);
    return response.data.data;
  },

  requestPasswordReset: async (data: OtpRequest): Promise<OtpResponse> => {
    const response = await authClient.post<ApiResponse<OtpResponse>>('/forgot-password', data);
    return response.data.data;
  },

  resetPassword: async (params: {
    email: string;
    otpCode: string;
    newPassword: string;
  }): Promise<void> => {
    await authClient.post('/reset-password', null, { params });
  },
};

export default authApi;
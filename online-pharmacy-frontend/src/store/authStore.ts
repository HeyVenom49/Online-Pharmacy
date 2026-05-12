import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, SignupRequest } from "../types";
import authApi from "../api/auth";
import { getErrorMessage } from "../lib/errorMessage";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ requiresOtp: boolean; email?: string }>;
  loginWithOtp: (email: string, otpCode: string) => Promise<User>;
  signup: (
    name: string,
    email: string,
    password: string,
    mobile: string,
  ) => Promise<{ requiresOtp: boolean; email?: string }>;
  signupWithOtp: (
    name: string,
    email: string,
    password: string,
    mobile: string,
  ) => Promise<void>;
  verifySignupOtp: (
    email: string,
    otpCode: string,
    name: string,
    password: string,
    mobile: string,
  ) => Promise<void>;
  resetPassword: (
    email: string,
    otpCode: string,
    newPassword: string,
  ) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.login({ email, password });

          const needsOtp =
            response.otpRequired === true ||
            (!response.token && response.userId != null);

          if (needsOtp) {
            set({ loading: false });
            return { requiresOtp: true, email };
          }

          const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            mobile: response.mobile || "",
            role: response.role,
            status: "ACTIVE",
          };
          localStorage.setItem("token", response.token || "");
          localStorage.setItem("user", JSON.stringify(user));
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
          return { requiresOtp: false };
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "Login failed"),
            loading: false,
          });
          throw error;
        }
      },

      loginWithOtp: async (email: string, otpCode: string) => {
        set({ loading: true, error: null });
        try {
          await authApi.verifyLoginOtp({ email, otpCode, otpType: "LOGIN" });
          const response = await authApi.completeOtpLogin(email);

          const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            mobile: response.mobile || "",
            role: response.role,
            status: "ACTIVE",
          };
          localStorage.setItem("token", response.token || "");
          localStorage.setItem("user", JSON.stringify(user));
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
          return user;
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "OTP verification failed"),
            loading: false,
          });
          throw error;
        }
      },

      signup: async (
        name: string,
        email: string,
        password: string,
        mobile: string,
      ) => {
        set({ loading: true, error: null });
        try {
          await authApi.signupWithOtp({
            name,
            email,
            password,
            mobile,
          } as SignupRequest);
          set({ loading: false });
          return { requiresOtp: true, email };
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "Signup failed"),
            loading: false,
          });
          throw error;
        }
      },

      signupWithOtp: async (
        name: string,
        email: string,
        password: string,
        mobile: string,
      ) => {
        set({ loading: true, error: null });
        try {
          await authApi.signupWithOtp({
            name,
            email,
            password,
            mobile,
          } as SignupRequest);
          set({ loading: false });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "Failed to send OTP"),
            loading: false,
          });
          throw error;
        }
      },

      verifySignupOtp: async (
        email: string,
        otpCode: string,
        name: string,
        password: string,
        mobile: string,
      ) => {
        set({ loading: true, error: null });
        try {
          const response = await authApi.verifySignupOtp({
            email,
            otpCode,
            name,
            password,
            mobile,
          });

          const user: User = {
            id: response.userId,
            name: response.name,
            email: response.email,
            mobile: response.mobile || "",
            role: response.role,
            status: "ACTIVE",
          };
          localStorage.setItem("token", response.token || "");
          localStorage.setItem("user", JSON.stringify(user));
          set({
            user,
            token: response.token,
            isAuthenticated: true,
            loading: false,
          });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "OTP verification failed"),
            loading: false,
          });
          throw error;
        }
      },

      requestPasswordReset: async (email: string) => {
        set({ loading: true, error: null });
        try {
          await authApi.requestPasswordReset({
            email,
            otpType: "PASSWORD_RESET",
          });
          set({ loading: false });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "Failed to send reset OTP"),
            loading: false,
          });
          throw error;
        }
      },

      resetPassword: async (
        email: string,
        otpCode: string,
        newPassword: string,
      ) => {
        set({ loading: true, error: null });
        try {
          await authApi.resetPassword({ email, otpCode, newPassword });
          set({ loading: false });
        } catch (error: unknown) {
          set({
            error: getErrorMessage(error, "Password reset failed"),
            loading: false,
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null, isAuthenticated: false });
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);

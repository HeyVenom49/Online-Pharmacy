import type { AxiosError } from 'axios';

export function getErrorMessage(error: unknown, fallback = 'Request failed'): string {
  const ax = error as AxiosError<{ message?: string }>;
  const msg = ax.response?.data?.message;
  if (typeof msg === 'string' && msg.trim()) {
    return msg;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

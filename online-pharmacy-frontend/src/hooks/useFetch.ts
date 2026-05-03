import { useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '../lib/apiClient';
import type { ApiResponse } from '../types';

interface UseFetchOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

interface UseFetchReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
}

export function useFetch<T>(url: string, options: UseFetchOptions<T> = {}): UseFetchReturn<T> {
  const { immediate = true, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<ApiResponse<T>>(url, {
        signal: abortControllerRef.current.signal,
      });
      const result = response.data.data;
      setData(result);
      onSuccess?.(result);
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const error = new Error(err.message || 'Failed to fetch data');
        setError(error);
        onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [url, onSuccess, onError]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [execute, immediate]);

  return { data, loading, error, execute, refetch: execute };
}

export function useMutate<TData, TResponse>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (url: string, data?: TData, method: 'post' | 'put' | 'delete' = 'post') => {
    setLoading(true);
    setError(null);

    try {
      let response;
      if (method === 'post') {
        response = await apiClient.post<ApiResponse<TResponse>>(url, data);
      } else if (method === 'put') {
        response = await apiClient.put<ApiResponse<TResponse>>(url, data);
      } else {
        response = await apiClient.delete<ApiResponse<TResponse>>(url);
      }
      return response.data.data;
    } catch (err: unknown) {
      const error = new Error(err instanceof Error ? err.message : 'Operation failed');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, mutate };
}
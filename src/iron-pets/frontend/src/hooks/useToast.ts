'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: Toast['variant'];
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions | string) => {
    const toastOptions: ToastOptions = typeof options === 'string'
      ? { title: options, variant: 'info' }
      : options;

    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      title: toastOptions.title,
      description: toastOptions.description,
      variant: toastOptions.variant || 'info',
      duration: toastOptions.duration || 3000,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, newToast.duration);

    return newToast.id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((title: string, description?: string, duration?: number) => {
    return toast({ title, description, variant: 'success', duration });
  }, [toast]);

  const error = useCallback((title: string, description?: string, duration?: number) => {
    return toast({ title, description, variant: 'error', duration });
  }, [toast]);

  const warning = useCallback((title: string, description?: string, duration?: number) => {
    return toast({ title, description, variant: 'warning', duration });
  }, [toast]);

  const info = useCallback((title: string, description?: string, duration?: number) => {
    return toast({ title, description, variant: 'info', duration });
  }, [toast]);

  return {
    toasts,
    toast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

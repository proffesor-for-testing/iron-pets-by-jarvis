import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastOptions {
  message: string;
  type?: Toast['type'];
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions | string) => {
    const toastOptions: ToastOptions = typeof options === 'string'
      ? { message: options, type: 'info' }
      : options;

    const newToast: Toast = {
      id: Math.random().toString(36).substring(2, 9),
      message: toastOptions.message,
      type: toastOptions.type || 'info',
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

  const success = useCallback((message: string, duration?: number) => {
    return toast({ message, type: 'success', duration });
  }, [toast]);

  const error = useCallback((message: string, duration?: number) => {
    return toast({ message, type: 'error', duration });
  }, [toast]);

  const warning = useCallback((message: string, duration?: number) => {
    return toast({ message, type: 'warning', duration });
  }, [toast]);

  const info = useCallback((message: string, duration?: number) => {
    return toast({ message, type: 'info', duration });
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

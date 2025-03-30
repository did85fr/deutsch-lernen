import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  description?: string;
  duration?: number;
  variant?: 'default' | 'destructive';
}

interface Toast extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismissToast: (id: string) => void;
  toasts: Toast[];
}

export function useToast(): ToastContextValue {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      title: options.title,
      description: options.description,
      duration: options.duration || 3000,
      variant: options.variant || 'default',
    };

    setToasts((currentToasts) => [...currentToasts, newToast]);

    setTimeout(() => {
      setToasts((currentToasts) =>
        currentToasts.filter((toast) => toast.id !== id)
      );
    }, newToast.duration);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) =>
      currentToasts.filter((toast) => toast.id !== id)
    );
  }, []);

  return {
    toast,
    dismissToast,
    toasts,
  };
} 
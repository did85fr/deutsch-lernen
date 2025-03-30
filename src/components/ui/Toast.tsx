import React from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  onClose: () => void;
}

export function Toast({ title, description, variant = 'default', onClose }: ToastProps) {
  const baseClasses = "fixed bottom-4 right-4 p-4 rounded-lg shadow-lg max-w-sm animate-slide-in";
  const variantClasses = variant === 'destructive' 
    ? "bg-red-50 text-red-900 border border-red-200" 
    : "bg-white text-gray-900 border border-gray-200";

  return (
    <div className={`${baseClasses} ${variantClasses}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1">
          {title && (
            <h3 className="font-medium text-sm">{title}</h3>
          )}
          {description && (
            <p className="text-sm mt-1 text-gray-600">{description}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 
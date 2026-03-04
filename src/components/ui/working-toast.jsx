import React, { useState, useCallback } from 'react';
import { X } from 'lucide-react';

let toastState = {
  toasts: [],
  listeners: []
};

function notifyListeners() {
  toastState.listeners.forEach(listener => listener([...toastState.toasts]));
}

function addToast(toast) {
  const id = Date.now().toString();
  const newToast = { ...toast, id };
  toastState.toasts = [newToast, ...toastState.toasts];
  notifyListeners();
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id);
  }, 5000);
  
  return id;
}

function removeToast(id) {
  toastState.toasts = toastState.toasts.filter(t => t.id !== id);
  notifyListeners();
}

export function useToast() {
  const [toasts, setToasts] = useState([]);

  React.useEffect(() => {
    setToasts(toastState.toasts);
    toastState.listeners.push(setToasts);
    
    return () => {
      toastState.listeners = toastState.listeners.filter(l => l !== setToasts);
    };
  }, []);

  return {
    toasts,
    toast: (props) => ({ id: addToast(props) }),
    dismiss: removeToast
  };
}

export function Toast({ title, description, variant, onClose }) {
  const bgColor = variant === 'destructive' ? 'bg-red-500 text-white' : 'bg-gray-800 text-white';
  
  return (
    <div className={`${bgColor} rounded-lg shadow-lg p-4 mb-2 flex items-start justify-between min-w-[300px] max-w-md`}>
      <div className="flex-1">
        {title && <div className="font-semibold mb-1">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      <button
        onClick={onClose}
        className="ml-4 p-1 hover:bg-black/20 rounded transition-colors"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}

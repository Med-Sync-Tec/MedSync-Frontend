import React, { useEffect, useState } from 'react';

interface AlertProps {
  type: 'error' | 'success';
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const [show, setShow] = useState(true);
  const isError = type === 'error';

  useEffect(() => {
    // Ocultar alerta después de 5 segundos para que no estorbe
    const timer = setTimeout(() => {
      setShow(false);
      if(onClose) onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!show) return null;
  
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-8 lg:top-8 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium shadow-2xl transition-all duration-300 transform hover:scale-105 w-[90%] max-w-sm border backdrop-blur-md ${
      isError 
        ? 'bg-red-50/95 text-red-600 border-red-200 dark:bg-red-950/90 dark:border-red-900/80 dark:text-red-300' 
        : 'bg-green-50/95 text-green-700 border-green-200 dark:bg-green-950/90 dark:border-green-900/80 dark:text-green-300'
    }`}>
      <span className="material-symbols-outlined text-2xl shrink-0">
        {isError ? 'error' : 'check_circle'}
      </span>
      <p className="flex-1">{message}</p>
      <button 
        type="button" 
        onClick={() => { setShow(false); if(onClose) onClose(); }} 
        className="opacity-60 hover:opacity-100 transition-opacity p-1"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  );
};

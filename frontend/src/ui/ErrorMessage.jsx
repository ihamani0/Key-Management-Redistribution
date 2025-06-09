import React from 'react';
import { AlertCircle } from 'lucide-react';

const ErrorMessage = ({ message }) => {
  if (!message) return null;

  return (
    <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400 flex items-start gap-2" role="alert">
      <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
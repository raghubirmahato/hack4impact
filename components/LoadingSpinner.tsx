
import React from 'react';

const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' }> = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 rounded-full bg-current animate-bounce"></div>
    </div>
  );
};

export default LoadingSpinner;

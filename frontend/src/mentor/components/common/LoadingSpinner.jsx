import React from 'react';
import { COLORS } from '../../utils/constants.js';

const LoadingSpinner = ({ 
  size = 'md', 
  color = COLORS.PRIMARY, 
  text = 'Loading...', 
  fullScreen = false,
  className = '' 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-4 h-4';
      case 'lg':
        return 'w-12 h-12';
      case 'xl':
        return 'w-16 h-16';
      default:
        return 'w-8 h-8';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      default:
        return 'text-sm';
    }
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      <div 
        className={`animate-spin rounded-full border-2 border-transparent ${getSizeClasses()}`}
        style={{ 
          borderTopColor: color,
          borderRightColor: color,
        }}
      ></div>
      {text && (
        <p className={`text-gray-600 font-medium ${getTextSize()}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

// Alternative spinner variants
export const InlineSpinner = ({ size = 16, color = COLORS.PRIMARY, className = '' }) => (
  <div 
    className={`inline-block animate-spin rounded-full border-2 border-transparent ${className}`}
    style={{ 
      width: size,
      height: size,
      borderTopColor: color,
      borderRightColor: color,
    }}
  ></div>
);

export const ButtonSpinner = ({ size = 16, color = 'white' }) => (
  <InlineSpinner size={size} color={color} />
);

export const CardSpinner = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center h-32">
    <LoadingSpinner size="md" text={text} />
  </div>
);

export const PageSpinner = ({ text = 'Loading page...' }) => (
  <div className="flex items-center justify-center h-64">
    <LoadingSpinner size="lg" text={text} />
  </div>
);

export default LoadingSpinner; 
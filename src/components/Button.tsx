import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline'; // Example variants
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseStyle = 'font-semibold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50';
  let variantStyle = '';

  switch (variant) {
    case 'primary':
      variantStyle = 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400';
      break;
    case 'secondary':
      variantStyle = 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-400';
      break;
    case 'danger':
      variantStyle = 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-400';
      break;
    case 'outline':
      variantStyle = 'border border-emerald-500 text-emerald-500 hover:bg-emerald-50 focus:ring-emerald-400';
      break;
    default:
      variantStyle = 'bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-emerald-400';
  }

  return (
    <button
      type="button" // Default to type="button" to prevent accidental form submissions
      className={`${baseStyle} ${variantStyle} ${className || ''}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

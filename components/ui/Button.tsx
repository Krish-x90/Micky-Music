import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  active?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  active = false,
  className = '', 
  ...props 
}) => {
  const baseStyles = "transition-all duration-300 rounded-full font-medium flex items-center justify-center outline-none focus:ring-2 focus:ring-purple-500/50";
  
  const variants = {
    primary: "bg-primary hover:bg-primary-dark text-white px-6 py-2 shadow-neon hover:shadow-neon-hover",
    secondary: "bg-white/10 hover:bg-white/20 text-white px-6 py-2 backdrop-blur-sm",
    ghost: "bg-transparent hover:bg-white/5 text-gray-300 hover:text-white px-4 py-2",
    icon: "p-2 hover:text-primary text-gray-400 hover:bg-white/5 rounded-full aspect-square",
  };

  const activeStyle = active ? "text-primary shadow-neon bg-white/10" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${activeStyle} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
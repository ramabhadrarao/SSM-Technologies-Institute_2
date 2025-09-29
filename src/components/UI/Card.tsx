import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  const hoverClasses = hover ? 'hover:shadow-xl hover:-translate-y-1' : '';
  
  return (
    <div className={`bg-white rounded-xl shadow-lg transition-all duration-300 ${hoverClasses} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
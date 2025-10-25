import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ className = '', children }) => (
  <div className={`card ${className}`}>
    {children}
  </div>
);

import React from 'react';
import { cn } from '@/features/landing/about/lib/utils';

// Definir los tipos de variantes
type CardVariant = 'default' | 'elevated' | 'bordered';

// Interfaz para las props
interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  variant = "default", 
  className = "" 
}) => {
  const variants: Record<CardVariant, string> = {
    default: "card",
    elevated: "card shadow-lg hover:shadow-xl transition-shadow duration-200",
    bordered: "bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-rojo-primario transition-colors duration-200"
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};

export default Card;

// Alternativa: Si prefieres sin interfaz separada
/*
const Card = ({ 
  children, 
  variant = "default", 
  className = "" 
}: {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
  className?: string;
}) => {
  const variants = {
    default: "card",
    elevated: "card shadow-lg hover:shadow-xl transition-shadow duration-200",
    bordered: "bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-rojo-primario transition-colors duration-200"
  } as const;

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
};
*/
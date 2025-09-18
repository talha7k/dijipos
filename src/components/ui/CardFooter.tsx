import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('border-t p-4 bg-card', className)}>
      {children}
    </div>
  );
}
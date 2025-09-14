import React from 'react';

export interface OrderItemDisplayProps {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
  notes?: string;
  className?: string;
  onClick?: () => void;
  showNotes?: boolean;
}

export function OrderItemDisplay({
  name,
  unitPrice,
  quantity,
  total,
  notes,
  className = '',
  onClick,
  showNotes = true,
}: OrderItemDisplayProps) {
  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-4 p-3 border rounded bg-card transition-colors ${
        onClick ? 'cursor-pointer hover:bg-muted/50' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="min-w-0">
        <div className="font-medium text-foreground break-words">{name}</div>
        <div className="text-sm text-muted-foreground">
          ${unitPrice.toFixed(2)} × {quantity}
        </div>
        {showNotes && notes && (
          <div className="text-xs text-muted-foreground mt-1 break-words">
            {notes}
          </div>
        )}
      </div>
      <div className="font-medium text-foreground text-right whitespace-nowrap">
        ${total.toFixed(2)}
      </div>
    </div>
  );
}
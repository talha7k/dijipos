import React from "react";
import { useCurrency } from "@/lib/hooks/useCurrency";
import { cn } from "@/lib/utils";

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
  className = "",
  onClick,
  showNotes = true,
}: OrderItemDisplayProps) {
  const { formatCurrency } = useCurrency();

  const wordCount = name.trim().split(/\s+/).length;
  const isLongName = wordCount > 3;

  return (
    <div
      className={`grid grid-cols-[1fr_auto] gap-3 p-2 border rounded bg-card transition-colors ${
        onClick ? "cursor-pointer hover:bg-muted/50" : ""
      } ${className}`}
      onClick={onClick}
    >
      <div className="min-w-0 flex-shrink-1">
        <div
          className={cn(
            "font-medium text-foreground break-words line-clamp-2",
            isLongName && "text-xs",
          )}
        >
          {name}
        </div>
        <div className="text-sm text-muted-foreground whitespace-nowrap">
          {formatCurrency(unitPrice)} × {quantity}
        </div>
        {showNotes && notes && (
          <div className="text-xs text-muted-foreground mt-1 break-words line-clamp-2">
            {notes}
          </div>
        )}
      </div>
      <div className="font-medium text-foreground text-right whitespace-nowrap">
        {formatCurrency(total)}
      </div>
    </div>
  );
}

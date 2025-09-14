'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { OrderItem } from '@/types';

interface OrderItemListProps {
  items: OrderItem[];
  className?: string;
}

export function OrderItemList({ items, className = '' }: OrderItemListProps) {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Order Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-2 border rounded">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${item.unitPrice.toFixed(2)} × {item.quantity}
                </div>
                {item.notes && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {item.notes}
                  </div>
                )}
              </div>
              <div className="font-medium">${item.total.toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-lg font-bold">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
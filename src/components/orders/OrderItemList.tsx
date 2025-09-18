"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";
import { CartItem } from "@/types";
import { OrderItemDisplay } from "./OrderItemDisplay";

interface OrderItemListProps {
  items: CartItem[];
  className?: string;
}

export function OrderItemList({ items, className = "" }: OrderItemListProps) {
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
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <OrderItemDisplay
              key={item.id}
              id={item.id}
              name={item.name}
              unitPrice={item.unitPrice}
              quantity={item.quantity}
              total={item.total}
              notes={item.notes}
            />
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

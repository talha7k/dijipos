'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

export default function OrderDetails() {
  const { currentOrder, products, removeFromOrder, clearOrder, completeOrder } =
    useAppStore();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const { toast } = useToast();

  const orderItems = currentOrder.map((item) => {
    const product = products.find((p) => p.id === item.product_id);
    return { ...item, name_en: product?.name_en, price: product?.price };
  });

  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  const handleCompleteOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Cannot complete an empty order.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerName || !customerPhone) {
      toast({
        title: 'Error',
        description: 'Please provide customer name and phone number.',
        variant: 'destructive',
      });
      return;
    }

    completeOrder({
      items: currentOrder,
      discount: 0,
      tax,
      restaurant_id: 1,
      status: 'pending',
    });

    toast({
      title: 'Order Completed',
      description: 'The order has been successfully processed.',
    });

    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        {orderItems.length === 0 ? (
          <p>No items in the order.</p>
        ) : (
          <div className="space-y-4">
            {orderItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="flex justify-between items-center p-4">
                  <div>
                    <h4 className="font-semibold">{item.name_en}</h4>
                    <p>Qty: {item.quantity}</p>
                    <p>${((item.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => removeFromOrder(item.id)}
                  >
                    Remove
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <div className="mt-4 space-y-2">
          <p>Subtotal: ${subtotal.toFixed(2)}</p>
          <p>Tax: ${tax.toFixed(2)}</p>
          <p className="font-bold">Total: ${total.toFixed(2)}</p>
        </div>
        <div className="mt-4 space-y-2">
          <Input
            placeholder="Customer Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
          <Input
            placeholder="Customer Phone"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
          />
        </div>
        <div className="mt-4 space-x-2">
          <Button
            onClick={handleCompleteOrder}
            disabled={orderItems.length === 0}
          >
            Complete Order
          </Button>
          <Button
            variant="outline"
            onClick={clearOrder}
            disabled={orderItems.length === 0}
          >
            Clear Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

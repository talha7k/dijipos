"use client"

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

export default function RecentOrders() {
  const { orders, products, updateOrderStatus } = useAppStore();

  const getProductNames = (items) => {
    return items.slice(0, 5).map(item => {
      const product = products.find(p => p.id === item.productId);
      return product ? product.name : 'Unknown Product';
    }).join(', ');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map((order) => (
          <Card key={order.id} className="mb-4">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">Order #{order.id}</h3>
                  <p>{getProductNames(order.items)}{order.items.length > 5 ? '...' : ''}</p>
                  <p>Total: ${order.total.toFixed(2)}</p>
                  <p>Placed: {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}</p>
                  <p>Status: {order.status}</p>
                </div>
                <div className="space-y-2">
                  <Button size="sm" onClick={() => console.log('Edit order', order.id)}>Edit</Button>
                  <Button
                    size="sm"
                    variant={order.status === 'pending' ? 'default' : 'outline'}
                    onClick={() => updateOrderStatus(order.id, order.status === 'pending' ? 'completed' : 'pending')}
                  >
                    {order.status === 'pending' ? 'Mark Complete' : 'Mark Pending'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle, XCircle, Save } from 'lucide-react';
import { Order } from '@/types';

interface POSOrderGridProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  onPaymentClick: (order: Order) => void;
  onBack: () => void;
}

export function POSOrderGrid({ orders, onOrderSelect, onPaymentClick, onBack }: POSOrderGridProps) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'open':
        return 'bg-yellow-500';
      case 'completed':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      case 'saved':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      case 'saved':
        return <Save className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (selectedOrder) {
    return (
      <div className="flex-1 overflow-auto p-4 bg-background">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <h2 className="text-2xl font-bold">Order #{selectedOrder.orderNumber}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                  {getStatusIcon(selectedOrder.status)}
                  <span className="ml-1 capitalize">{selectedOrder.status}</span>
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Customer:</span>
                <span>{selectedOrder.customerName || 'Walk-in'}</span>
              </div>
              <div className="flex justify-between">
                <span>Table:</span>
                <span>{selectedOrder.tableName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Type:</span>
                <span className="capitalize">{selectedOrder.orderType}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{selectedOrder.createdAt.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${item.unitPrice.toFixed(2)} × {item.quantity}
                      </div>
                    </div>
                    <div className="font-medium">${item.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex gap-4">
          <Button
            onClick={() => onOrderSelect(selectedOrder)}
            className="flex-1"
            variant="outline"
          >
            Reopen Order
          </Button>
          <Button
            onClick={() => onPaymentClick(selectedOrder)}
            className="flex-1"
          >
            Process Payment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-4 bg-background">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Items
        </Button>
        <h2 className="text-2xl font-bold">Open Orders</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
          <p>No open orders found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card
              key={order.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200"
              onClick={() => setSelectedOrder(order)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Customer:</span>
                  <span>{order.customerName || 'Walk-in'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Table:</span>
                  <span>{order.tableName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Items:</span>
                  <span>{order.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total:</span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created:</span>
                  <span>{order.createdAt.toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
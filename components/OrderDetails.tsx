'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderItem, TaxRate, OrderType, Product, Customer } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order }) => {
  const { 
    products,
    taxRates,
    orderTypes,
    currentUser,
    customers,
    addOrder, 
    addToOrder,
    removeFromOrder, 
    clearOrder,
  } = useAppStore();

  const { toast } = useToast();

  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate>(Object);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType>(Object);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(Object);

  useEffect(() => {

  }, [taxRates, orderTypes, customers]);

  const orderItems = order.items.map((item) => {
    const product = products.find((p) => p.id === item.product.id);
    return { ...item, name: product?.name_en, price: product?.price };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const taxRate = taxRates.find((rate: TaxRate) => rate.id === selectedTaxRate.id)?.percentage || 0;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleRemoveFromOrder = (id: string) => {
    removeFromOrder(id);
  };

  const handleAddToOrder = (product: Product) => {
    const orderItem: Omit<OrderItem, 'id' > = {
      product: product,
      quantity: 1,
      order_id: 0,
      price: product.price,
      name: product.name_en,
      created_at: new Date()
    };
    addToOrder(orderItem);
  };

  const handlePlaceOrder = () => {
    if (orderItems.length === 0) {
      toast({
        title: "Error",
        description: "Cannot place an empty order.",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTaxRate || !selectedOrderType) {
      toast({
        title: "Error",
        description: "Please select a tax rate and order type.",
        variant: "destructive",
      });
      return;
    }

    const selectedCustomerObj = customers.find((c) => c.id === selectedCustomer.id);

    const newOrder: Omit<Order, 'id' | 'created_at' | 'created_by'> = {
      items: orderItems,
      customer: customer,
      status_order: 'waiting',
      total_amount: total,
      tax_rate: taxRates.find((rate) => rate.id === selectedTaxRate.id)!,
      order_type: orderTypes.find((type) => type.id === selectedOrderType.id)!,
      payment_status: 'unpaid',
      discount_type: 'none',
      discount_amount: 0,
      tax_amount: tax,
    };

    addOrder(newOrder);
    clearOrder();
    toast({
      title: "Success",
      description: "Order placed successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedTaxRate} onValueChange={setSelectedTaxRate}>
            <SelectTrigger>
              <SelectValue placeholder="Select Tax Rate" />
            </SelectTrigger>
            <SelectContent>
              {taxRates.map((rate) => (
                <SelectItem key={rate.id} value={rate.id}>{rate.name} ({rate.percentage * 100}%)</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedOrderType} onValueChange={setSelectedOrderType}>
            <SelectTrigger>
              <SelectValue placeholder="Select Order Type" />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
            <SelectTrigger>
              <SelectValue placeholder="Select Customer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Unassigned</SelectItem>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!selectedCustomer && (
            <>
              <Input
                placeholder="New Customer Name"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
              <Input
                placeholder="New Customer Phone"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
              />
            </>
          )}
          <div>
            <h3 className="text-lg font-semibold mb-2">Order Items</h3>
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center mb-2">
                <span>{item.name} (x{item.quantity})</span>
                <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                <Button variant="destructive" onClick={() => handleRemoveFromOrder(item.id)}>Remove</Button>
              </div>
            ))}
          </div>
          <div>
            <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
            <p><strong>Tax ({taxRate * 100}%):</strong> ${tax.toFixed(2)}</p>
            <p><strong>Total:</strong> ${total.toFixed(2)}</p>
          </div>
          <div className="flex justify-between">
            <Button variant="outline" onClick={clearOrder} disabled={orderItems.length === 0}>
              Clear Order
            </Button>
            <Button onClick={handlePlaceOrder} disabled={orderItems.length === 0}>
              Place Order
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderDetails;

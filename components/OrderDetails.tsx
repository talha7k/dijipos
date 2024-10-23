'use client';

import React, { useState, useEffect } from 'react';
import { Order, OrderItem, TaxRate, OrderType, Product, Customer } from '../lib/types';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import CustomerModal from './modals/CustomerModal';

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
    addCustomer,
    fetchCustomers
  } = useAppStore();

  const { toast } = useToast();

  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);
  const [selectedOrderType, setSelectedOrderType] = useState<OrderType | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  useEffect(() => {
    // Fetch data if needed
  }, [taxRates, orderTypes, customers]);

  const orderItems = order.items.map((item) => {
    const product = products.find((p) => p.id === item.product.id);
    return { ...item, name: product?.name_en, price: product?.price };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
  const taxRatePercentage = taxRates?.find((rate) => rate.id === selectedTaxRate?.id)?.percentage || 0;
  const tax = subtotal * taxRatePercentage;
  const total = subtotal + tax;

  const handleRemoveFromOrder = (id: string) => {
    removeFromOrder(id);
  };

  const handleAddToOrder = (product: Product) => {
    const newItemId = Date.now().toString(); // Use timestamp for ID
    const orderItem: OrderItem = {
      id: newItemId,
      product: product,
      quantity: 1,
      order_id: '0',
      price: product.price,
      name: product.name_en,
    };
    addToOrder(orderItem);
  };

  const handlePlaceOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Cannot place an empty order.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedTaxRate || !selectedOrderType) {
      toast({
        title: 'Error',
        description: 'Please select a tax rate and order type.',
        variant: 'destructive',
      });
      return;
    }

    const newOrder: Omit<Order, 'created_at' | 'created_by' | 'id'> = {
      items: orderItems,
      customer: selectedCustomer,
      status_order: 'waiting',
      total_amount: total,
      tax_rate: selectedTaxRate,
      order_type: selectedOrderType,
      payment_status: 'unpaid',
      // discount_type: selectedDiscountType,
      discount_amount: 0,
      tax_amount: tax,
    };

    await addOrder(newOrder);
    clearOrder();
    toast({
      title: 'Success',
      description: 'Order placed successfully.',
    });
  };


  const handleUpdateCustomer = (newCustomer: Customer) => {
    setSelectedCustomer(newCustomer);
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <Select value={selectedTaxRate} onValueChange={setSelectedTaxRate}>
              <SelectTrigger>
                <SelectValue placeholder='Select Tax Rate' />
              </SelectTrigger>
              <SelectContent>
                {taxRates?.map((rate) => (
                  <SelectItem key={rate.id} value={rate}>{rate.name} ({rate.percentage * 100}%)</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedOrderType} onValueChange={setSelectedOrderType}>
              <SelectTrigger>
                <SelectValue placeholder='Select Order Type' />
              </SelectTrigger>
              <SelectContent>
                {orderTypes?.map((type) => (
                  <SelectItem key={type.id} value={type}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger>
                <SelectValue placeholder='Select Customer' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Unassigned</SelectItem>
                {customers?.map((customer) => (
                  <SelectItem key={customer.id} value={customer}>{customer.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsCustomerModalOpen(true)}>Create New Customer</Button>
            <div>
              <h3 className='text-lg font-semibold mb-2'>Order Items</h3>
              {orderItems.map((item) => (
                <div key={item.id} className='flex justify-between items-center mb-2'>
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${((item.price || 0) * item.quantity).toFixed(2)}</span>
                  <Button variant='destructive' onClick={() => handleRemoveFromOrder(item.id)}>Remove</Button>
                </div>
              ))}
            </div>
            <div>
              <p><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
              <p><strong>Tax ({taxRatePercentage * 100}%):</strong> ${tax.toFixed(2)}</p>
              <p><strong>Total:</strong> ${total.toFixed(2)}</p>
            </div>
            <div className='flex justify-between'>
              <Button variant='outline' onClick={clearOrder} disabled={orderItems.length === 0}>
                Clear Order
              </Button>
              <Button onClick={handlePlaceOrder} disabled={orderItems.length === 0}>
                Place Order
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <CustomerModal open={isCustomerModalOpen} onClose={() => setIsCustomerModalOpen(false)} onSave={handleUpdateCustomer} />
    </div>
  );
};

export default OrderDetails;

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import ItemList from '@/components/orders/ItemList';
import ClientInfo from '@/components/invoices_quotes/ClientInfo';
import FormSummary from '@/components/invoices_quotes/FormSummary';
import { Quote, Item, ItemType } from '@/types';
import {
  sampleProductsServices,
  getProductOptionsFromMixed,
  getServiceOptionsFromMixed,
  getProductServiceById
} from '@/lib/sample-data';

interface QuoteFormProps {
  onSubmit: (quote: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
}

export default function QuoteForm({ onSubmit }: QuoteFormProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [taxRate, setTaxRate] = useState(0);
  const [notes, setNotes] = useState('');


  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      type: ItemType.PRODUCT,
      name: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    }]);
  };

  const addItemFromCatalog = (itemId: string) => {
    const catalogItem = getProductServiceById(sampleProductsServices, itemId);
    if (catalogItem) {
      setItems([...items, {
        id: Date.now().toString(),
        type: catalogItem.type as ItemType,
        productId: catalogItem.type === 'product' ? catalogItem.id : undefined,
        serviceId: catalogItem.type === 'service' ? catalogItem.id : undefined,
        name: catalogItem.name,
        description: catalogItem.description || '',
        quantity: 1,
        unitPrice: catalogItem.price,
        total: catalogItem.price,
      }]);
    }
  };

  const updateItem = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      clientName,
      clientEmail,
      clientAddress,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft',
      notes,
    } as Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ClientInfo
        selectedCustomerId={selectedCustomerId}
        clientName={clientName}
        clientEmail={clientEmail}
        clientAddress={clientAddress}
        onCustomerSelect={setSelectedCustomerId}
        onClientNameChange={setClientName}
        onClientEmailChange={setClientEmail}
        onClientAddressChange={setClientAddress}
      />

      <div>
        <div className="flex justify-between items-center mb-4">
          <Label>Items</Label>
          <Button type="button" onClick={addItem} variant="outline">Add Custom Item</Button>
        </div>

        {/* Add item from catalog */}
        <div className="mb-4 space-y-2">
          <Label className="text-sm text-muted-foreground">Add from catalog:</Label>
          <div className="grid grid-cols-2 gap-2">
            <Combobox
              options={getProductOptionsFromMixed(sampleProductsServices)}
              value=""
              onValueChange={(value) => {
                addItemFromCatalog(value);
              }}
              placeholder="Select product..."
              searchPlaceholder="Search products..."
              emptyMessage="No products found."
              buttonWidth="w-full"
            />
            <Combobox
              options={getServiceOptionsFromMixed(sampleProductsServices)}
              value=""
              onValueChange={(value) => {
                addItemFromCatalog(value);
              }}
              placeholder="Select service..."
              searchPlaceholder="Search services..."
              emptyMessage="No services found."
              buttonWidth="w-full"
            />
          </div>
        </div>

        <ItemList
          items={items}
          mode="editable"
          onUpdate={updateItem}
          onRemove={removeItem}
        />
      </div>

      <FormSummary
        subtotal={subtotal}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        onTaxRateChange={setTaxRate}
        mode="quote"
      />

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit">Create Quote</Button>
    </form>
  );
}
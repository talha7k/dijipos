'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import ItemList from '@/components/pos/ItemList';
import ClientInfo from '@/components/invoices_quotes/ClientInfo';
import SupplierInfo from '@/components/invoices_quotes/SupplierInfo';
import FormSummary from '@/components/invoices_quotes/FormSummary';
import { Invoice, Item, ItemType, InvoiceType, InvoiceItem } from '@/types';
import { InvoiceTemplateType } from '@/types/enums';
import {
  sampleProductsServices,
  getProductOptionsFromMixed,
  getServiceOptionsFromMixed,
  getProductServiceById
} from '@/lib/sample-data';

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSubmit: (invoice: Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => void;
  defaultType?: 'sales' | 'purchase';
}

export default function InvoiceForm({ invoice, onSubmit, defaultType = 'sales' }: InvoiceFormProps) {
  const [invoiceType, setInvoiceType] = useState<'sales' | 'purchase'>(invoice?.type || defaultType);

  // Client fields (for sales invoices)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [clientName, setClientName] = useState(invoice?.type === 'sales' ? invoice.clientName : '');
  const [clientEmail, setClientEmail] = useState(invoice?.type === 'sales' ? invoice.clientEmail : '');
  const [clientAddress, setClientAddress] = useState(invoice?.type === 'sales' ? invoice.clientAddress || '' : '');
  const [clientVAT, setClientVAT] = useState<string>('');

  // Supplier fields (for purchase invoices)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [supplierName, setSupplierName] = useState(invoice?.type === 'purchase' ? invoice.supplierName : '');
  const [supplierEmail, setSupplierEmail] = useState(invoice?.type === 'purchase' ? invoice.supplierEmail : '');
  const [supplierAddress, setSupplierAddress] = useState(invoice?.type === 'purchase' ? invoice.supplierAddress || '' : '');
  const [supplierVAT, setSupplierVAT] = useState<string>(invoice?.type === 'purchase' ? invoice.supplierVAT || '' : '');

  // Purchase invoice specific fields
  const [invoiceNumber, setInvoiceNumber] = useState(invoice?.type === 'purchase' ? invoice.invoiceNumber || '' : '');
  const [invoiceDate, setInvoiceDate] = useState(() => {
    if (invoice?.type === 'purchase' && invoice.invoiceDate) {
      return new Date(invoice.invoiceDate).toISOString().split('T')[0];
    }
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  const [items, setItems] = useState<InvoiceItem[]>(invoice?.items || []);
  const [taxRate, setTaxRate] = useState(invoice?.taxRate || 0);
  const [notes, setNotes] = useState(invoice?.notes || '');
  const [dueDate, setDueDate] = useState(() => {
    if (invoice?.dueDate) {
      return new Date(invoice.dueDate).toISOString().split('T')[0];
    }
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split('T')[0];
  });


  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      itemType: ItemType.PRODUCT,
      itemId: '',
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
        itemType: catalogItem.itemType,
        itemId: catalogItem.id,
        name: catalogItem.name,
        description: catalogItem.description || '',
        quantity: 1,
        unitPrice: catalogItem.price,
        total: catalogItem.price,
      }]);
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
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
    const baseInvoice = {
      type: invoiceType,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: 'draft' as const,
      dueDate: new Date(dueDate),
      notes,
      template: InvoiceTemplateType.ENGLISH,
      includeQR: false,
    };

    if (invoiceType === InvoiceType.SALES) {
      onSubmit({
        ...baseInvoice,
        clientName,
        clientEmail,
        clientAddress,
        clientVAT,
      } as Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>);
    } else {
      onSubmit({
        ...baseInvoice,
        supplierId: selectedSupplierId,
        supplierName,
        supplierEmail,
        supplierAddress,
        supplierVAT,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
      } as Omit<Invoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="invoice-type">Invoice Type</Label>
        <Select value={invoiceType} onValueChange={(value: 'sales' | 'purchase') => setInvoiceType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select invoice type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sales">Sales Invoice</SelectItem>
            <SelectItem value="purchase">Purchase Invoice</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {invoiceType === InvoiceType.SALES ? (
        <ClientInfo
          selectedCustomerId={selectedCustomerId}
          clientName={clientName}
          clientEmail={clientEmail}
          clientAddress={clientAddress}
          clientVAT={clientVAT}
          showVAT={true}
          onCustomerSelect={setSelectedCustomerId}
          onClientNameChange={setClientName}
          onClientEmailChange={setClientEmail}
          onClientAddressChange={setClientAddress}
          onClientVATChange={setClientVAT}
        />
      ) : (
        <>
          <SupplierInfo
            selectedSupplierId={selectedSupplierId}
            supplierName={supplierName}
            supplierEmail={supplierEmail}
            supplierAddress={supplierAddress}
            supplierVAT={supplierVAT}
            showVAT={true}
            onSupplierSelect={setSelectedSupplierId}
            onSupplierNameChange={setSupplierName}
            onSupplierEmailChange={setSupplierEmail}
            onSupplierAddressChange={setSupplierAddress}
            onSupplierVATChange={setSupplierVAT}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input
                id="invoice-number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Supplier invoice number"
              />
            </div>
            <div>
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>
        </>
      )}

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
        <Button type="button" onClick={addItem} className="mt-2">Add Custom Item</Button>
      </div>

      <FormSummary
        subtotal={subtotal}
        taxRate={taxRate}
        taxAmount={taxAmount}
        total={total}
        dueDate={dueDate}
        showDueDate={true}
        onTaxRateChange={setTaxRate}
        onDueDateChange={setDueDate}
        mode="invoice"
      />

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Input
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button type="submit">{invoice ? "Update Invoice" : "Create Invoice"}</Button>
    </form>
  );
}
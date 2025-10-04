"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Combobox } from "@/components/ui/combobox";
import ItemList from "@/components/pos/ItemList";
import ClientInfo from "@/components/invoices_quotes/ClientInfo";
import SupplierInfo from "@/components/invoices_quotes/SupplierInfo";
import FormSummary from "@/components/invoices_quotes/FormSummary";
import {
  Invoice,
  Item as ItemTypeType,
  Item,
  ItemType,
  InvoiceType,
  InvoiceItem,
  ProductTransactionType,
} from "@/types";
import { InvoiceTemplateType } from "@/types/enums";
import { useCustomers } from "@/lib/hooks/useCustomers";
import { useSuppliers } from "@/lib/hooks/useSuppliers";
import { useItems } from "@/lib/hooks/useItems";
import { useCategories } from "@/lib/hooks/useCategories";
import { AddProductDialog } from "@/components/products_services/AddProductDialog";
import { AddServiceDialog } from "@/components/products_services/AddServiceDialog";
import { AddCustomerDialog } from "@/components/pos/AddCustomerDialog";
import { AddSupplierDialog } from "@/components/pos/AddSupplierDialog";
import { Plus } from "lucide-react";

interface InvoiceFormProps {
  invoice?: Invoice | null;
  onSubmit: (
    invoice: Omit<Invoice, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => void;
  defaultType?: "sales" | "purchase";
}

export default function InvoiceForm({
  invoice,
  onSubmit,
  defaultType = "sales",
}: InvoiceFormProps) {
  const [invoiceType, setInvoiceType] = useState<"sales" | "purchase">(
    invoice?.type || defaultType,
  );

  // Real data hooks
  const { customers, createCustomer } = useCustomers();
  const { suppliers } = useSuppliers();
  const { items, createItem } = useItems();
  const { categories } = useCategories();

  // Dialog states
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);

  // Client fields (for sales invoices)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [clientName, setClientName] = useState(
    invoice?.type === "sales" ? invoice.clientName : "",
  );
  const [clientEmail, setClientEmail] = useState(
    invoice?.type === "sales" ? invoice.clientEmail : "",
  );
  const [clientAddress, setClientAddress] = useState(
    invoice?.type === "sales" ? invoice.clientAddress || "" : "",
  );
  const [clientVAT, setClientVAT] = useState<string>("");

  // Supplier fields (for purchase invoices)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [supplierName, setSupplierName] = useState(
    invoice?.type === "purchase" ? invoice.supplierName : "",
  );
  const [supplierEmail, setSupplierEmail] = useState(
    invoice?.type === "purchase" ? invoice.supplierEmail : "",
  );
  const [supplierAddress, setSupplierAddress] = useState(
    invoice?.type === "purchase" ? invoice.supplierAddress || "" : "",
  );
  const [supplierVAT, setSupplierVAT] = useState<string>(
    invoice?.type === "purchase" ? invoice.supplierVAT || "" : "",
  );

  // Purchase invoice specific fields
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.type === "purchase" ? invoice.invoiceNumber || "" : "",
  );
  const [invoiceDate, setInvoiceDate] = useState(() => {
    if (invoice?.type === "purchase" && invoice.invoiceDate) {
      return new Date(invoice.invoiceDate).toISOString().split("T")[0];
    }
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    invoice?.items || [],
  );
  const [taxRate, setTaxRate] = useState(invoice?.taxRate || 0);
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [dueDate, setDueDate] = useState(() => {
    if (invoice?.dueDate && !isNaN(new Date(invoice.dueDate).getTime())) {
      return new Date(invoice.dueDate).toISOString().split("T")[0];
    }
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split("T")[0];
  });

  const addItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      {
        id: Date.now().toString(),
        itemType: ItemType.PRODUCT,
        itemId: "",
        name: "",
        description: "",
        quantity: 1,
        unitPrice: 0,
        total: 0,
      },
    ]);
  };

  const addItemFromCatalog = (itemId: string) => {
    const catalogItem = items.find((item) => item.id === itemId);
    if (catalogItem) {
      setInvoiceItems([
        ...invoiceItems,
        {
          id: Date.now().toString(),
          itemType: catalogItem.itemType,
          itemId: catalogItem.id,
          name: catalogItem.name,
          description: catalogItem.description || "",
          quantity: 1,
          unitPrice: catalogItem.price,
          total: catalogItem.price,
        },
      ]);
    }
  };

  const updateItem = (index: number, field: keyof Item | keyof InvoiceItem, value: string | number) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "unitPrice") {
      newItems[index].total =
        newItems[index].quantity * newItems[index].unitPrice;
    }
    setInvoiceItems(newItems);
  };

  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const subtotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseInvoice = {
      type: invoiceType,
      items: invoiceItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: "draft" as const,
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
      } as Omit<Invoice, "id" | "organizationId" | "createdAt" | "updatedAt">);
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
      } as Omit<Invoice, "id" | "organizationId" | "createdAt" | "updatedAt">);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Invoice Type</Label>
          <ToggleGroup
            type="single"
            value={invoiceType}
            onValueChange={(value) => {
              if (value) setInvoiceType(value as "sales" | "purchase");
            }}
            className="justify-start"
          >
            <ToggleGroupItem value="sales" aria-label="Sales Invoice">
              Sales Invoice
            </ToggleGroupItem>
            <ToggleGroupItem value="purchase" aria-label="Purchase Invoice">
              Purchase Invoice
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {invoiceType === InvoiceType.SALES ? (
          <>
             <ClientInfo
               selectedCustomerId={selectedCustomerId}
               clientName={clientName}
               clientEmail={clientEmail}
               clientAddress={clientAddress}
               clientVAT={clientVAT}
               showVAT={true}
               customers={customers}
               onCustomerSelect={setSelectedCustomerId}
               onClientNameChange={setClientName}
               onClientEmailChange={setClientEmail}
               onClientAddressChange={setClientAddress}
               onClientVATChange={setClientVAT}
               onAddCustomer={() => setShowAddCustomerDialog(true)}
             />
          </>
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
               onAddSupplier={() => setShowAddSupplierDialog(true)}
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
          </div>

            {/* Add item from catalog */}
            <div className="mb-4 space-y-2">
              <Label className="text-sm text-muted-foreground">
                Add from catalog:
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex gap-2">
                  <Combobox
                    options={items
                      .filter((item) =>
                        item.itemType === ItemType.PRODUCT &&
                        item.transactionType === (invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE)
                      )
                      .map((item) => ({ value: item.id, label: item.name }))}
                    value=""
                    onValueChange={(value) => {
                      addItemFromCatalog(value);
                    }}
                    placeholder="Select product..."
                    searchPlaceholder="Search products..."
                    emptyMessage={`No ${invoiceType === 'sales' ? 'sale' : 'purchase'} products found.`}
                    buttonWidth="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddProductDialog(true)}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Combobox
                    options={items
                      .filter((item) =>
                        item.itemType === ItemType.SERVICE &&
                        item.transactionType === (invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE)
                      )
                      .map((item) => ({ value: item.id, label: item.name }))}
                    value=""
                    onValueChange={(value) => {
                      addItemFromCatalog(value);
                    }}
                    placeholder="Select service..."
                    searchPlaceholder="Search services..."
                    emptyMessage={`No ${invoiceType === 'sales' ? 'sale' : 'purchase'} services found.`}
                    buttonWidth="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowAddServiceDialog(true)}
                    className="shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

          <ItemList
            items={invoiceItems}
            mode="editable"
            onUpdate={updateItem}
            onRemove={removeItem}
          />
          <Button
            type="button"
            onClick={addItem}
            className="mt-2 justify-right"
          >
            Add Temporary Item
          </Button>
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

        <Button type="submit">
          {invoice ? "Update Invoice" : "Create Invoice"}
        </Button>
      </form>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={showAddProductDialog}
        onOpenChange={setShowAddProductDialog}
        onAddProduct={async (productData) => {
          try {
            await createItem(productData);
            setShowAddProductDialog(false);
          } catch (error) {
            console.error("Error creating product:", error);
          }
        }}
        onUpdateProduct={() => {}}
        productToEdit={null}
        categories={categories}
        defaultTransactionType={invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE}
      />

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={showAddServiceDialog}
        onOpenChange={setShowAddServiceDialog}
        onAddService={async (serviceData) => {
          try {
            await createItem(serviceData);
            setShowAddServiceDialog(false);
          } catch (error) {
            console.error("Error creating service:", error);
          }
        }}
        onUpdateService={() => {}}
        serviceToEdit={null}
        categories={categories}
        defaultTransactionType={invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE}
      />

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddCustomerDialog}
        onOpenChange={setShowAddCustomerDialog}
        onCustomerAdded={() => {
          // Customer list will be updated automatically via real-time hook
        }}
      />

      {/* Add Supplier Dialog */}
      <AddSupplierDialog
        open={showAddSupplierDialog}
        onOpenChange={setShowAddSupplierDialog}
        onSupplierAdded={() => {
          // Supplier list will be updated automatically via real-time hook
        }}
      />
    </>
  );
}

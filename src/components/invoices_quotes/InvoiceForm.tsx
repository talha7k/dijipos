"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";


import { Combobox } from "@/components/ui/combobox";
import ItemList from "@/components/pos/ItemList";
import ClientInfo from "@/components/invoices_quotes/ClientInfo";
import SupplierInfo from "@/components/invoices_quotes/SupplierInfo";
import FormSummary from "@/components/invoices_quotes/FormSummary";
import {
  SalesInvoice,
  PurchaseInvoice,
  ItemType,
  InvoiceType,
  ProductTransactionType,
  CategoryType,
} from "@/types";
import { InvoiceItem } from "@/types/product-service";
import { InvoiceTemplateType } from "@/types/enums";
import { useCustomers } from "@/lib/hooks/useCustomers";
import { useSuppliers } from "@/lib/hooks/useSuppliers";
import { useItems } from "@/lib/hooks/useItems";
import { useCategories } from "@/lib/hooks/useCategories";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { calculateVATExclusive, calculateVATInclusive } from "@/lib/vat-calculator";
import { AddProductDialog } from "@/components/products_services/AddProductDialog";
import { AddServiceDialog } from "@/components/products_services/AddServiceDialog";
import { AddCustomerDialog } from "@/components/pos/AddCustomerDialog";
import { AddSupplierDialog } from "@/components/pos/AddSupplierDialog";
import { Plus } from "lucide-react";

interface InvoiceFormProps {
  invoice?: SalesInvoice | PurchaseInvoice | null;
  onSubmit: (
    invoice: Omit<SalesInvoice | PurchaseInvoice, "id" | "organizationId" | "createdAt" | "updatedAt">,
  ) => void;
  defaultType?: "sales" | "purchase";
  onEditCustomer?: (invoice: SalesInvoice | PurchaseInvoice) => void;
  onEditSupplier?: (invoice: SalesInvoice | PurchaseInvoice) => void;
  onChildDialogChange?: (isOpen: boolean) => void;
}

export default function InvoiceForm({
  invoice,
  onSubmit,
  defaultType = "sales",
  onEditCustomer,
  onEditSupplier,
  onChildDialogChange,
}: InvoiceFormProps) {
  const [invoiceType, setInvoiceType] = useState<"sales" | "purchase">(
    (invoice?.type === InvoiceType.SALES ? "sales" : invoice?.type) || defaultType,
  );

  // Real data hooks
   const { customers } = useCustomers();
   const { suppliers } = useSuppliers();
   const { items, createItem } = useItems();
  const { categories, createCategory } = useCategories();
  const { storeSettings } = useStoreSettings();

  // Dialog states
  const [showAddProductDialog, setShowAddProductDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

  // Client fields (for sales invoices)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [clientName, setClientName] = useState(
    invoice?.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientName : "",
  );
  const [clientEmail, setClientEmail] = useState(
    invoice?.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientEmail : "",
  );
  const [clientAddress, setClientAddress] = useState(
    invoice?.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientAddress || "" : "",
  );
  const [clientVAT, setClientVAT] = useState<string>("");

  // Supplier fields (for purchase invoices)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("");
  const [supplierName, setSupplierName] = useState(
    invoice?.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierName : "",
  );
  const [supplierEmail, setSupplierEmail] = useState(
    invoice?.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierEmail : "",
  );
  const [supplierAddress, setSupplierAddress] = useState(
    invoice?.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierAddress || "" : "",
  );
  const [supplierVAT, setSupplierVAT] = useState<string>(
    invoice?.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierVAT || "" : "",
  );

  // Purchase invoice specific fields
  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).invoiceNumber || "" : "",
  );
  const [invoiceDate, setInvoiceDate] = useState(() => {
    if (invoice?.type === "purchase" && (invoice as PurchaseInvoice).invoiceDate && !isNaN(new Date((invoice as PurchaseInvoice).invoiceDate).getTime())) {
      return new Date((invoice as PurchaseInvoice).invoiceDate).toISOString().split("T")[0];
    }
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>(
    invoice?.items || [],
  );
  const [taxRate, setTaxRate] = useState(invoice?.taxRate || storeSettings?.vatSettings?.rate || 15);
  const [notes, setNotes] = useState(invoice?.notes || "");
  const [dueDate, setDueDate] = useState(() => {
    if (invoice?.dueDate && !isNaN(new Date(invoice.dueDate).getTime())) {
      return new Date(invoice.dueDate).toISOString().split("T")[0];
    }
    const date = new Date();
    date.setDate(date.getDate() + 30); // Default to 30 days from now
    return date.toISOString().split("T")[0];
  });



  // Update form state when invoice prop changes
  React.useEffect(() => {
    if (invoice) {
      setInvoiceType((invoice.type === InvoiceType.SALES ? "sales" : invoice.type) || "sales");
      setSelectedCustomerId("");
      setClientName(invoice.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientName : "");
      setClientEmail(invoice.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientEmail : "");
      setClientAddress(invoice.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientAddress || "" : "");
      const clientVATFromInvoice = invoice.type === InvoiceType.SALES ? (invoice as SalesInvoice).clientVAT || "" : "";
      setClientVAT(clientVATFromInvoice);
      // If no VAT from invoice, try to populate from customer record
      if (invoice.type === InvoiceType.SALES && !clientVATFromInvoice && (invoice as SalesInvoice).clientName) {
        const customer = customers.find(c => c.name === (invoice as SalesInvoice).clientName);
        if (customer?.vatNumber) {
          setClientVAT(customer.vatNumber);
        }
      }
      setSelectedSupplierId("");
      setSupplierName(invoice.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierName : "");
      setSupplierEmail(invoice.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierEmail : "");
      setSupplierAddress(invoice.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierAddress || "" : "");
      const supplierVATFromInvoice = invoice.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).supplierVAT || "" : "";
      setSupplierVAT(supplierVATFromInvoice);
      // If no VAT from invoice, try to populate from supplier record
      if (invoice.type === InvoiceType.PURCHASE && !supplierVATFromInvoice && (invoice as PurchaseInvoice).supplierName) {
        const supplier = suppliers.find(s => s.name === (invoice as PurchaseInvoice).supplierName);
        if (supplier?.vatNumber) {
          setSupplierVAT(supplier.vatNumber);
        }
      }
      setInvoiceNumber(invoice.type === InvoiceType.PURCHASE ? (invoice as PurchaseInvoice).invoiceNumber || "" : "");
      setInvoiceDate(() => {
        if (invoice.type === "purchase" && (invoice as PurchaseInvoice).invoiceDate && !isNaN(new Date((invoice as PurchaseInvoice).invoiceDate).getTime())) {
          return new Date((invoice as PurchaseInvoice).invoiceDate).toISOString().split("T")[0];
        }
        const date = new Date();
        return date.toISOString().split("T")[0];
      });
      setInvoiceItems(invoice.items || []);
      setTaxRate(invoice.taxRate || storeSettings?.vatSettings?.rate || 15);
      setNotes(invoice.notes || "");
       setDueDate(() => {
         if (invoice.dueDate && !isNaN(new Date(invoice.dueDate).getTime())) {
           return new Date(invoice.dueDate).toISOString().split("T")[0];
         }
         const date = new Date();
         date.setDate(date.getDate() + 30);
         return date.toISOString().split("T")[0];
       });
    }
   }, [invoice, storeSettings?.vatSettings?.rate, customers, suppliers]);

  // Update VAT when selected customer changes
  React.useEffect(() => {
    if (selectedCustomerId && customers.length > 0) {
      const customer = customers.find(c => c.id === selectedCustomerId);
      if (customer && customer.vatNumber) {
        setClientVAT(customer.vatNumber);
      }
    }
  }, [selectedCustomerId, customers]);

  // Update VAT when selected supplier changes
  React.useEffect(() => {
    if (selectedSupplierId && suppliers.length > 0) {
      const supplier = suppliers.find(s => s.id === selectedSupplierId);
      if (supplier && supplier.vatNumber) {
        setSupplierVAT(supplier.vatNumber);
      }
    }
  }, [selectedSupplierId, suppliers]);

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



  const removeItem = (index: number) => {
    setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
  };

  const handleQuantityUpdate = (index: number, quantity: number) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], quantity, total: quantity * newItems[index].unitPrice };
    setInvoiceItems(newItems);
  };

  const editItem = (index: number) => {
    setEditingItemIndex(index);
    // Open the appropriate dialog based on item type
    const item = invoiceItems[index];
    if (item.itemType === ItemType.PRODUCT) {
      setShowAddProductDialog(true);
    } else {
      setShowAddServiceDialog(true);
    }
  };

  const handleAddCategory = async (category: {
    name: string;
    description: string;
    type: "product" | "service";
    parentId: string | null;
    transactionType: ProductTransactionType;
  }) => {
    try {
      await createCategory({
        ...category,
        type: category.type as CategoryType,
        parentId: category.parentId || undefined,
      });
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const isVatInclusive = storeSettings?.vatSettings?.isVatInclusive ?? false;
  const isVatEnabled = storeSettings?.vatSettings?.isEnabled ?? true;

  // Calculate totals based on VAT mode
  const vatCalculation = isVatEnabled
    ? (isVatInclusive
        ? // For VAT-inclusive prices, sum item totals and extract VAT
          calculateVATInclusive(
            invoiceItems.reduce((sum, item) => sum + item.total, 0), 
            taxRate
          )
        : // For VAT-exclusive prices, sum item totals and add VAT
          calculateVATExclusive(
            invoiceItems.reduce((sum, item) => sum + item.total, 0), 
            taxRate
          )
      )
    : { 
        subtotal: invoiceItems.reduce((sum, item) => sum + item.total, 0), 
        vatAmount: 0, 
        total: invoiceItems.reduce((sum, item) => sum + item.total, 0) 
      };

  const subtotal = vatCalculation.subtotal;
  const taxAmount = vatCalculation.vatAmount;
  const total = vatCalculation.total;

  const handleClearCustomer = () => {
    setSelectedCustomerId("");
    setClientName("");
    setClientEmail("");
    setClientAddress("");
    setClientVAT("");
  };

  const handleClearSupplier = () => {
    setSelectedSupplierId("");
    setSupplierName("");
    setSupplierEmail("");
    setSupplierAddress("");
    setSupplierVAT("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseInvoice = {
      type: invoiceType,
      items: invoiceItems,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status: invoice ? invoice.status : "draft",
      dueDate: new Date(dueDate),
      notes,
      template: InvoiceTemplateType.ENGLISH,
      includeQR: false,
    };

    if (invoiceType === "sales") {
      onSubmit({
        ...baseInvoice,
        clientName,
        clientEmail,
        clientAddress,
        clientVAT,
        payments: [],
      } as Omit<SalesInvoice, "id" | "organizationId" | "createdAt" | "updatedAt">);
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
        payments: [],
      } as Omit<PurchaseInvoice, "id" | "organizationId" | "createdAt" | "updatedAt">);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Invoice Type</Label>
          <div className="flex gap-2 flex-wrap">
             <Button
               type="button"
               variant={invoiceType === "sales" ? "default" : "outline"}
               size="sm"
               onClick={() => setInvoiceType("sales")}
               disabled={!!invoice}
             >
               Sales Invoice
             </Button>
             <Button
               type="button"
               variant={invoiceType === "purchase" ? "default" : "outline"}
               size="sm"
               onClick={() => setInvoiceType("purchase")}
               disabled={!!invoice}
             >
               Purchase Invoice
             </Button>
          </div>
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
                readOnly={!!invoice}
                 onEditCustomer={() => {
                   onChildDialogChange?.(true);
                   if (invoice) onEditCustomer?.(invoice);
                 }}
                showAddButtonInReadOnly={true}
                onClearCustomer={handleClearCustomer}
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
                   readOnly={!!invoice}
                   onEditSupplier={() => {
                     onChildDialogChange?.(true);
                     if (invoice) onEditSupplier?.(invoice);
                   }}
                   showAddButtonInReadOnly={true}
                   onClearSupplier={handleClearSupplier}
                 />
           </>
         )}

        {/* Invoice Details Section */}
        <div className="border rounded-lg p-4 bg-card">
          <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {invoiceType === InvoiceType.PURCHASE && (
              <div>
                <Label htmlFor="invoice-number">Invoice Number</Label>
                <Input
                  id="invoice-number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Supplier invoice number"
                />
              </div>
            )}
            <div>
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input
                id="invoice-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </div>

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
            onRemove={removeItem}
            onEdit={editItem}
            onUpdateQuantity={handleQuantityUpdate}
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
          showDueDate={false}
          onTaxRateChange={isVatEnabled ? setTaxRate : undefined}
          onDueDateChange={setDueDate}
          mode="invoice"
          isVatEnabled={isVatEnabled}
          isVatInclusive={isVatInclusive}
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
        onOpenChange={(open) => {
          setShowAddProductDialog(open);
          if (!open) setEditingItemIndex(null);
        }}
        onAddProduct={async (productData) => {
          try {
            if (editingItemIndex !== null) {
              // Update existing item
              const updatedItems = [...invoiceItems];
              updatedItems[editingItemIndex] = {
                ...updatedItems[editingItemIndex],
                name: productData.name,
                description: productData.description || '',
                unitPrice: productData.price,
                total: updatedItems[editingItemIndex].quantity * productData.price,
              };
              setInvoiceItems(updatedItems);
            } else {
              // Add new item to catalog
              await createItem(productData);
            }
            setShowAddProductDialog(false);
            setEditingItemIndex(null);
          } catch (error) {
            console.error("Error creating product:", error);
          }
        }}
        onUpdateProduct={() => {}}
        productToEdit={editingItemIndex !== null ? {
          id: invoiceItems[editingItemIndex].itemId || '',
          name: invoiceItems[editingItemIndex].name,
          description: invoiceItems[editingItemIndex].description,
          price: invoiceItems[editingItemIndex].unitPrice,
          categoryId: '',
          itemType: ItemType.PRODUCT,
          transactionType: invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE,
          organizationId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          } : null}
        categories={categories}
        defaultTransactionType={invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE}
        allowTransactionTypeChange={false}
        onAddCategory={handleAddCategory}
      />

      {/* Add Service Dialog */}
      <AddServiceDialog
        open={showAddServiceDialog}
        onOpenChange={(open) => {
          setShowAddServiceDialog(open);
          if (!open) setEditingItemIndex(null);
        }}
        onAddService={async (serviceData) => {
          try {
            if (editingItemIndex !== null) {
              // Update existing item
              const updatedItems = [...invoiceItems];
              updatedItems[editingItemIndex] = {
                ...updatedItems[editingItemIndex],
                name: serviceData.name,
                description: serviceData.description || '',
                unitPrice: serviceData.price,
                total: updatedItems[editingItemIndex].quantity * serviceData.price,
              };
              setInvoiceItems(updatedItems);
            } else {
              // Add new item to catalog
              await createItem(serviceData);
            }
            setShowAddServiceDialog(false);
            setEditingItemIndex(null);
          } catch (error) {
            console.error("Error creating service:", error);
          }
        }}
        onUpdateService={() => {}}
        serviceToEdit={editingItemIndex !== null ? {
          id: invoiceItems[editingItemIndex].itemId || '',
          name: invoiceItems[editingItemIndex].name,
          description: invoiceItems[editingItemIndex].description,
          price: invoiceItems[editingItemIndex].unitPrice,
          categoryId: '',
          itemType: ItemType.SERVICE,
          transactionType: invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE,
          organizationId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        } : null}
        categories={categories}
        defaultTransactionType={invoiceType === 'sales' ? ProductTransactionType.SALES : ProductTransactionType.PURCHASE}
        allowTransactionTypeChange={false}
        onAddCategory={handleAddCategory}
      />

      {/* Add Customer Dialog */}
      <AddCustomerDialog
        open={showAddCustomerDialog}
        onOpenChange={(open) => {
          setShowAddCustomerDialog(open);
          if (!open) {
            onChildDialogChange?.(false);
          }
        }}
        onCustomerAdded={() => {
          // Customer list will be updated automatically via real-time hook
        }}
      />

      {/* Add Supplier Dialog */}
      <AddSupplierDialog
        open={showAddSupplierDialog}
        onOpenChange={(open) => {
          setShowAddSupplierDialog(open);
          if (!open) {
            onChildDialogChange?.(false);
          }
        }}
        onSupplierAdded={() => {
          // Supplier list will be updated automatically via real-time hook
        }}
      />


    </>
  );
}

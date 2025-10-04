"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { selectedOrganizationAtom } from "@/atoms";
import { useMemo } from "react";
import { Invoice, Payment, SalesInvoice, PurchaseInvoice } from "@/types";
import { InvoiceList } from "@/components/invoices_quotes/InvoiceList";
import InvoiceForm from "@/components/invoices_quotes/InvoiceForm";
import { InvoiceDetails } from "@/components/invoices_quotes/InvoiceDetails";
import { InvoicePrintDialog } from "@/components/invoices_quotes/InvoicePrintDialog";
import { Button } from "@/components/ui/button";
import { Plus, Printer, Receipt, Edit, Mail, Trash2 } from "lucide-react";
import { EmailInvoiceDialog } from "@/components/invoices_quotes/EmailInvoiceDialog";
import { useSeparatedTemplates } from "@/lib/hooks/useSeparatedTemplates";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { Loader } from "@/components/ui/loader";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useInvoices } from "@/lib/hooks/useInvoices";
import { useCustomers } from "@/lib/hooks/useCustomers";
import { useSuppliers } from "@/lib/hooks/useSuppliers";
import { useRealtimeCollection } from "@/lib/hooks/useRealtimeCollection";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [selectedOrganization] = useAtom(selectedOrganizationAtom);
  const organizationId = selectedOrganization?.id;
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<"sales" | "purchase" | "all">("sales");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  // Use custom hooks for data fetching
  const {
    salesInvoices,
    purchaseInvoices,
    loading: invoicesLoading,
    updateExistingInvoice,
    createSalesInvoice,
    createPurchaseInvoice,
    deleteExistingInvoice,
  } = useInvoices();
  const { customers, loading: customersLoading } = useCustomers();
  const { suppliers, loading: suppliersLoading } = useSuppliers();
  const { data: payments, loading: paymentsLoading } =
    useRealtimeCollection<Payment>("payments", organizationId || null);
  const { allInvoiceTemplates: invoiceTemplates, loading: templatesLoading } =
    useSeparatedTemplates();
  const { storeSettings } = useStoreSettings();
  const printerSettings = storeSettings?.printerSettings;

  const invoices = useMemo(() => {
    const allInvoices = [...salesInvoices, ...purchaseInvoices];
    return allInvoices.map(invoice => ({
      ...invoice,
      dueDate: invoice.dueDate || undefined,
    }));
  }, [salesInvoices, purchaseInvoices]);

  const loading =
    invoicesLoading ||
    customersLoading ||
    suppliersLoading ||
    paymentsLoading ||
    templatesLoading;

  const groupedPayments = useMemo(() => {
    return payments.reduce(
      (acc, payment) => {
        if (!acc[payment.invoiceId]) {
          acc[payment.invoiceId] = [];
        }
        acc[payment.invoiceId].push(payment);
        return acc;
      },
      {} as { [invoiceId: string]: Payment[] },
    );
  }, [payments]);

  const handleStatusChange = async (
    invoiceId: string,
    newStatus: Invoice["status"],
  ) => {
    try {
      await updateExistingInvoice(invoiceId, { status: newStatus });
    } catch (error) {
      console.error("Error updating invoice status:", error);
    }
  };

  const handleInvoiceClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetails(true);
  };

  const getInvoicesByTransactionType = () => {
    if (transactionTypeFilter === "all") {
      return invoices;
    }
    return invoices.filter((inv) => inv.type === transactionTypeFilter);
  };

  const getFilteredInvoices = () => {
    let filteredInvoices = getInvoicesByTransactionType();
    
    // Then filter by status tab
    switch (activeTab) {
      case "draft":
        return filteredInvoices.filter((inv) => inv.status === "draft");
      case "sent":
        return filteredInvoices.filter((inv) => inv.status === "sent");
      case "paid":
        return filteredInvoices.filter((inv) => inv.status === "paid");
      case "overdue":
        return filteredInvoices.filter((inv) => inv.status === "overdue");
      default:
        return filteredInvoices;
    }
  };

  const getInvoicesByTransactionTypeAndStatus = (status?: string) => {
    let filteredInvoices = getInvoicesByTransactionType();
    if (status) {
      filteredInvoices = filteredInvoices.filter((inv) => inv.status === status);
    }
    return filteredInvoices;
  };

  const getPaymentsForInvoice = (invoiceId: string) => {
    return groupedPayments[invoiceId] || [];
  };

  const handleDeleteInvoice = async (invoice: Invoice) => {
    try {
      await deleteExistingInvoice(invoice.id);
      toast.success("Invoice deleted successfully");
      setInvoiceToDelete(null);
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader size="lg" />
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Receipt className="h-8 w-8" />
          Invoices
        </h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New {transactionTypeFilter === "purchase" ? "Purchase" : "Sales"} Invoice
        </Button>
      </div>

      {/* Transaction Type Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Transaction Type:</span>
          <div className="flex gap-2">
            <Button
              variant={transactionTypeFilter === "sales" ? "default" : "outline"}
              size="sm"
              onClick={() => setTransactionTypeFilter("sales")}
            >
              Sales Invoices
            </Button>
            <Button
              variant={transactionTypeFilter === "purchase" ? "default" : "outline"}
              size="sm"
              onClick={() => setTransactionTypeFilter("purchase")}
            >
              Purchase Invoices
            </Button>
            <Button
              variant={transactionTypeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTransactionTypeFilter("all")}
            >
              All Types
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All ({getInvoicesByTransactionTypeAndStatus().length})</TabsTrigger>
          <TabsTrigger value="draft">
            Draft ({getInvoicesByTransactionTypeAndStatus("draft").length})
          </TabsTrigger>
          <TabsTrigger value="sent">
            Sent ({getInvoicesByTransactionTypeAndStatus("sent").length})
          </TabsTrigger>
          <TabsTrigger value="paid">
            Paid ({getInvoicesByTransactionTypeAndStatus("paid").length})
          </TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue ({getInvoicesByTransactionTypeAndStatus("overdue").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <InvoiceList
        invoices={getFilteredInvoices()}
        customers={customers}
        suppliers={suppliers}
        payments={groupedPayments}
        onInvoiceClick={handleInvoiceClick}
        onViewDetails={handleInvoiceClick}
        onStatusChange={handleStatusChange}
        onEdit={(invoice) => {
          // Handle edit - could open edit form
          console.log("Edit invoice:", invoice.id);
        }}
        onDuplicate={(invoice) => {
          // Handle duplicate - could create copy
          console.log("Duplicate invoice:", invoice.id);
        }}
        onSend={(invoice) => {
          // Handle send - could send via email
          console.log("Send invoice:", invoice.id);
        }}
        onDownloadPDF={(invoice) => {
          // Handle PDF download
          console.log("Download PDF for invoice:", invoice.id);
        }}
        onDelete={(invoice) => {
          setInvoiceToDelete(invoice);
        }}
        organization={selectedOrganization}
        invoiceTemplates={invoiceTemplates}
        settings={printerSettings?.invoices}
      />

      {/* Create/Edit Invoice Dialog */}
      <Dialog open={showForm} onOpenChange={(open) => {
        setShowForm(open);
        if (!open) {
          setEditingInvoice(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            invoice={editingInvoice}
            defaultType={transactionTypeFilter === "purchase" ? "purchase" : "sales"}
            onSubmit={async (invoiceData) => {
              try {
                if (editingInvoice) {
                  await updateExistingInvoice(editingInvoice.id, invoiceData);
                  toast.success("Invoice updated successfully");
                } else {
                  if (invoiceData.type === 'purchase') {
                    await createPurchaseInvoice(invoiceData as Omit<PurchaseInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>);
                  } else {
                    await createSalesInvoice(invoiceData as Omit<SalesInvoice, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>);
                  }
                  toast.success("Invoice created successfully");
                }
                setShowForm(false);
                setEditingInvoice(null);
              } catch (error) {
                console.error("Error saving invoice:", error);
                toast.error(`Failed to ${editingInvoice ? "update" : "create"} invoice`);
              }
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="flex justify-end gap-2 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setEditingInvoice(selectedInvoice);
                  setShowForm(true);
                }}
                disabled={selectedInvoice.status === 'paid'}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEmailDialog(true)}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <InvoicePrintDialog
                invoice={selectedInvoice}
                organization={selectedOrganization}
                invoiceTemplates={invoiceTemplates}
                customer={
                  selectedInvoice.type === "sales" && selectedInvoice.clientName
                    ? customers.find((c) => c.name === selectedInvoice.clientName)
                    : undefined
                }
                supplier={
                  selectedInvoice.type === "purchase" &&
                  selectedInvoice.supplierId
                    ? suppliers.find((s) => s.id === selectedInvoice.supplierId)
                    : undefined
                }
                settings={printerSettings?.invoices}
              >
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </InvoicePrintDialog>
            </div>
          )}
          {selectedInvoice && (
            <InvoiceDetails
              invoice={selectedInvoice}
              organization={selectedOrganization}
              customer={
                selectedInvoice.type === "sales" && selectedInvoice.clientName
                  ? customers.find((c) => c.name === selectedInvoice.clientName)
                  : undefined
              }
              supplier={
                selectedInvoice.type === "purchase" &&
                selectedInvoice.supplierId
                  ? suppliers.find((s) => s.id === selectedInvoice.supplierId)
                  : undefined
              }
              payments={getPaymentsForInvoice(selectedInvoice.id)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Email Invoice Dialog */}
      <EmailInvoiceDialog
        invoice={selectedInvoice}
        customer={
          selectedInvoice?.type === "sales" && selectedInvoice.clientName
            ? customers.find((c) => c.name === selectedInvoice.clientName)
            : undefined
        }
        supplier={
          selectedInvoice?.type === "purchase" &&
          selectedInvoice.supplierId
            ? suppliers.find((s) => s.id === selectedInvoice.supplierId)
            : undefined
        }
        organization={selectedOrganization}
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!invoiceToDelete} onOpenChange={(open) => !open && setInvoiceToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Invoice</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
              {invoiceToDelete && (
                <span className="block mt-2 font-medium">
                  Invoice #{invoiceToDelete.id.slice(-8)} - ${invoiceToDelete.total.toFixed(2)}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInvoiceToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => invoiceToDelete && handleDeleteInvoice(invoiceToDelete)}
            >
              Delete Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

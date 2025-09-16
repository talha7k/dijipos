'use client';

import { useState } from 'react';
import { useOrganizationId, useSelectedOrganization } from '@/legacy_hooks/useAuthState';
import { Quote } from '@/types';
import { QuoteTemplateType, QuoteStatus, InvoiceStatus } from '@/types/enums';
import { useQuotesData, useQuoteActions } from '@/legacy_hooks/useQuotes';
import { useInvoiceActions } from '@/legacy_hooks/useInvoices';
import { useQuoteTemplatesData } from '@/legacy_hooks/use-quote-templates-data';
import { useCustomersData } from '@/legacy_hooks/useCustomerState';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QuoteForm from '@/components/invoices_quotes/QuoteForm';
import { QuoteList } from '@/components/invoices_quotes/QuoteList';
import { QuoteDetails } from '@/components/invoices_quotes/QuoteDetails';
import { QuoteActionsDialog } from '@/components/invoices_quotes/QuoteActionsDialog';
import { QuotePrintDialog } from '@/components/invoices_quotes/QuotePrintDialog';

function QuotesContent() {
  const organizationId = useOrganizationId();
  const selectedOrganization = useSelectedOrganization();
  const { quotes, loading } = useQuotesData(organizationId || undefined);
  const { createQuote, updateQuote } = useQuoteActions(organizationId || undefined);
  const { createInvoice } = useInvoiceActions(organizationId || undefined);
  const { quoteTemplates } = useQuoteTemplatesData(organizationId || undefined);
  const { customers } = useCustomersData(organizationId || undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handleCreateQuote = async (quoteData: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId || !createQuote) return;

    await createQuote(quoteData);
    setDialogOpen(false);
  };

  const handleConvertToInvoice = async (quote: Quote) => {
    if (!organizationId || !createQuote || !createInvoice) return;

    // Update quote status to converted
    await updateQuote(quote.id, { status: QuoteStatus.CONVERTED });

    // Create invoice from quote data
    const invoiceData = {
      type: 'sales' as const,
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientAddress: quote.clientAddress || undefined,
      clientVAT: undefined, // Quotes don't have VAT
      items: quote.items.map(item => ({
        ...item,
        description: item.description || undefined,
        productId: item.productId || undefined,
        serviceId: item.serviceId || undefined,
      })),
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      status: InvoiceStatus.DRAFT,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      notes: quote.notes || undefined,
      template: QuoteTemplateType.ENGLISH, // default template
      includeQR: false, // default no QR
      quoteId: quote.id,
    };

    await createInvoice(invoiceData);
  };

  const handleQuoteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowActions(true);
  };

  const handleViewDetails = (quote: Quote) => {
    setSelectedQuote(quote);
    setShowDetails(true);
  };

  const handlePrint = (quote: Quote) => {
    setSelectedQuote(quote);
    setPrintDialogOpen(true);
  };

  const handleEdit = (quote: Quote) => {
    // Handle edit - could open edit form
    console.log('Edit quote:', quote.id);
  };

  const handleDuplicate = (quote: Quote) => {
    // Handle duplicate - could create copy
    console.log('Duplicate quote:', quote.id);
  };

  const handleSend = (quote: Quote) => {
    // Handle send - could send via email
    console.log('Send quote:', quote.id);
  };

  const handleDownloadPDF = (quote: Quote) => {
    // Handle PDF download
    console.log('Download PDF for quote:', quote.id);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quotes</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Quote</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
            </DialogHeader>
            <QuoteForm onSubmit={handleCreateQuote} />
          </DialogContent>
        </Dialog>
      </div>

      <QuoteList
        quotes={quotes}
        onQuoteClick={handleQuoteClick}
        onViewDetails={handleViewDetails}
        onPrint={handlePrint}
        onOpenActions={handleQuoteClick}
        onEdit={handleEdit}
        onDuplicate={handleDuplicate}
        onSend={handleSend}
        onConvertToInvoice={handleConvertToInvoice}
        onDownloadPDF={handleDownloadPDF}
      />

      {/* Quote Actions Dialog */}
      {selectedQuote && (
        <QuoteActionsDialog
          quote={selectedQuote}
          open={showActions}
          onOpenChange={setShowActions}
          onViewDetails={() => {
            setShowDetails(true);
            setShowActions(false);
          }}
          onPrint={() => {
            handlePrint(selectedQuote);
            setShowActions(false);
          }}
          onEdit={() => handleEdit(selectedQuote)}
          onDuplicate={() => handleDuplicate(selectedQuote)}
          onSend={() => handleSend(selectedQuote)}
          onConvertToInvoice={() => handleConvertToInvoice(selectedQuote)}
          onDownloadPDF={() => handleDownloadPDF(selectedQuote)}
        />
      )}

      {/* Quote Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {selectedQuote && (
            <QuoteDetails
              quote={selectedQuote}
              organization={selectedOrganization}
              customer={customers.find(c => c.name === selectedQuote.clientName)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Print Dialog */}
      {selectedQuote && (
        <QuotePrintDialog
          quote={selectedQuote}
          organization={selectedOrganization}
          quoteTemplates={quoteTemplates}
          customer={customers.find(c => c.name === selectedQuote.clientName)}
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
        >
          <div>Print Preview</div>
        </QuotePrintDialog>
      )}
    </div>
  );
}

export default function QuotesPage() {
  return <QuotesContent />;
}
'use client';

import { useState } from 'react';
import { useOrganizationId, useSelectedOrganization } from '@/hooks/useAuthState';
import { Quote } from '@/types';
import { QuoteTemplateType, QuoteStatus, InvoiceStatus } from '@/types/enums';
import { useQuotesData, useQuoteActions } from '@/hooks/useQuotes';
import { useInvoiceActions } from '@/hooks/useInvoices';
import { useQuoteTemplatesData } from '@/hooks/use-quote-templates-data';
import { useCustomersData } from '@/hooks/useCustomerState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QuoteForm from '@/components/invoices_quotes/QuoteForm';
import { QuotePrintDialog } from '@/components/invoices_quotes/QuotePrintDialog';
import { FileText, Printer } from 'lucide-react';

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
  const [printDialogOpen, setPrintDialogOpen] = useState(false);

  const handleCreateQuote = async (quoteData: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId || !createQuote) return;

    await createQuote(quoteData);
    setDialogOpen(false);
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    if (!organizationId || !createQuote || !createInvoice) return;

    // Update quote status to converted
    await updateQuote(quoteId, { status: QuoteStatus.CONVERTED });

    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
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
        quoteId,
      };

      await createInvoice(invoiceData);
    }
  };

  const handlePrint = (quote: Quote) => {
    setSelectedQuote(quote);
    setPrintDialogOpen(true);
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

      <Card>
        <CardHeader>
          <CardTitle>All Quotes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.clientName}</TableCell>
                  <TableCell>${quote.total.toFixed(2)}</TableCell>
                  <TableCell>{quote.status}</TableCell>
                  <TableCell>{quote.createdAt?.toLocaleDateString()}</TableCell>
                   <TableCell>
                     <div className="flex gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => handlePrint(quote)}
                       >
                         <Printer className="w-4 h-4 mr-1" />
                         Print
                       </Button>
                       {quote.status !== 'converted' && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={() => handleConvertToInvoice(quote.id)}
                         >
                           Convert to Invoice
                         </Button>
                       )}
                     </div>
                   </TableCell>
                </TableRow>
              ))}
              {quotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8" />
                      <p>No quotes found. Click Create Quote to get started.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
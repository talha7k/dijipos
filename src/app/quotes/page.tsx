'use client';

import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Quote } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QuoteForm from '@/components/QuoteForm';
import { FileText } from 'lucide-react';

function QuotesContent() {
  const { user, organizationId } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (!organizationId) return;

    const q = query(collection(db, 'organizations', organizationId, 'quotes'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const quotesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
        validUntil: doc.data().validUntil?.toDate(),
      })) as Quote[];
      setQuotes(quotesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const handleCreateQuote = async (quoteData: Omit<Quote, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>) => {
    if (!organizationId) return;

    // Clean the data to remove undefined values that Firebase doesn't accept
    const cleanedData = {
      ...quoteData,
      clientAddress: quoteData.clientAddress || null,
      notes: quoteData.notes || null,
      validUntil: quoteData.validUntil || null,
      items: quoteData.items.map(item => ({
        ...item,
        description: item.description || null,
        productId: item.productId || null,
        serviceId: item.serviceId || null,
      })),
      organizationId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await addDoc(collection(db, 'organizations', organizationId, 'quotes'), cleanedData);
    setDialogOpen(false);
  };

  const handleConvertToInvoice = async (quoteId: string) => {
    if (!organizationId) return;

    const quoteRef = doc(db, 'organizations', organizationId, 'quotes', quoteId);
    await updateDoc(quoteRef, { status: 'converted' });

    const quote = quotes.find(q => q.id === quoteId);
    if (quote) {
      // Clean the data to remove undefined values that Firebase doesn't accept
      const cleanedQuoteData = {
        clientName: quote.clientName,
        clientEmail: quote.clientEmail,
        clientAddress: quote.clientAddress || null,
        clientVAT: null, // Quotes don't have VAT, set to null for invoices
        items: quote.items.map(item => ({
          ...item,
          description: item.description || null,
          productId: item.productId || null,
          serviceId: item.serviceId || null,
        })),
        subtotal: quote.subtotal,
        taxRate: quote.taxRate,
        taxAmount: quote.taxAmount,
        total: quote.total,
        status: 'draft',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        notes: quote.notes || null,
        template: 'english', // default template
        includeQR: false, // default no QR
        quoteId,
        organizationId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(db, 'organizations', organizationId, 'invoices'), cleanedQuoteData);
    }
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
                    {quote.status !== 'converted' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConvertToInvoice(quote.id)}
                      >
                        Convert to Invoice
                      </Button>
                    )}
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
    </div>
  );
}

export default function QuotesPage() {
  return <QuotesContent />;
}
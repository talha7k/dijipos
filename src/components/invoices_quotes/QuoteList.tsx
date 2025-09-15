'use client';

import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Quote } from '@/types';
import { FileText } from 'lucide-react';
import { QuoteActions } from './QuoteActions';

interface QuoteListProps {
  quotes: Quote[];
  onQuoteClick: (quote: Quote) => void;
  onViewDetails: (quote: Quote) => void;
  onPrint: (quote: Quote) => void;
  onOpenActions?: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDuplicate?: (quote: Quote) => void;
  onSend?: (quote: Quote) => void;
  onConvertToInvoice?: (quote: Quote) => void;
  onDownloadPDF?: (quote: Quote) => void;
}

export function QuoteList({
  quotes,
  onQuoteClick,
  onViewDetails,
  onPrint,
  onOpenActions,
  onEdit,
  onDuplicate,
  onSend,
  onConvertToInvoice,
  onDownloadPDF
}: QuoteListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Quote #</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Valid Until</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((quote) => (
            <TableRow
              key={quote.id}
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onOpenActions ? onOpenActions(quote) : onQuoteClick(quote)}
            >
              <TableCell>{quote.clientName}</TableCell>
              <TableCell>{quote.id.slice(-8)}</TableCell>
              <TableCell>${quote.total.toFixed(2)}</TableCell>
              <TableCell>
                <Badge variant={
                  quote.status === 'accepted' ? 'default' :
                  quote.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {quote.status}
                </Badge>
              </TableCell>
              <TableCell>{quote.validUntil?.toLocaleDateString()}</TableCell>
              <TableCell>{quote.createdAt?.toLocaleDateString()}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-2">
                  <QuoteActions
                    quote={quote}
                    onPrint={onPrint}
                    onViewDetails={onViewDetails}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onSend={onSend}
                    onConvertToInvoice={onConvertToInvoice}
                    onDownloadPDF={onDownloadPDF}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {quotes.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-12 w-12" />
                  <p>No quotes found. Create your first quote to get started.</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
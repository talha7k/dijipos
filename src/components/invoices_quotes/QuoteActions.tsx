'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Quote } from '@/types';
import { Printer, Eye, MoreHorizontal, FileText } from 'lucide-react';
import { QuoteActionsDialog } from './QuoteActionsDialog';

interface QuoteActionsProps {
  quote: Quote;
  onPrint: (quote: Quote) => void;
  onViewDetails: (quote: Quote) => void;
  onEdit?: (quote: Quote) => void;
  onDuplicate?: (quote: Quote) => void;
  onSend?: (quote: Quote) => void;
  onConvertToInvoice?: (quote: Quote) => void;
  onDownloadPDF?: (quote: Quote) => void;
}

export function QuoteActions({
  quote,
  onPrint,
  onViewDetails,
  onEdit,
  onDuplicate,
  onSend,
  onConvertToInvoice,
  onDownloadPDF
}: QuoteActionsProps) {
  const [showActionsDialog, setShowActionsDialog] = useState(false);

  const handlePrintPreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint(quote);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewDetails(quote);
  };

  const handleActionsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowActionsDialog(true);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleActionsClick}
          title="More Actions"
        >
          <MoreHorizontal className="h-4 w-4 mr-1" />
          Actions
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrintPreview}
          title="Print Preview"
        >
          <Printer className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewDetails}
          title="View Details"
        >
          <Eye className="h-4 w-4" />
        </Button>

        {quote.status === 'draft' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onSend?.(quote);
            }}
          >
            Send
          </Button>
        )}

        {quote.status !== 'converted' && (
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onConvertToInvoice?.(quote);
            }}
          >
            Convert to Invoice
          </Button>
        )}
      </div>

      <QuoteActionsDialog
        quote={quote}
        open={showActionsDialog}
        onOpenChange={setShowActionsDialog}
        onViewDetails={() => onViewDetails(quote)}
        onPrint={() => onPrint(quote)}
        onEdit={() => onEdit?.(quote)}
        onDuplicate={() => onDuplicate?.(quote)}
        onSend={() => onSend?.(quote)}
        onConvertToInvoice={() => onConvertToInvoice?.(quote)}
        onDownloadPDF={() => onDownloadPDF?.(quote)}
      />
    </>
  );
}
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Quote } from '@/types';
import {
  Eye,
  Printer,
  Edit,
  Copy,
  Send,
  FileText,
  Download,
  ArrowRight
} from 'lucide-react';

interface QuoteActionsDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onSend?: () => void;
  onConvertToInvoice?: () => void;
  onDownloadPDF?: () => void;
}

export function QuoteActionsDialog({
  quote,
  open,
  onOpenChange,
  onViewDetails,
  onPrint,
  onEdit,
  onDuplicate,
  onSend,
  onConvertToInvoice,
  onDownloadPDF
}: QuoteActionsDialogProps) {
  if (!quote) return null;

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onViewDetails,
      variant: 'default' as const,
      description: 'View complete quote details'
    },
    {
      label: 'Print Quote',
      icon: Printer,
      onClick: onPrint,
      variant: 'outline' as const,
      description: 'Print or save as PDF'
    },
    {
      label: 'Download PDF',
      icon: Download,
      onClick: onDownloadPDF,
      variant: 'outline' as const,
      description: 'Download quote as PDF file'
    },
    {
      label: 'Edit Quote',
      icon: Edit,
      onClick: onEdit,
      variant: 'outline' as const,
      description: 'Modify quote details',
      disabled: quote.status !== 'draft'
    },
    {
      label: 'Duplicate Quote',
      icon: Copy,
      onClick: onDuplicate,
      variant: 'outline' as const,
      description: 'Create a copy of this quote'
    },
    {
      label: 'Send Quote',
      icon: Send,
      onClick: onSend,
      variant: 'outline' as const,
      description: 'Email quote to client',
      disabled: quote.status !== 'draft'
    },
    {
      label: 'Convert to Invoice',
      icon: ArrowRight,
      onClick: onConvertToInvoice,
      variant: 'default' as const,
      description: 'Convert this quote to an invoice',
      show: quote.status !== 'converted'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Quote Actions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quote Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Quote</p>
                <p className="font-medium">#{quote.id.slice(-8)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{quote.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">${quote.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={
                  quote.status === 'accepted' ? 'default' :
                  quote.status === 'rejected' ? 'destructive' :
                  'secondary'
                }>
                  {quote.status}
                </Badge>
              </div>
            </div>

            {/* Valid Until */}
            {quote.validUntil && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valid Until</span>
                  <span className="text-sm">{quote.validUntil.toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions
              .filter(action => action.show !== false)
              .map((action) => (
                <Button
                  key={action.label}
                  variant={action.variant}
                  onClick={() => {
                    action.onClick?.();
                    onOpenChange(false);
                  }}
                  disabled={action.disabled}
                  className="h-auto p-4 flex flex-col items-start gap-1"
                >
                  <div className="flex items-center gap-2 w-full">
                    <action.icon className="h-4 w-4" />
                    <span className="font-medium">{action.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground text-left">
                    {action.description}
                  </p>
                </Button>
              ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
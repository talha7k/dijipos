'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice, Payment } from '@/types';
import {
  Eye,
  Printer,
  CreditCard,
  Edit,
  Copy,
  Send,
  CheckCircle,
  AlertTriangle,
  FileText,
  Download
} from 'lucide-react';

interface InvoiceActionsDialogProps {
  invoice: Invoice | null;
  payments: Payment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewDetails?: () => void;
  onPrint?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onSend?: () => void;
  onMarkAsPaid?: () => void;
  onMarkAsSent?: () => void;
  onDownloadPDF?: () => void;
}

export function InvoiceActionsDialog({
  invoice,
  payments,
  open,
  onOpenChange,
  onViewDetails,
  onPrint,
  onEdit,
  onDuplicate,
  onSend,
  onMarkAsPaid,
  onMarkAsSent,
  onDownloadPDF
}: InvoiceActionsDialogProps) {
  if (!invoice) return null;

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const remainingBalance = invoice.total - totalPaid;
  const isFullyPaid = remainingBalance <= 0;

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: onViewDetails,
      variant: 'default' as const,
      description: 'View complete invoice details'
    },
    {
      label: 'Print Invoice',
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
      description: 'Download invoice as PDF file'
    },
    {
      label: 'Edit Invoice',
      icon: Edit,
      onClick: onEdit,
      variant: 'outline' as const,
      description: 'Modify invoice details',
      disabled: invoice.status === 'paid'
    },
    {
      label: 'Duplicate Invoice',
      icon: Copy,
      onClick: onDuplicate,
      variant: 'outline' as const,
      description: 'Create a copy of this invoice'
    },
    {
      label: 'Send Invoice',
      icon: Send,
      onClick: onSend,
      variant: 'outline' as const,
      description: 'Email invoice to client',
      disabled: invoice.status !== 'sent' && invoice.status !== 'draft'
    },
    {
      label: 'Mark as Sent',
      icon: Send,
      onClick: onMarkAsSent,
      variant: 'default' as const,
      description: 'Mark invoice as sent to client',
      show: invoice.status === 'draft'
    },
    {
      label: 'Mark as Paid',
      icon: CheckCircle,
      onClick: onMarkAsPaid,
      variant: 'default' as const,
      description: 'Mark invoice as fully paid',
      show: invoice.status === 'sent' && !isFullyPaid
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Actions
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Summary */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Invoice</p>
                <p className="font-medium">#{invoice.id.slice(-8)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Client</p>
                <p className="font-medium">{invoice.clientName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="font-medium">${invoice.total.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={
                  invoice.status === 'paid' ? 'default' :
                  invoice.status === 'overdue' ? 'destructive' :
                  'secondary'
                }>
                  {invoice.status}
                </Badge>
              </div>
            </div>

            {/* Payment Status */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Payment Status</span>
                </div>
                {isFullyPaid ? (
                  <Badge variant="default" className="bg-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Fully Paid
                  </Badge>
                ) : remainingBalance > 0 ? (
                  <Badge variant="secondary">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    ${remainingBalance.toFixed(2)} remaining
                  </Badge>
                ) : (
                  <Badge variant="outline">No payments</Badge>
                )}
              </div>
            </div>
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

          {/* Recent Payments */}
          {payments.length > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Recent Payments
              </h4>
              <div className="space-y-2">
                {payments.slice(0, 3).map((payment, index) => (
                  <div key={index} className="flex justify-between items-center text-sm bg-muted/30 rounded p-2">
                    <div>
                      <p className="font-medium">{payment.paymentMethod}</p>
                      <p className="text-muted-foreground text-xs">
                        {payment.paymentDate?.toLocaleDateString()}
                      </p>
                    </div>
                    <p className="font-medium">${payment.amount.toFixed(2)}</p>
                  </div>
                ))}
                {payments.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{payments.length - 3} more payments
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
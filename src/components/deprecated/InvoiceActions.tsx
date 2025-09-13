'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Invoice } from '@/types';
import { MoreVertical, Eye, Printer, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceActionsProps {
  invoice: Invoice;
  onView?: (invoice: Invoice) => void;
  onPrint?: (invoice: Invoice) => void;
  onDelete?: (invoiceId: string) => void;
  showView?: boolean;
  showPrint?: boolean;
  showDelete?: boolean;
}

export function InvoiceActions({
  invoice,
  onView,
  onPrint,
  onDelete,
  showView = true,
  showPrint = true,
  showDelete = false,
}: InvoiceActionsProps) {
  const handleDownload = () => {
    // This would typically generate a PDF download
    toast.info('Download functionality to be implemented');
  };

  const handleDelete = () => {
    if (onDelete) {
      const confirmed = window.confirm('Are you sure you want to delete this invoice?');
      if (confirmed) {
        onDelete(invoice.id);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {showView && (
          <DropdownMenuItem onClick={() => onView?.(invoice)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
        )}
        {showPrint && (
          <DropdownMenuItem onClick={() => onPrint?.(invoice)}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download PDF
        </DropdownMenuItem>
        {showDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
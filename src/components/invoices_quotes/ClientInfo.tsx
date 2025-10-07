'use client';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Customer } from '@/types';
import { Plus, Edit, X } from 'lucide-react';

interface ClientInfoProps {
  selectedCustomerId: string;
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientVAT?: string;
  showVAT?: boolean;
  customers: Customer[];
  onCustomerSelect: (customerId: string) => void;
  onClientNameChange: (name: string) => void;
  onClientEmailChange: (email: string) => void;
  onClientAddressChange: (address: string) => void;
  onClientVATChange?: (vat: string) => void;
  onAddCustomer?: () => void;
  readOnly?: boolean;
  onEditCustomer?: () => void;
  showAddButtonInReadOnly?: boolean;
  onClearCustomer?: () => void;
}

export default function ClientInfo({
  selectedCustomerId,
  clientName,
  clientEmail,
  clientAddress,
  clientVAT = '',
  showVAT = false,
  customers,
  onCustomerSelect,
  onClientNameChange,
  onClientEmailChange,
  onClientAddressChange,
  onClientVATChange,
  onAddCustomer,
  readOnly = false,
  onEditCustomer,
  showAddButtonInReadOnly = false,
  onClearCustomer,
}: ClientInfoProps) {
  const handleCustomerSelect = (customerId: string) => {
    onCustomerSelect(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      onClientNameChange(customer.name);
      onClientEmailChange(customer.email);
      onClientAddressChange(customer.address || '');
      onClientVATChange?.(customer.vatNumber || '');
    }
  };

  return (
    <>
      {(!readOnly || (!selectedCustomerId && !clientName)) && (
        <div>
          <Label>Select Customer</Label>
          <div className="flex gap-2">
            <Combobox
              options={customers.map(customer => ({ value: customer.id, label: customer.name }))}
              value={selectedCustomerId}
              onValueChange={handleCustomerSelect}
              placeholder="Choose a customer..."
              searchPlaceholder="Search customers..."
              emptyMessage="No customers found."
              buttonWidth="flex-1"
            />
            {(!readOnly || showAddButtonInReadOnly) && onAddCustomer && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onAddCustomer}
                className="shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {(selectedCustomerId || (readOnly && clientName)) && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4} className="bg-muted font-semibold">
                <div className="flex items-center justify-between">
                  <span>Client Information</span>
                  <div className="flex items-center gap-2">
                    {onClearCustomer && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={onClearCustomer}
                        className="shrink-0"
                        title="Clear customer"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                    {onEditCustomer && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onEditCustomer}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium w-1/4">Client Name</TableCell>
              <TableCell className="w-1/4">{clientName}</TableCell>
              <TableCell className="bg-muted/50 font-medium w-1/4">Client Email</TableCell>
              <TableCell className="w-1/4">{clientEmail}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium">Client Address</TableCell>
              <TableCell colSpan={showVAT ? 1 : 3}>{clientAddress}</TableCell>
              {showVAT && (
                <>
                  <TableCell className="bg-muted/50 font-medium">Client VAT Number</TableCell>
                  <TableCell>{clientVAT}</TableCell>
                </>
              )}
            </TableRow>
          </TableBody>
        </Table>
      )}
    </>
  );
}
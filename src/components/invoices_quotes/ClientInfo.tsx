'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { Plus, Edit } from 'lucide-react';

interface EditableTableCellProps {
  value: string;
  type?: 'text' | 'email';
  onSave: (value: string) => void;
  className?: string;
}

function EditableTableCell({ value, type = 'text', onSave, className }: EditableTableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  if (isEditing) {
    return (
      <TableCell className={`${className} p-0`}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          type={type}
          autoFocus
          className="h-8 border-2 border-primary bg-background px-2 py-1 shadow-sm focus-visible:ring-1"
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      className={`${className} cursor-pointer hover:bg-accent transition-colors group relative`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center justify-between">
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {value || "Double-click to edit"}
        </span>
        <div className="opacity-0 group-hover:opacity-70 transition-opacity text-xs text-muted-foreground">
          ✏️
        </div>
      </div>
    </TableCell>
  );
}

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
}: ClientInfoProps) {
  const handleCustomerSelect = (customerId: string) => {
    onCustomerSelect(customerId);
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      onClientNameChange(customer.name);
      onClientEmailChange(customer.email);
      onClientAddressChange(customer.address || '');
    }
  };

  return (
    <>
      {!readOnly && (
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
            {onAddCustomer && (
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

      {readOnly ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4} className="bg-muted font-semibold">
                <div className="flex items-center justify-between">
                  <span>Client Information</span>
                  {onEditCustomer && (
                    <Button
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
      ) : selectedCustomerId ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={4} className="bg-muted font-semibold">Client Information</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium w-1/4">Client Name</TableCell>
              <EditableTableCell
                value={clientName}
                onSave={onClientNameChange}
                className="font-medium w-1/4"
              />
              <TableCell className="bg-muted/50 font-medium w-1/4">Client Email</TableCell>
              <EditableTableCell
                value={clientEmail}
                type="email"
                onSave={onClientEmailChange}
                className="w-1/4"
              />
            </TableRow>
            <TableRow>
              <TableCell className="bg-muted/50 font-medium">Client Address</TableCell>
              <EditableTableCell
                value={clientAddress}
                onSave={onClientAddressChange}
              />
              {showVAT ? (
                <>
                  <TableCell className="bg-muted/50 font-medium">Client VAT Number</TableCell>
                  <EditableTableCell
                    value={clientVAT}
                    onSave={(value) => onClientVATChange?.(value)}
                  />
                </>
              ) : (
                <>
                  <TableCell className="border-none"></TableCell>
                  <TableCell className="border-none"></TableCell>
                </>
              )}
            </TableRow>
          </TableBody>
        </Table>
      ) : null}
    </>
  );
}
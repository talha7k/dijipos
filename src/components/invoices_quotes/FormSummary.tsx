'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrency } from '@/lib/hooks/useCurrency';

interface EditableTableCellProps {
  value: string | number;
  type?: 'text' | 'number' | 'date';
  step?: string;
  min?: string;
  onSave?: (value: string | number) => void;
  className?: string;
}

function EditableTableCell({ value, type = 'text', step, min, onSave, className }: EditableTableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleDoubleClick = () => {
    if (!onSave) return;
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleSave = () => {
    if (!onSave) return;
    const newValue = type === 'number' ? parseFloat(editValue) || 0 : editValue;
    onSave(newValue);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value.toString());
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
          step={step}
          min={min}
          autoFocus
          className="h-8 border-2 border-primary bg-background px-2 py-1 shadow-sm focus-visible:ring-1"
        />
      </TableCell>
    );
  }

  return (
    <TableCell
      className={`${className} ${onSave ? 'cursor-pointer hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group relative' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center justify-between">
        <span className={!value ? "text-muted-foreground italic" : ""}>
          {type === 'number' && step === '0.01' ? `$${value}` : value || (onSave ? "Double-click to edit" : "")}
        </span>
        {onSave && (
          <div className="opacity-0 group-hover:opacity-70 transition-opacity text-xs text-muted-foreground">
            ✏️
          </div>
        )}
      </div>
    </TableCell>
  );
}

interface FormSummaryProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  dueDate?: string;
  showDueDate?: boolean;
  onTaxRateChange?: (rate: number) => void;
  onDueDateChange?: (date: string) => void;
  mode?: 'quote' | 'invoice';
  isVatEnabled?: boolean;
  isVatInclusive?: boolean;
}

export default function FormSummary({
  subtotal,
  taxRate,
  taxAmount,
  total,
  dueDate,
  showDueDate = false,
  onTaxRateChange,
  onDueDateChange,
  mode = 'quote',
  isVatEnabled = true,
  isVatInclusive = false,
}: FormSummaryProps) {
  const { formatCurrency } = useCurrency();
  const title = mode === 'invoice' ? 'Invoice Summary' : 'Quote Summary';

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">{title}</Label>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-muted font-semibold">Description</TableHead>
            <TableHead className="bg-muted font-semibold text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>Subtotal</TableCell>
            <TableCell className="text-right font-medium">{formatCurrency(subtotal)}</TableCell>
          </TableRow>
          {isVatEnabled && (
            <TableRow>
              <EditableTableCell
                value={`Tax Rate (${taxRate}%) ${isVatInclusive ? '(Inclusive)' : '(Exclusive)'}`}
                type="number"
                step="0.01"
                min="0"
                onSave={onTaxRateChange ? (value) => onTaxRateChange(typeof value === 'number' ? value : parseFloat(value.toString()) || 0) : undefined}
                className="font-medium"
              />
              <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
            </TableRow>
          )}
          {showDueDate && onDueDateChange && (
            <TableRow>
              <TableCell className="font-medium">Due Date</TableCell>
              <EditableTableCell
                value={dueDate || ''}
                type="date"
                onSave={(value) => onDueDateChange(value.toString())}
                className="text-right"
              />
            </TableRow>
          )}
          <TableRow className="border-t-2">
            <TableCell className="font-bold text-lg">Total</TableCell>
            <TableCell className="text-right font-bold text-lg">{formatCurrency(total)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
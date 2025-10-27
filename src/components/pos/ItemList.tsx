'use client';

import { Item, InvoiceItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Edit } from 'lucide-react';
import { truncateTextByType } from '@/lib/utils';
import { useCurrency } from '@/lib/hooks/useCurrency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';





interface EditableTableRowProps {
  item: Item | InvoiceItem;
  index: number;
  onRemove: (index: number) => void;
  onEdit?: (index: number) => void;
  onUpdateQuantity?: (index: number, quantity: number) => void;
}

function EditableTableRow({ item, index, onRemove, onEdit, onUpdateQuantity }: EditableTableRowProps) {
  const { formatCurrency } = useCurrency();
  const quantity = 'quantity' in item ? item.quantity : 0;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && onUpdateQuantity) {
      onUpdateQuantity(index, newQuantity);
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium" title={item.name}>{truncateTextByType(item.name, 'medium')}</TableCell>
      <TableCell className="text-muted-foreground" title={item.description}>{truncateTextByType(item.description, 'medium')}</TableCell>
      <TableCell className="text-center">
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="h-6 w-6 p-0"
          >
            -
          </Button>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => {
              const newQuantity = parseInt(e.target.value) || 1;
              if (newQuantity >= 1) {
                handleQuantityChange(newQuantity);
              }
            }}
            className="w-16 h-6 text-center text-sm"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="h-6 w-6 p-0"
          >
            +
          </Button>
        </div>
      </TableCell>
      <TableCell className="text-right">{formatCurrency('unitPrice' in item ? item.unitPrice : 0)}</TableCell>
      <TableCell className="text-right font-medium">{formatCurrency('total' in item ? item.total : 0)}</TableCell>
      <TableCell className="text-muted-foreground" title={'notes' in item ? item.notes : ''}>{truncateTextByType('notes' in item ? item.notes : '', 'medium')}</TableCell>
      <TableCell className="text-center">
        <div className="flex gap-1 justify-center">
          {onEdit && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(index)}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface ReadOnlyTableRowProps {
  item: Item | InvoiceItem;
  index: number;
  onRemove?: (index: number) => void;
  showDelete?: boolean;
}

function ReadOnlyTableRow({ item, index, onRemove, showDelete = false }: ReadOnlyTableRowProps) {
  const { formatCurrency } = useCurrency();

  return (
    <TableRow>
      <TableCell className="font-medium" title={item.name}>{truncateTextByType(item.name, 'medium')}</TableCell>
      <TableCell className="text-muted-foreground" title={item.description}>{truncateTextByType(item.description, 'medium')}</TableCell>
      <TableCell className="text-center">{'quantity' in item ? item.quantity : 0}</TableCell>
      <TableCell className="text-right">{formatCurrency('unitPrice' in item ? item.unitPrice : 0)}</TableCell>
      <TableCell className="text-right font-medium">{formatCurrency('total' in item ? item.total : 0)}</TableCell>
      <TableCell className="text-muted-foreground" title={'notes' in item ? item.notes : ''}>{truncateTextByType('notes' in item ? item.notes : '', 'medium')}</TableCell>
      {showDelete && (
        <TableCell className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove?.(index)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </TableCell>
      )}
    </TableRow>
  );
}

interface ItemListProps {
  items: Item[] | InvoiceItem[];
  mode: 'editable' | 'readonly';
  onRemove?: (index: number) => void;
  onEdit?: (index: number) => void;
  onUpdateQuantity?: (index: number, quantity: number) => void;
}

export default function ItemList({ items, mode, onRemove, onEdit, onUpdateQuantity }: ItemListProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="bg-muted font-semibold">Name</TableHead>
          <TableHead className="bg-muted font-semibold">Description</TableHead>
          <TableHead className="bg-muted font-semibold text-center">Qty</TableHead>
          <TableHead className="bg-muted font-semibold text-right">Unit Price</TableHead>
          <TableHead className="bg-muted font-semibold text-right">Total</TableHead>
          <TableHead className="bg-muted font-semibold">Notes</TableHead>
          {(mode === 'editable' || onRemove) && <TableHead className="bg-muted font-semibold text-center">Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => {
          if (mode === 'editable') {
            return (
              <EditableTableRow
                key={item.id}
                item={item}
                index={index}
                onRemove={onRemove || (() => {})}
                onEdit={onEdit}
                onUpdateQuantity={onUpdateQuantity}
              />
            );
          }
          return (
            <ReadOnlyTableRow
              key={item.id}
              item={item}
              index={index}
              onRemove={onRemove}
              showDelete={!!onRemove}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
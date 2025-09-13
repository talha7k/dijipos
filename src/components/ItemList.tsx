'use client';

import { useState } from 'react';
import { Item } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface EditableTableCellProps {
  value: string | number;
  type?: 'text' | 'number';
  step?: string;
  min?: string;
  onSave: (value: string | number) => void;
  className?: string;
}

function EditableTableCell({ value, type = 'text', step, min, onSave, className }: EditableTableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditValue(value.toString());
  };

  const handleSave = () => {
    const newValue = type === 'number' ? (step === '0.01' ? parseFloat(editValue) || 0 : parseInt(editValue) || 0) : editValue;
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

  const displayValue = type === 'number' && step === '0.01' ? `$${value}` : value;

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
      className={`${className} cursor-pointer hover:bg-accent transition-colors group relative`}
      onDoubleClick={handleDoubleClick}
    >
      <div className="flex items-center justify-between">
        <span className={!displayValue ? "text-muted-foreground italic" : ""}>
          {displayValue || "Double-click to edit"}
        </span>
        <div className="opacity-0 group-hover:opacity-70 transition-opacity text-xs text-muted-foreground">
          ✏️
        </div>
      </div>
    </TableCell>
  );
}

interface EditableTableRowProps {
  item: Item;
  index: number;
  onUpdate: (index: number, field: keyof Item, value: string | number) => void;
  onRemove: (index: number) => void;
}

function EditableTableRow({ item, index, onUpdate, onRemove }: EditableTableRowProps) {
  const handleUpdate = (field: keyof Item, value: string | number) => {
    onUpdate(index, field, value);
  };

  return (
    <TableRow>
      <EditableTableCell
        value={item.name}
        onSave={(value) => handleUpdate('name', value)}
        className="font-medium"
      />
      <EditableTableCell
        value={item.description || ''}
        onSave={(value) => handleUpdate('description', value)}
        className="text-muted-foreground"
      />
      <EditableTableCell
        value={item.quantity}
        type="number"
        min="1"
        onSave={(value) => handleUpdate('quantity', value)}
        className="text-center"
      />
      <EditableTableCell
        value={item.unitPrice}
        type="number"
        step="0.01"
        min="0"
        onSave={(value) => handleUpdate('unitPrice', value)}
        className="text-right"
      />
      <TableCell className="text-right font-medium">
        ${item.total.toFixed(2)}
      </TableCell>
      <EditableTableCell
        value={item.notes || ''}
        onSave={(value) => handleUpdate('notes', value)}
        className="text-muted-foreground"
      />
      <TableCell className="text-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(index)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

interface ReadOnlyTableRowProps {
  item: Item;
  index: number;
  onRemove?: (index: number) => void;
  showDelete?: boolean;
}

function ReadOnlyTableRow({ item, index, onRemove, showDelete = false }: ReadOnlyTableRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{item.name}</TableCell>
      <TableCell className="text-muted-foreground">{item.description || ''}</TableCell>
      <TableCell className="text-center">{item.quantity}</TableCell>
      <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
      <TableCell className="text-right font-medium">${item.total.toFixed(2)}</TableCell>
      <TableCell className="text-muted-foreground">{item.notes || ''}</TableCell>
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
  items: Item[];
  mode: 'editable' | 'readonly';
  onUpdate?: (index: number, field: keyof Item, value: string | number) => void;
  onRemove?: (index: number) => void;
}

export default function ItemList({ items, mode, onUpdate, onRemove }: ItemListProps) {
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
                onUpdate={onUpdate || (() => {})}
                onRemove={onRemove || (() => {})}
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
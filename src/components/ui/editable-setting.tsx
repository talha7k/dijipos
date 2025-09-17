'use client';

import { useState, useEffect } from 'react';
import { Check, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface EditableSettingProps<T = string | number | boolean> {
  label: string;
  value: T;
  type: 'text' | 'number' | 'switch' | 'select';
  options?: { value: string; label: string }[];
  onSave: (value: T) => Promise<void>;
  displayValue?: (value: T) => string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EditableSetting<T extends string | number | boolean>({
  label,
  value,
  type,
  options = [],
  onSave,
  displayValue,
  placeholder,
  className,
  disabled = false
}: EditableSettingProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T>(value);
  const [isSaving, setIsSaving] = useState(false);

  // Update editValue when value prop changes
  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleStartEdit = () => {
    if (disabled) return;
    setEditValue(value);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save setting:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const renderDisplayValue = () => {
    if (displayValue) return displayValue(value);

    switch (type) {
      case 'switch':
        return (
          <Badge variant={value as boolean ? 'default' : 'secondary'} className="ml-2">
            {value as boolean ? 'Enabled' : 'Disabled'}
          </Badge>
        );
      case 'select':
        const option = options.find(opt => opt.value === String(value));
        return option ? option.label : (String(value) || placeholder || 'Not selected');
      default:
        return String(value) || placeholder || 'Not set';
    }
  };

  const renderEditInput = () => {
    switch (type) {
      case 'text':
        return (
          <Input
            type="text"
            value={String(editValue)}
            onChange={(e) => setEditValue(e.target.value as T)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            disabled={isSaving}
            className="h-8"
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={Number(editValue)}
            onChange={(e) => setEditValue(Number(e.target.value) as T)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus
            disabled={isSaving}
            className="h-8"
          />
        );
      case 'switch':
        return (
          <Switch
            checked={editValue as boolean}
            onCheckedChange={(checked) => setEditValue(checked as T)}
            disabled={isSaving}
          />
        );
      case 'select':
        return (
          <Select value={String(editValue) || ''} onValueChange={(val) => setEditValue(val as T)} disabled={isSaving}>
            <SelectTrigger className="h-8">
              <SelectValue placeholder={placeholder || 'Select option'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('group flex items-center justify-between py-1', className)}>
      <span className="text-sm font-medium">{label}:</span>

      {isEditing ? (
        <div className="flex items-center gap-1">
          {renderEditInput()}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-2 p-2 rounded-lg",
            disabled && "cursor-not-allowed opacity-50"
          )}
          onDoubleClick={handleStartEdit}
        >
          <span className="text-sm">{renderDisplayValue()}</span>
          {!disabled && (
            <Edit2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Check, X, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EditableSettingProps<T = string | number | boolean> {
  label: string;
  value: T;
  type: "text" | "number" | "switch" | "select";
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
  disabled = false,
}: EditableSettingProps<T>) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<T>(value);
  const [isSaving, setIsSaving] = useState(false);
  const [key, setKey] = useState(0);

  // Update editValue when value prop changes and force re-render
  useEffect(() => {
    console.log(
      "[EditableSetting] useEffect triggered - value changed:",
      value,
    );
    console.log("[EditableSetting] Previous editValue:", editValue);
    console.log("[EditableSetting] Value comparison:", {
      newValue: value,
      oldValue: editValue,
      areEqual: value === editValue,
      type: typeof value,
      editValueType: typeof editValue,
    });
    // Only update if the values are actually different
    if (value !== editValue) {
      console.log('[EditableSetting] Values are different, updating editValue and forcing re-render');
      setEditValue(value);
      // Force re-render by updating key
      setKey((prev) => prev + 1);
    } else {
      console.log('[EditableSetting] Values are the same, skipping update');
    }
  }, [value, editValue]);

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
      console.log("[EditableSetting] Saving value:", editValue);
      await onSave(editValue);
      console.log("[EditableSetting] Save successful");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save setting:", error);
      // Don't exit edit mode on error so user can try again
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWithValue = async (valueToSave: T) => {
    setIsSaving(true);
    try {
      console.log("[EditableSetting] Saving value directly:", valueToSave);
      await onSave(valueToSave);
      console.log("[EditableSetting] Save successful");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save setting:", error);
      // Don't exit edit mode on error so user can try again
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const renderDisplayValue = () => {
    console.log("[EditableSetting] renderDisplayValue called with:", {
      value,
      editValue,
      type,
    });
    const displayVal = displayValue
      ? displayValue(editValue)
      : (() => {
          switch (type) {
            case "switch":
              return (
                <Badge
                  variant={(editValue as boolean) ? "default" : "secondary"}
                  className="ml-2"
                >
                  {(editValue as boolean) ? "Enabled" : "Disabled"}
                </Badge>
              );
            case "select":
              const option = options.find(
                (opt) => opt.value === String(editValue),
              );
              console.log(
                "[EditableSetting] Select option found:",
                option,
                "for value:",
                editValue,
              );
              return option
                ? option.label
                : String(editValue) || placeholder || "Not selected";
            default:
              return String(editValue) || placeholder || "Not set";
          }
        })();

    console.log("[EditableSetting] renderDisplayValue result:", displayVal);
    return displayVal;
  };

  const renderEditInput = () => {
    switch (type) {
      case "text":
        return (
          <div className="flex items-center gap-2">
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
            {isSaving && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
          </div>
        );
      case "number":
        return (
          <div className="flex items-center gap-2">
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
            {isSaving && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
          </div>
        );
      case "switch":
        return (
          <div className="flex items-center gap-2">
            <Switch
              checked={editValue as boolean}
              onCheckedChange={(checked) => setEditValue(checked as T)}
              disabled={isSaving}
            />
            {isSaving && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
          </div>
        );
      case "select":
        return (
          <div className="flex items-center gap-2">
            <Select
              value={String(editValue) || ""}
              onValueChange={(val) => {
                console.log('[EditableSetting] Select onValueChange called with:', val);
                console.log('[EditableSetting] Current options:', options);
                const selectedOption = options.find(opt => opt.value === val);
                console.log('[EditableSetting] Selected option:', selectedOption);
                setEditValue(val as T);
                // Auto-save for select type - pass the new value directly to avoid race condition
                handleSaveWithValue(val as T);
              }}
              disabled={isSaving}
            >
              <SelectTrigger className="h-8">
                <SelectValue placeholder={placeholder || "Select option"} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isSaving && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      key={key}
      className={cn("group flex items-center justify-between py-1", className)}
    >
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
            disabled && "cursor-not-allowed opacity-50",
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

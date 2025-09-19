"use client";

import { useState, useEffect } from "react";
import { Check, X, Edit2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  type: "text" | "number" | "switch" | "select" | "textarea";
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
    // Only update if the values are actually different and we're not editing
    if (value !== editValue && !isEditing) {
      setEditValue(value);
      // Force re-render by updating key
      setKey((prev) => prev + 1);
    }
  }, [value, editValue, isEditing]);

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
      console.error("Failed to save setting:", error);
      // Don't exit edit mode on error so user can try again
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveWithValue = async (valueToSave: T) => {
    setIsSaving(true);
    try {
      await onSave(valueToSave);
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
    const displayVal = displayValue
      ? displayValue(editValue)
      : (() => {
          switch (type) {
            case "switch":
              return (
                <Badge variant="secondary" className="ml-2 bg-muted">
                  {(editValue as boolean) ? "Enabled" : "Disabled"}
                </Badge>
              );
            case "select":
              const option = options.find(
                (opt) => opt.value === String(editValue),
              );
              return option
                ? option.label
                : String(editValue) || placeholder || "Not selected";
            default:
              return String(editValue) || placeholder || "Not set";
          }
        })();

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
              className="h-10 px-4 py-2 border-2 border-input focus:border-ring bg-muted w-full"
            />
            {isSaving && <Loader size="sm" className="text-muted-foreground" />}
          </div>
        );
      case "textarea":
        return (
          <div className="flex items-center gap-2">
            <Textarea
              value={String(editValue)}
              onChange={(e) => setEditValue(e.target.value as T)}
              placeholder={placeholder}
              autoFocus
              disabled={isSaving}
              className="min-h-20 px-4 py-2 border-2 border-input focus:border-ring bg-muted w-full resize-none"
            />
            {isSaving && <Loader size="sm" className="text-muted-foreground" />}
          </div>
        );
      case "number":
        return (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={String(editValue)}
              onChange={(e) => setEditValue(Number(e.target.value) as T)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              autoFocus
              disabled={isSaving}
              className="h-10 px-4 py-2 border-2 border-input focus:border-ring bg-muted w-full"
            />
            {isSaving && <Loader size="sm" className="text-muted-foreground" />}
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
            {isSaving && <Loader size="sm" className="text-muted-foreground" />}
          </div>
        );
      case "select":
        return (
          <div className="flex items-center gap-2">
            <Select
              value={String(editValue) || ""}
              onValueChange={(val) => {
                setEditValue(val as T);
              }}
              disabled={isSaving}
            >
              <SelectTrigger className="h-10 px-4 py-2 border-2 border-input focus:border-ring bg-muted/20 w-full">
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
            {isSaving && <Loader size="sm" className="text-muted-foreground" />}
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

      {isEditing && type !== "select" ? (
        <div className="flex items-center gap-1 flex-1">
          {renderEditInput()}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : isEditing && type === "select" ? (
        <div className="flex items-center gap-1 flex-1">
          {renderEditInput()}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <Check className="h-3 w-3" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          className={cn(
            "flex items-center justify-between cursor-pointer flex-1 px-2 mx-2 p-2 rounded-lg hover:bg-muted/20",
            type === "switch"
              ? "justify-end"
              : "bg-muted border border-input hover:bg-muted/20 hover:border-ring",
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

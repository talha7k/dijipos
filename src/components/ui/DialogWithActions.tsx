import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DialogWithActionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions: React.ReactNode;
  trigger?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
}

export function DialogWithActions({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions,
  trigger,
  className,
  contentClassName,
  maxWidth = "max-w-4xl",
}: DialogWithActionsProps) {
  const content = (
    <DialogContent className={cn(maxWidth, className)}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>

      {/* Scrollable Content Area */}
      <div className={cn("flex-1 overflow-y-auto pr-1", contentClassName)}>
        {children}
      </div>

      {/* Fixed Footer with Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t bg-background">
        {actions}
      </div>
    </DialogContent>
  );

  if (trigger) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        {content}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {content}
    </Dialog>
  );
}
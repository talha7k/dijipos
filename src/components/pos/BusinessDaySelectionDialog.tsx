import * as React from "react";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogPortal,
  DialogOverlay,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface BusinessDaySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date) => void;
  currentDate?: Date | null;
  title?: string;
  description?: string;
}

export function BusinessDaySelectionDialog({
  open,
  onOpenChange,
  onDateSelect,
  currentDate = null,
  title = "Select Date",
  description = "Choose the date for this operation",
}: BusinessDaySelectionDialogProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    currentDate || new Date(),
  );

  // Reset selected date when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedDate(currentDate || new Date());
    }
  }, [open, currentDate]);

  const handleSave = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
      onOpenChange(false);
    }
  };

  

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      // Only allow closing if a date is selected
      if (!newOpen && !selectedDate) {
        return;
      }
      onOpenChange(newOpen);
    }}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 max-w-2xl max-h-[90vh] overflow-y-auto xl:max-w-[70vw]"
          onPointerDownOutside={(e) => {
            // Prevent closing by clicking outside
            e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            // Prevent closing with Escape key
            e.preventDefault();
          }}
        >
          {/* Fixed Header Section */}
          <div className="flex-shrink-0">
            <div className="flex items-center justify-between pb-4 border-b">
              <div className="flex-1">
                <DialogHeader className="space-y-1">
                  <DialogTitle>{title}</DialogTitle>
                  <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
              </div>

              <div className="flex items-center gap-4">
                {/* Actions */}
                <div className="flex gap-2 mr-10">
                  <Button onClick={handleSave} disabled={!selectedDate}>
                    <Check className="w-4 h-4 mr-2" />
                    Save Date
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Left column - Calendar */}
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full max-w-[280px]">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="rounded-md border"
                  />
                </div>
              </div>

              {/* Right column - Selected date and quick buttons */}
              <div className="flex flex-col items-center justify-center space-y-6">
                {/* Current selected date display */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Business Day Selected
                  </p>
                  <div className="text-3xl font-bold text-primary">
                    {selectedDate ? format(selectedDate, "PPP") : "No date selected"}
                  </div>
                </div>

                {/* Quick date buttons */}
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const yesterday = new Date();
                      yesterday.setDate(yesterday.getDate() - 1);
                      setSelectedDate(yesterday);
                    }}
                  >
                    Yesterday
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(tomorrow);
                    }}
                  >
                    Tomorrow
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

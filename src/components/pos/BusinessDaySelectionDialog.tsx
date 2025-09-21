import * as React from "react";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { cn } from "@/lib/utils";

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

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <DialogWithActions
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      maxWidth="max-w-2xl"
      actions={
        <>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedDate}>
            <Check className="w-4 h-4 mr-2" />
            Save Date
          </Button>
        </>
      }
    >
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
    </DialogWithActions>
  );
}

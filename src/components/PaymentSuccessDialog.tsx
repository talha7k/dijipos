"use client";

import { CheckCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface PaymentSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  totalPaid: number;
  onViewOrders?: () => void;
}

export function PaymentSuccessDialog({
  isOpen,
  onClose,
  totalPaid,
}: PaymentSuccessDialogProps) {
  const handleClose = () => {
    onClose();
  };

  // Only render if we have valid data and dialog should be open
  if (!isOpen || totalPaid <= 0) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Payment Processed Successfully!
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground text-sm text-center space-y-2">
              <div className="text-lg font-semibold text-green-600">
                Total Paid: ${totalPaid.toFixed(2)}
              </div>
              <div>Payment processed successfully!</div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogAction onClick={handleClose} className="w-full sm:w-auto">
            Return
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

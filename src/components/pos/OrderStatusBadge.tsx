import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard, CircleDollarSign } from "lucide-react";
import { QueueBadge } from "./QueueBadge";
import { PaymentStatus } from "@/types"; // Import PaymentStatus enum

interface OrderStatusBadgeProps {
  paymentStatus: PaymentStatus; // Changed from isPaid: boolean
  queueNumber?: string | number;
  showQueueBadge?: boolean;
  className?: string;
}

export function OrderStatusBadge({
  paymentStatus,
  queueNumber,
  showQueueBadge = true,
  className = "",
}: OrderStatusBadgeProps) {
  const getPaymentStatusDisplay = () => {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </>
        );
      case PaymentStatus.PARTIAL:
        return (
          <>
            <CircleDollarSign className="h-3 w-3 mr-1" />
            Partial
          </>
        );
      case PaymentStatus.UNPAID:
      default:
        return (
          <>
            <CreditCard className="h-3 w-3 mr-1" />
            Unpaid
          </>
        );
    }
  };

  const getPaymentStatusColor = () => {
    switch (paymentStatus) {
      case PaymentStatus.PAID:
        return "bg-emerald-500";
      case PaymentStatus.PARTIAL:
        return "bg-orange-500";
      case PaymentStatus.UNPAID:
      default:
        return "bg-destructive";
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Payment Status Badge */}
      <Badge
        className={`${getPaymentStatusColor()} text-white w-full justify-center py-2`}
      >
        {getPaymentStatusDisplay()}
      </Badge>

      {/* Queue Number Badge */}
      {showQueueBadge && queueNumber && (
        <QueueBadge queueNumber={queueNumber} />
      )}
    </div>
  );
}
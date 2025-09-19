import { Badge } from "@/components/ui/badge";
import { CheckCircle, CreditCard } from "lucide-react";
import { QueueBadge } from "./QueueBadge";

interface OrderStatusBadgeProps {
  isPaid: boolean;
  queueNumber?: string | number;
  showQueueBadge?: boolean;
  className?: string;
}

export function OrderStatusBadge({
  isPaid,
  queueNumber,
  showQueueBadge = true,
  className = "",
}: OrderStatusBadgeProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Payment Status Badge */}
      <Badge
        className={`${
          isPaid ? "bg-emerald-500" : "bg-destructive"
        } text-white w-full justify-center py-2`}
      >
        {isPaid ? (
          <>
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </>
        ) : (
          <>
            <CreditCard className="h-3 w-3 mr-1" />
            Unpaid
          </>
        )}
      </Badge>

      {/* Queue Number Badge */}
      {showQueueBadge && queueNumber && (
        <QueueBadge queueNumber={queueNumber} />
      )}
    </div>
  );
}
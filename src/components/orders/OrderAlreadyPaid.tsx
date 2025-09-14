import { CheckCircle } from "lucide-react";

interface OrderAlreadyPaidProps {
  orderNumber: string;
}

export function OrderAlreadyPaid({ orderNumber }: OrderAlreadyPaidProps) {
  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-green-800">Order Already Paid</h3>
          <p className="text-sm text-green-700">
            Order #{orderNumber} has been paid for. No further payments can be processed.
          </p>
        </div>
      </div>
    </div>
  );
}
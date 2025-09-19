import { Badge } from "@/components/ui/badge";
import { Hash } from "lucide-react";

interface QueueBadgeProps {
  queueNumber: string | number;
  className?: string;
}

export function QueueBadge({ queueNumber, className = "" }: QueueBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={`text-sm flex items-center gap-1 border-2 border-red-500 justify-center py-1 ${className}`}
    >
      <Hash className="h-3 w-3" />
      {queueNumber}
    </Badge>
  );
}
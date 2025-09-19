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
      className={`text-sm flex items-center gap-1 border-2 border-muted justify-center py-1 ${className}`}
    >
      <Hash className="h-5 w-5 text-red-500" />
      {queueNumber}
    </Badge>
  );
}

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Pause, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';

interface OrderStatusSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusSelect: (status: OrderStatus) => void;
  currentStatus?: OrderStatus;
  isPaid: boolean;
}

export function OrderStatusSelectionDialog({
  open,
  onOpenChange,
  onStatusSelect,
  currentStatus,
  isPaid
}: OrderStatusSelectionDialogProps) {
  
  const statusOptions = [
    {
      value: OrderStatus.COMPLETED,
      label: 'Completed',
      description: 'Order is finished and closed',
      icon: CheckCircle,
      color: 'bg-green-500',
      recommended: isPaid,
      disabled: !isPaid
    },
    {
      value: OrderStatus.ON_HOLD,
      label: 'On Hold',
      description: 'Order is reserved but not yet active',
      icon: Pause,
      color: 'bg-orange-500',
      recommended: false,
      disabled: false
    },
    {
      value: OrderStatus.OPEN,
      label: 'Open',
      description: 'Order is active and can be modified',
      icon: Clock,
      color: 'bg-yellow-500',
      recommended: false,
      disabled: false
    },
    {
      value: OrderStatus.CANCELLED,
      label: 'Cancelled',
      description: 'Order is cancelled and closed',
      icon: XCircle,
      color: 'bg-red-500',
      recommended: false,
      disabled: false
    }
  ];

  const handleStatusSelect = (status: OrderStatus) => {
    onStatusSelect(status);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Order Status</DialogTitle>
          <DialogDescription>
            Choose what status you want to set for this order. 
            {isPaid && " Since the order is paid, 'Completed' is recommended."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = currentStatus === option.value;
            const isRecommended = option.recommended;
            
            return (
              <Button
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 justify-start text-left relative ${
                  isRecommended ? 'ring-2 ring-green-500 ring-offset-2' : ''
                } ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-accent'}`}
                onClick={() => !option.disabled && handleStatusSelect(option.value)}
                disabled={option.disabled}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    <Badge className={`${option.color} text-white`}>
                      {option.label}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{option.label}</span>
                      {isRecommended && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                          Recommended
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                    {option.disabled && (
                      <p className="text-xs text-destructive mt-1">
                        Order must be paid first
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
              </Button>
            );
          })}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
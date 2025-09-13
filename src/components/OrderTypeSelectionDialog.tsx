'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderType } from '@/types';
import { ShoppingBag, Truck, UtensilsCrossed } from 'lucide-react';

interface OrderTypeSelectionDialogProps {
  orderTypes: OrderType[];
  selectedOrderType: OrderType | null;
  onOrderTypeSelect: (orderType: OrderType) => void;
  children: React.ReactNode;
}

const getOrderTypeIcon = (orderTypeName: string) => {
  const name = orderTypeName.toLowerCase();
  if (name.includes('dine') || name.includes('restaurant') || name.includes('table')) {
    return <UtensilsCrossed className="h-6 w-6" />;
  } else if (name.includes('take') || name.includes('away')) {
    return <ShoppingBag className="h-6 w-6" />;
  } else if (name.includes('delivery') || name.includes('deliver')) {
    return <Truck className="h-6 w-6" />;
  }
  return <ShoppingBag className="h-6 w-6" />;
};

export function OrderTypeSelectionDialog({
  orderTypes,
  selectedOrderType,
  onOrderTypeSelect,
  children
}: OrderTypeSelectionDialogProps) {
  const [open, setOpen] = useState(false);

  const handleOrderTypeSelect = (orderType: OrderType) => {
    onOrderTypeSelect(orderType);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Order Type</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {orderTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No order types configured</p>
              <p className="text-sm mt-2">Please add order types in settings</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {orderTypes.map((orderType) => (
                <Button
                  key={orderType.id}
                  variant={selectedOrderType?.id === orderType.id ? "default" : "outline"}
                  className="h-auto p-4 justify-start"
                  onClick={() => handleOrderTypeSelect(orderType)}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-primary">
                      {getOrderTypeIcon(orderType.name)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium">{orderType.name}</div>
                      {orderType.description && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {orderType.description}
                        </div>
                      )}
                    </div>
                    {selectedOrderType?.id === orderType.id && (
                      <Badge variant="secondary" className="ml-auto">
                        Selected
                      </Badge>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
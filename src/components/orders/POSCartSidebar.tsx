import { Button } from '@/components/ui/button';
import { ShoppingCart, Save, Printer, Trash2 } from 'lucide-react';
import { POSCartItem } from './POSCartItem';
import { ReceiptPrintDialog } from '@/components/ReceiptPrintDialog';
import { Order, OrderStatus, ItemType } from '@/types';
import { useAuthState } from '@/hooks/useAuthState';
import { useOrderState } from '@/hooks/useOrderState';
import { usePrinterSettingsData } from '@/hooks/organization/use-printer-settings-data';
import { useReceiptTemplatesData } from '@/hooks/use-receipt-templates-data';

interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface POSCartSidebarProps {
  cartItems: CartItem[];
  cartTotal: number;
  onPayOrder?: () => void;
  onSaveOrder?: () => void;
  onPrintReceipt?: () => void;
  onClearCart?: () => void;
  onItemClick?: (item: CartItem) => void;
}

export function POSCartSidebar({
  cartItems,
  cartTotal,
  onPayOrder,
  onSaveOrder,
  onPrintReceipt,
  onClearCart,
  onItemClick
}: POSCartSidebarProps) {
  const { selectedOrganization } = useAuthState();
  const { selectedTable, selectedCustomer, selectedOrderType } = useOrderState();
  const organizationId = selectedOrganization?.id || '';
  const { printerSettings } = usePrinterSettingsData(selectedOrganization?.id || undefined);
  const { receiptTemplates = [] } = useReceiptTemplatesData(selectedOrganization?.id || '');

  const createTempOrderForPayment = () => {
    if (cartItems.length === 0) return null;

    return {
      id: 'temp-checkout',
      organizationId: organizationId || '',
      orderNumber: `TEMP-${Date.now()}`,
      items: cartItems.map(item => ({
        id: `${item.type}-${item.id}`,
        type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
        ...(item.type === 'product' && item.id !== undefined && { productId: item.id }),
        ...(item.type === 'service' && item.id !== undefined && { serviceId: item.id }),
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.price,
        total: item.total,
      })),
      subtotal: cartTotal,
      taxRate: 0,
      taxAmount: 0,
      total: cartTotal,
      status: OrderStatus.OPEN,
      paid: false,
      orderType: selectedOrderType?.name || 'dine-in',
      ...(selectedCustomer?.name !== undefined && { customerName: selectedCustomer.name }),
      ...(selectedCustomer?.phone !== undefined && { customerPhone: selectedCustomer.phone }),
      ...(selectedCustomer?.email !== undefined && { customerEmail: selectedCustomer.email }),
      ...(selectedTable?.id !== undefined && { tableId: selectedTable.id }),
      ...(selectedTable?.name !== undefined && { tableName: selectedTable.name }),
      createdById: 'temp-user',
      createdByName: 'POS User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  return (
    <div className="w-full min-w-80 bg-card border-l flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4">
        {cartItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
             {cartItems.map((item) => (
              <POSCartItem
                key={`${item.type}-${item.id}`}
                item={item}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-card">
        <div className="flex justify-between mb-2">
          <span className="font-medium text-sm text-muted-foreground">Items:</span>
          <span className="font-medium text-sm text-muted-foreground">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="font-medium text-lg text-foreground">Total:</span>
          <span className="font-bold text-xl text-foreground">${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex gap-2 mb-2">
          {onSaveOrder && (
            <Button
              variant="outline"
              className="flex-1 h-12 text-sm font-medium"
              disabled={cartItems.length === 0}
              onClick={onSaveOrder}
            >
              <Save className="h-5 w-5" />
            </Button>
          )}
            {selectedOrganization && cartItems.length > 0 && (
              <ReceiptPrintDialog
                order={createTempOrderForPayment()!}
                organization={selectedOrganization}
                receiptTemplates={receiptTemplates}
                payments={[]}
              >
               <Button
                 variant="outline"
                 className="flex-1 h-12 text-sm font-medium"
                 disabled={cartItems.length === 0}
               >
                 <Printer className="h-5 w-5" />
               </Button>
             </ReceiptPrintDialog>
           )}
          {onClearCart && (
            <Button
              variant="outline"
              className="flex-1 h-12 text-sm font-medium"
              disabled={cartItems.length === 0}
              onClick={onClearCart}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Button
          className="w-full h-14 text-lg font-bold"
          disabled={cartItems.length === 0}
          onClick={onPayOrder}
        >
          Pay & Complete
        </Button>
      </div>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { ShoppingCart, Save, Printer, Trash2 } from 'lucide-react';
import { POSCartItem } from './POSCartItem';
import { ReceiptPrintDialog } from '@/components/ReceiptPrintDialog';
import { Order, OrderStatus, ItemType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useOrderContext } from '@/contexts/OrderContext';
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
  cart: CartItem[];
  cartTotal: number;
  onPayOrder?: () => void;
  onSaveOrder?: () => void;
  onPrintReceipt?: () => void;
  onClearCart?: () => void;
  onItemClick?: (item: CartItem) => void;
}

export function POSCartSidebar({
  cart,
  cartTotal,
  onPayOrder,
  onSaveOrder,
  onPrintReceipt,
  onClearCart,
  onItemClick
}: POSCartSidebarProps) {
  const { currentOrganization } = useAuth();
  const { selectedTable, selectedCustomer, selectedOrderType, organizationId } = useOrderContext();
  const { printerSettings } = usePrinterSettingsData(currentOrganization?.id || undefined);
  const { receiptTemplates = [] } = useReceiptTemplatesData(currentOrganization?.id || '');

  const createTempOrderForPayment = () => {
    if (cart.length === 0) return null;

    return {
      id: 'temp-checkout',
      organizationId: organizationId || '',
      orderNumber: `TEMP-${Date.now()}`,
      items: cart.map(item => ({
        id: `${item.type}-${item.id}`,
        type: item.type === 'product' ? ItemType.PRODUCT : ItemType.SERVICE,
        productId: item.type === 'product' ? item.id : undefined,
        serviceId: item.type === 'service' ? item.id : undefined,
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
      customerName: selectedCustomer?.name,
      customerPhone: selectedCustomer?.phone,
      customerEmail: selectedCustomer?.email,
      tableId: selectedTable?.id,
      tableName: selectedTable?.name,
      createdById: 'temp-user',
      createdByName: 'POS User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  return (
    <div className="w-full min-w-80 bg-card border-l flex flex-col h-full">

      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
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
          <span className="font-medium text-sm text-muted-foreground">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
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
              disabled={cart.length === 0}
              onClick={onSaveOrder}
            >
              <Save className="h-5 w-5" />
            </Button>
          )}
            {currentOrganization && cart.length > 0 && (
              <ReceiptPrintDialog
                order={createTempOrderForPayment()!}
                organization={currentOrganization}
                receiptTemplates={receiptTemplates}
                printerSettings={printerSettings || null}
              >
               <Button
                 variant="outline"
                 className="flex-1 h-12 text-sm font-medium"
                 disabled={cart.length === 0}
               >
                 <Printer className="h-5 w-5" />
               </Button>
             </ReceiptPrintDialog>
           )}
          {onClearCart && (
            <Button
              variant="outline"
              className="flex-1 h-12 text-sm font-medium"
              disabled={cart.length === 0}
              onClick={onClearCart}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>
        <Button
          className="w-full h-14 text-lg font-bold"
          disabled={cart.length === 0}
          onClick={onPayOrder}
        >
          Pay & Complete
        </Button>
      </div>
    </div>
  );
}
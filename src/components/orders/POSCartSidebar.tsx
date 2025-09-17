import { Button } from '@/components/ui/button';
import { ShoppingCart, Save, Printer, RotateCcw } from 'lucide-react';
import { ClearOrderDialog } from '@/components/ui/clear-order-dialog';
import { POSCartItem } from './POSCartItem';
import { ReceiptPrintDialog } from '@/components/ReceiptPrintDialog';
import { Order, OrderStatus, ItemType, OrderPayment } from '@/types';
import { useAtomValue } from 'jotai';
import { selectedOrganizationAtom } from '@/atoms/organizationAtoms';
import { selectedTableAtom, selectedCustomerAtom, selectedOrderTypeAtom } from '@/atoms/posAtoms';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';
import { useTemplates } from '@/lib/hooks/useTemplates';

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
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const selectedTable = useAtomValue(selectedTableAtom);
  const selectedCustomer = useAtomValue(selectedCustomerAtom);
  const selectedOrderType = useAtomValue(selectedOrderTypeAtom);
  const organizationId = selectedOrganization?.id || '';
  const { storeSettings } = useStoreSettings();
  const { receiptTemplates = [] } = useTemplates();

  const handleClearConfirm = () => {
    if (onClearCart) onClearCart();
  };

  const createTempOrderForPayment = () => {
    if (cartItems.length === 0) return null;

    // Calculate tax (assuming 15% VAT rate for preview)
    const taxRate = 15; // Could be made configurable
    const subtotal = cartTotal;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Generate queue number for preview
    const queueNumber = Math.floor(Math.random() * 1000) + 1;

    return {
      id: 'temp-checkout',
      organizationId: organizationId || '',
      orderNumber: `TEMP-${Date.now()}`,
      queueNumber: queueNumber.toString(),
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
      subtotal: subtotal,
      taxRate: taxRate,
      taxAmount: taxAmount,
      total: total,
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
               payments={[
                 {
                   id: 'temp-payment',
                   organizationId: organizationId || '',
                   orderId: 'temp-checkout',
                   paymentMethod: 'Cash',
                   amount: createTempOrderForPayment()!.total,
                   paymentDate: new Date(),
                   createdAt: new Date(),
                 }
               ]}
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
            <ClearOrderDialog
              title="Clear Cart"
              onConfirm={handleClearConfirm}
            >
              {({ openDialog }) => (
                <Button
                  variant="outline"
                  className="flex-1 h-12 text-sm font-medium"
                  disabled={cartItems.length === 0}
                  onClick={openDialog}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>
              )}
            </ClearOrderDialog>
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
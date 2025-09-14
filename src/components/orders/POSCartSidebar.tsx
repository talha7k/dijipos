import { Button } from '@/components/ui/button';
import { ShoppingCart, Save, Printer, Trash2 } from 'lucide-react';
import { POSCartItem } from './POSCartItem';
import { ReceiptPrintDialog } from '@/components/ReceiptPrintDialog';
import { Organization, ReceiptTemplate, PrinterSettings, Order } from '@/types';

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
  organization?: Organization | null;
  printerSettings?: PrinterSettings | null;
  receiptTemplates?: ReceiptTemplate[];
  createTempOrderForPayment?: () => Order | null;
}

export function POSCartSidebar({
  cart,
  cartTotal,
  onPayOrder,
  onSaveOrder,
  onPrintReceipt,
  onClearCart,
  onItemClick,
  organization,
  printerSettings,
  receiptTemplates = [],
  createTempOrderForPayment
}: POSCartSidebarProps) {
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
           {onPrintReceipt && createTempOrderForPayment && (
             <ReceiptPrintDialog
               order={createTempOrderForPayment() || {} as Order}
               organization={organization || null}
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
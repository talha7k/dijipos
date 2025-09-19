import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardFooter } from "@/components/ui/CardFooter";
import { ShoppingCart, Save, Printer, RotateCcw } from "lucide-react";
import { ClearOrderDialog } from "@/components/ui/clear-order-dialog";
import { POSCartItem } from "./POSCartItem";
import { ReceiptPrintDialog } from "@/components/ReceiptPrintDialog";
import { OrderStatus, ItemType } from "@/types";
import { useAtomValue } from "jotai";
import { selectedOrganizationAtom } from "@/atoms";
import {
  selectedTableAtom,
  selectedCustomerAtom,
  selectedOrderTypeAtom,
  currentQueueNumberAtom,
} from "@/atoms/posAtoms";
import { useSeparatedTemplates } from "@/lib/hooks/useSeparatedTemplates";
import { useStoreSettings } from "@/lib/hooks/useStoreSettings";
import { useCurrency } from "@/lib/hooks/useCurrency";

interface CartItem {
  id: string;
  type: "product" | "service";
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface POSCartSidebarProps {
  cartItems: CartItem[];
  cartTotal: number;
  cartSubtotal?: number;
  onPayOrder?: () => void;
  onSaveOrder?: () => void;
  onClearCart?: () => void;
  onItemClick?: (item: CartItem) => void;
  userName?: string;
}

export function POSCartSidebar({
  cartItems,
  cartTotal,
  cartSubtotal,
  onPayOrder,
  onSaveOrder,
  onClearCart,
  onItemClick,
  userName,
}: POSCartSidebarProps) {
  const selectedOrganization = useAtomValue(selectedOrganizationAtom);
  const selectedTable = useAtomValue(selectedTableAtom);
  const selectedCustomer = useAtomValue(selectedCustomerAtom);
  const selectedOrderType = useAtomValue(selectedOrderTypeAtom);
  const currentQueueNumber = useAtomValue(currentQueueNumberAtom);
  const organizationId = selectedOrganization?.id || "";

  const { allReceiptTemplates: receiptTemplates = [] } = useSeparatedTemplates();
  const { storeSettings } = useStoreSettings();
  const printerSettings = storeSettings?.printerSettings;
  const { formatCurrency } = useCurrency();

  const handleClearConfirm = () => {
    if (onClearCart) onClearCart();
  };

  const total = cartTotal;

  const createTempOrderForPayment = () => {
    if (cartItems.length === 0) return null;

    // Calculate tax (assuming 15% VAT rate for preview)
    const taxRate = 15; // Could be made configurable
    const subtotal = cartTotal;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Use current queue number for preview
    const queueNumber = currentQueueNumber || 1;

    return {
      id: "temp-checkout",
      organizationId: organizationId || "",
      orderNumber: `TEMP-${Date.now()}`,
      queueNumber: queueNumber.toString(),
      items: cartItems.map((item) => ({
        id: `${item.type}-${item.id}`,
        type: item.type === "product" ? ItemType.PRODUCT : ItemType.SERVICE,
        ...(item.type === "product" &&
          item.id !== undefined && { productId: item.id }),
        ...(item.type === "service" &&
          item.id !== undefined && { serviceId: item.id }),
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
      orderType: selectedOrderType?.name || "dine-in",
      ...(selectedCustomer?.name !== undefined && {
        customerName: selectedCustomer.name,
      }),
      ...(selectedCustomer?.phone !== undefined && {
        customerPhone: selectedCustomer.phone,
      }),
      ...(selectedCustomer?.email !== undefined && {
        customerEmail: selectedCustomer.email,
      }),
      ...(selectedTable?.id !== undefined && { tableId: selectedTable.id }),
      ...(selectedTable?.name !== undefined && {
        tableName: selectedTable.name,
      }),
       createdById: "temp-user",
       createdByName: userName || "POS User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  };
  return (
    <div className="w-80 bg-card border-l flex flex-col h-full flex-shrink-0">
      <div className="flex-1 overflow-auto px-3 py-3">
        {cartItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
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

      <CardFooter>
        <div className="w-full">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              {cartItems.length > 0 && currentQueueNumber && (
                <Badge variant="secondary" className="text-sm">
                  Queue #{currentQueueNumber}
                </Badge>
              )}
              <Badge variant="outline" className="text-sm">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </Badge>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="font-bold text-xl text-foreground">
                {formatCurrency(total)}
              </div>
            </div>
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
                printerSettings={printerSettings}
                payments={[
                  {
                    id: "temp-payment",
                    organizationId: organizationId || "",
                    orderId: "temp-checkout",
                    paymentMethod: "Cash",
                    amount: createTempOrderForPayment()!.total,
                    paymentDate: new Date(),
                    createdAt: new Date(),
                  },
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
      </CardFooter>
    </div>
  );
}

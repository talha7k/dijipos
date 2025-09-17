import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClearOrderDialog } from '@/components/ui/clear-order-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, Customer, OrderType, Order } from '@/types';
import { Currency, CurrencyLocale } from '@/types/enums';
import { Users, LayoutGrid, FileText, ShoppingBag, Plus, RotateCcw, PlusCircle } from 'lucide-react';
import { OrderTypeSelectionDialog } from './OrderTypeSelectionDialog';
import { useStoreSettings } from '@/lib/hooks/useStoreSettings';

interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface POSHeaderProps {
  cartItems: CartItem[];
  cartTotal: number;
  selectedTable?: Table | null;
  selectedCustomer?: Customer | null;
  selectedOrder?: Order | null;
  orderTypes: OrderType[];
  selectedOrderType: OrderType | null;
  onTableSelect: () => void;
  onTableDeselect: () => void;
  onCustomerSelect: () => void;
  onCustomerDeselect: () => void;
  onOrdersClick: () => void;
  onOrderTypeSelect: (orderType: OrderType) => void;
  onOrderTypeDeselect: () => void;
  onOrderToggle?: () => void;
}

export function POSHeader({
  cartItems,
  cartTotal,
  selectedTable,
  selectedCustomer,
  selectedOrder,
  orderTypes,
  selectedOrderType,
  onTableSelect,
  onTableDeselect,
  onCustomerSelect,
  onCustomerDeselect,
  onOrdersClick,
  onOrderTypeSelect,
  onOrderTypeDeselect,
  onOrderToggle
}: POSHeaderProps) {
  const { storeSettings } = useStoreSettings();
  const currencySettings = storeSettings?.currencySettings;

  const handleOrderToggle = () => {
    if (onOrderToggle) onOrderToggle();
  };

  const handleConfirmNewOrder = () => {
    if (onOrderToggle) onOrderToggle();
  };

  const handleConfirmOrderReset = () => {
    if (onOrderToggle) onOrderToggle();
  };
  return (
    <div className="bg-card shadow p-3">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex flex-col items-start space-y-2 flex-1">
          <div className="flex items-center">
            {selectedOrder ? (
              cartItems.length > 0 ? (
                <ClearOrderDialog
                  title="Reset Order?"
                  description="This will clear all items from the current cart. Any unsaved changes will be lost."
                  confirmText="Reset"
                  onConfirm={handleConfirmOrderReset}
                >
                  {({ openDialog }) => (
                    <Badge
                      variant="default"
                      className="flex py-1 items-center space-x-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={openDialog}
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Order #{selectedOrder.orderNumber}</span>
                    </Badge>
                  )}
                </ClearOrderDialog>
              ) : (
                <Badge
                  variant="default"
                  className="flex py-1 items-center space-x-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleOrderToggle}
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Order #{selectedOrder.orderNumber}</span>
                </Badge>
              )
            ) : (
              <ClearOrderDialog
                title="Confirm New Order"
                onConfirm={handleConfirmNewOrder}
              >
                {({ openDialog }) => (
                  <Badge
                    variant="secondary"
                    className="flex items-center py-1 space-x-1 cursor-pointer bg-orange-100 text-orange-800 hover:bg-orange-200"
                    onClick={openDialog}
                  >
                    <PlusCircle className="h-5 w-5" />
                    <span>New Order</span>
                  </Badge>
                )}
              </ClearOrderDialog>
            )}
          </div>
          <div className="flex items-center w-full">
            <Badge className='bg-blue-500 hover:bg-blue-600 text-[10px] text-white mr-2'>{cartItems.length}</Badge>
            <Badge className='bg-green-500 hover:bg-green-600 text-[10px] text-white justify-end'>
              {new Intl.NumberFormat(currencySettings?.locale || CurrencyLocale.AR_SA, {
                style: 'currency',
                currency: currencySettings?.currency || Currency.SAR,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(cartTotal)}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Table Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedTable ? "default" : "outline"}
              size="sm"
              onClick={onTableSelect}
              onDoubleClick={onTableDeselect}
              className={`flex items-center space-x-2 ${selectedTable ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {selectedTable ? selectedTable.name : 'Table'}
              </span>
            </Button>
          </div>

          {/* Customer Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedCustomer ? "default" : "outline"}
              size="sm"
              onClick={onCustomerSelect}
              onDoubleClick={onCustomerDeselect}
              className={`flex items-center space-x-2 ${selectedCustomer ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
            >
              <Users className="h-4 w-4" />
              <span>
                {selectedCustomer ? selectedCustomer.name : 'Customer'}
              </span>
            </Button>
          </div>

          {/* Order Type Selection */}
          <div className="flex items-center space-x-2">
            <OrderTypeSelectionDialog
              orderTypes={orderTypes}
              selectedOrderType={selectedOrderType}
              onOrderTypeSelect={onOrderTypeSelect}
            >
              <Button
                variant={selectedOrderType ? "default" : "outline"}
                size="sm"
                onDoubleClick={onOrderTypeDeselect}
                className={`flex items-center space-x-2 ${selectedOrderType ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              >
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {selectedOrderType ? selectedOrderType.name : 'Order Type'}
                </span>
              </Button>
            </OrderTypeSelectionDialog>
          </div>

          {/* Orders Button */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOrdersClick}
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>Orders</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
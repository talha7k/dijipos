import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, Customer, OrderType } from '@/types';
import { Users, LayoutGrid, FileText, ShoppingBag } from 'lucide-react';
import { OrderTypeSelectionDialog } from './OrderTypeSelectionDialog';

interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface POSHeaderProps {
  cart: CartItem[];
  cartTotal: number;
  selectedTable?: Table | null;
  selectedCustomer?: Customer | null;
  orderTypes: OrderType[];
  selectedOrderType: OrderType | null;
  onTableSelect: () => void;
  onCustomerSelect: () => void;
  onOrdersClick: () => void;
  onOrderTypeSelect: (orderType: OrderType) => void;
}

export function POSHeader({
  cart,
  cartTotal,
  selectedTable,
  selectedCustomer,
  orderTypes,
  selectedOrderType,
  onTableSelect,
  onCustomerSelect,
  onOrdersClick,
  onOrderTypeSelect
}: POSHeaderProps) {
  return (
    <div className="bg-card shadow p-4 border-b">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
        <div className="flex items-center space-x-4">
          {/* Table Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTableSelect}
              className="flex items-center space-x-2"
            >
              <LayoutGrid className="h-4 w-4" />
              <span>
                {selectedTable ? selectedTable.name : 'Select Table'}
              </span>
            </Button>
          </div>

          {/* Customer Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onCustomerSelect}
              className="flex items-center space-x-2"
            >
              <Users className="h-4 w-4" />
              <span>
                {selectedCustomer ? selectedCustomer.name : 'Select Customer'}
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
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
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

          {/* Cart Info */}
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {cart.length} items
            </Badge>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              ${cartTotal.toFixed(2)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
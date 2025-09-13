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
  onTableDeselect: () => void;
  onCustomerSelect: () => void;
  onCustomerDeselect: () => void;
  onOrdersClick: () => void;
  onOrderTypeSelect: (orderType: OrderType) => void;
  onOrderTypeDeselect: () => void;
}

export function POSHeader({
  selectedTable,
  selectedCustomer,
  orderTypes,
  selectedOrderType,
  onTableSelect,
  onTableDeselect,
  onCustomerSelect,
  onCustomerDeselect,
  onOrdersClick,
  onOrderTypeSelect,
  onOrderTypeDeselect
}: POSHeaderProps) {
  return (
    <div className="bg-card shadow p-4 border-b">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-foreground">POS</h1>
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
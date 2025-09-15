import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, Customer, OrderType, Order } from '@/types';
import { Users, LayoutGrid, FileText, ShoppingBag, Plus, RotateCcw } from 'lucide-react';
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
  return (
    <div className="bg-card shadow p-4 border-b">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Badge
            variant={selectedOrder ? "default" : "secondary"}
            className={`flex items-center space-x-1 cursor-pointer ${
              selectedOrder
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
            }`}
            onClick={onOrderToggle}
          >
            {selectedOrder ? (
              <>
                <RotateCcw className="h-3 w-3" />
                <span>Order #{selectedOrder.orderNumber}</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3" />
                <span>New Order</span>
              </>
            )}
          </Badge>
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
          <Badge className='w-12'>{cartItems.length}</Badge>
          <Badge className='w-12'>{cartTotal}</Badge>
        </div>
      </div>
    </div>
  );
}
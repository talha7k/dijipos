import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { POSCartItem } from './POSCartItem';

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
  onCheckout: () => void;
}

export function POSCartSidebar({ cart, cartTotal, onCheckout }: POSCartSidebarProps) {
  return (
    <div className="w-80 bg-card border-l flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center space-x-2 text-foreground">
          <ShoppingCart className="h-5 w-5" />
          <span>Cart</span>
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {cart.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <POSCartItem key={`${item.type}-${item.id}`} item={item} />
            ))}
          </div>
        )}
      </div>

      <div className="border-t p-4 bg-card">
        <div className="flex justify-between mb-4">
          <span className="font-medium text-lg text-foreground">Total:</span>
          <span className="font-bold text-xl text-foreground">${cartTotal.toFixed(2)}</span>
        </div>
        <Button
          className="w-full h-14 text-lg font-bold"
          disabled={cart.length === 0}
          onClick={onCheckout}
        >
          Checkout
        </Button>
      </div>
    </div>
  );
}
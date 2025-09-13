import { Badge } from '@/components/ui/badge';

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
}

export function POSHeader({ cart, cartTotal }: POSHeaderProps) {
  return (
    <div className="bg-card shadow p-4 border-b">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Point of Sale</h1>
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
  );
}
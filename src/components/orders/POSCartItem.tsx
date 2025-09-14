interface CartItem {
  id: string;
  type: 'product' | 'service';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

interface POSCartItemProps {
  item: CartItem;
  onClick?: () => void;
}

import { OrderItemDisplay } from './OrderItemDisplay';

export function POSCartItem({ item, onClick }: POSCartItemProps) {
  return (
    <OrderItemDisplay
      id={item.id}
      name={item.name}
      unitPrice={item.price}
      quantity={item.quantity}
      total={item.total}
      onClick={onClick}
      className="bg-card cursor-pointer hover:bg-muted/50 transition-colors"
    />
  );
}
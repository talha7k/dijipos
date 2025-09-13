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
}

export function POSCartItem({ item }: POSCartItemProps) {
  return (
    <div className="flex justify-between items-center p-3 border rounded bg-card">
      <div>
        <div className="font-medium text-foreground">{item.name}</div>
        <div className="text-sm text-muted-foreground">
          ${item.price.toFixed(2)} × {item.quantity}
        </div>
      </div>
      <div className="font-medium text-foreground">
        ${item.total.toFixed(2)}
      </div>
    </div>
  );
}
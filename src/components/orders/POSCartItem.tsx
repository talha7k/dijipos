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

export function POSCartItem({ item, onClick }: POSCartItemProps) {
  return (
    <div
      className="flex justify-between items-center p-3 border rounded bg-card cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={onClick}
    >
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
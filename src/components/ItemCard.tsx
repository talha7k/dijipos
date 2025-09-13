import { Package, Wrench } from 'lucide-react';
import { Product, Service } from '@/types';

interface ItemCardProps {
  item: Product | Service;
  onClick: (item: Product | Service, type: 'product' | 'service') => void;
  className?: string;
}

export function ItemCard({ item, onClick, className = '' }: ItemCardProps) {
  const isProduct = 'price' in item;
  const price = isProduct ? item.price : (item as Service).price;

  return (
    <div
      className={`border-3 border-primary/60 dark:border-primary/20 cursor-pointer bg-card rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-52 flex flex-col active:scale-95 hover:bg-accent/50 ${className}`}
      onClick={() => onClick(item, isProduct ? 'product' : 'service')}
    >
      <div className="pt-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          {isProduct ? (
            <Package className="h-5 w-5 text-primary" />
          ) : (
            <Wrench className="h-5 w-5 text-primary" />
          )}
        </div>
        <div 
          className="px-3 mb-3 text-lg text-center font-bold text-foreground leading-tight" 
          title={item.name}
        >
          {item.name}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="text-center text-muted-foreground text-xs line-clamp-2 mb-2 px-3">
          {item.description}
        </div>
        <div className="mt-auto">
          <div className="text-center font-bold text-xl py-2 text-foreground bg-primary/5 rounded-md w-full border-t-3 hover:border-primary border-primary/60 dark:border-primary/20">
            {price ? price.toFixed(2) : '0.00'}
          </div>
        </div>
      </div>
    </div>
  );
}
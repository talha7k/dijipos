import { Package, Wrench } from "lucide-react";
import { Product, Service } from "@/types";
import { useCurrency } from "@/lib/hooks/useCurrency";
import {
  cn,
  truncateTextByType,
  isTextTooLong,
  getDisplayLength,
} from "@/lib/utils";

interface ItemCardProps {
  item: Product | Service;
  onClick: (item: Product | Service, type: "product" | "service") => void;
  className?: string;
}

export function ItemCard({ item, onClick, className = "" }: ItemCardProps) {
  const { formatCurrency } = useCurrency();
  const isProduct = "price" in item;
  const price = isProduct ? item.price : (item as Service).price;

  // Use character-based length detection instead of word count
  const isLongName = isTextTooLong(item.name, getDisplayLength("short"));
  const isLongDescription = isTextTooLong(
    item.description,
    getDisplayLength("short"),
  );

  const handleClick = () => {
    onClick(item, isProduct ? "product" : "service");
  };

  return (
    <div
      className={`border-3 border-primary/60 dark:border-primary/20 cursor-pointer bg-card rounded-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105 h-52 flex flex-col active:scale-95 hover:bg-accent/50 ${className}`}
      onClick={handleClick}
      style={{ pointerEvents: "auto" }}
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
          className={cn(
            "px-3 mb-3 text-center font-bold text-foreground leading-tight",
            "text-lg max-h-15",
            isLongName && "text-[13px]",
          )}
          title={item.name}
        >
          {truncateTextByType(item.name, "medium")}
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div
          className={cn(
            "text-center text-muted-foreground line-clamp-2 mb-2 px-3",
            "text-xs max-h-15",
            isLongDescription && "text-[10px]",
          )}
          title={item.description}
        >
          {truncateTextByType(item.description, "medium")}
        </div>
        <div className="mt-auto">
          <div className="text-center font-bold text-xl py-2 text-foreground bg-primary/5 rounded-md w-full border-t-3 hover:border-primary border-primary/60 dark:border-primary/20">
            {price ? formatCurrency(price) : formatCurrency(0)}
          </div>
        </div>
      </div>
    </div>
  );
}

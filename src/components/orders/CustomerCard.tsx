import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
      onClick={() => onClick?.(customer)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold break-words" title={customer.name}>
          {customer.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground break-words" title={customer.email}>
            {customer.email}
          </div>
          {customer.phone && (
            <div className="text-sm text-muted-foreground break-words">
              {customer.phone}
            </div>
          )}
          {customer.address && (
            <div className="text-sm text-muted-foreground break-words" title={customer.address}>
              {customer.address}
            </div>
          )}
          {customer.vatNumber && (
            <div className="text-sm text-muted-foreground break-words">
              VAT: {customer.vatNumber}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
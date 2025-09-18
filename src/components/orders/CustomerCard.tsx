import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Receipt } from 'lucide-react';

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
          {customer.email && customer.email.trim() !== '' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words" title={customer.email}>
              <Mail className="h-4 w-4 flex-shrink-0" />
              {customer.email}
            </div>
          )}
          {customer.nameAr && customer.nameAr.trim() !== '' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words" title={customer.nameAr}>
              <span className="h-4 w-4 flex-shrink-0 text-xs">ع</span>
              {customer.nameAr}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words">
              <Phone className="h-4 w-4 flex-shrink-0" />
              {customer.phone}
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words" title={customer.address}>
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {customer.address}
            </div>
          )}
          {customer.vatNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words">
              <Receipt className="h-4 w-4 flex-shrink-0" />
              VAT: {customer.vatNumber}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
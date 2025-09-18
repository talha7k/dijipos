import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, MapPin, Receipt } from 'lucide-react';
import { truncateText } from '@/lib/utils';

interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
}

export function CustomerCard({ customer, onClick }: CustomerCardProps) {
  const MAX_DISPLAY_LENGTH = 25; // Maximum characters to display

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
      onClick={() => onClick?.(customer)}
    >
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold break-words" title={customer.name}>
          {truncateText(customer.name, MAX_DISPLAY_LENGTH)}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {customer.email && customer.email.trim() !== '' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words" title={customer.email}>
              <Mail className="h-4 w-4 flex-shrink-0" />
              {truncateText(customer.email, MAX_DISPLAY_LENGTH)}
            </div>
          )}
          {customer.nameAr && customer.nameAr.trim() !== '' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words" title={customer.nameAr}>
              <span className="h-4 w-4 flex-shrink-0 text-xs">ع</span>
              {truncateText(customer.nameAr, MAX_DISPLAY_LENGTH)}
            </div>
          )}
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words">
              <Phone className="h-4 w-4 flex-shrink-0" />
              {truncateText(customer.phone, MAX_DISPLAY_LENGTH)}
            </div>
          )}
          {customer.address && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words" title={customer.address}>
              <MapPin className="h-4 w-4 flex-shrink-0" />
              {truncateText(customer.address, MAX_DISPLAY_LENGTH)}
            </div>
          )}
          {customer.vatNumber && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground break-words">
              <Receipt className="h-4 w-4 flex-shrink-0" />
              VAT: {truncateText(customer.vatNumber, MAX_DISPLAY_LENGTH)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
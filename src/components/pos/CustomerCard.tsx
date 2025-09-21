import { Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <CardHeader className="pb-0">
        <CardTitle className="text-md font-bold break-words" title={customer.name}>
          {truncateText(customer.name, MAX_DISPLAY_LENGTH)}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 py-0 -mt-4">
        <div className="space-y-2">
          {customer.email && customer.email.trim() !== '' && (
            <Badge variant="secondary" className="flex items-center gap-1 w-full justify-start text-xs max-w-full whitespace-normal break-words" title={customer.email}>
              <Mail className="h-3 w-3 flex-shrink-0" />
              {truncateText(customer.email, MAX_DISPLAY_LENGTH)}
            </Badge>
          )}
          {customer.nameAr && customer.nameAr.trim() !== '' && (
            <Badge variant="secondary" className="flex items-center gap-1 w-full justify-start text-xs max-w-full whitespace-normal break-words" title={customer.nameAr}>
              <span className="text-xs flex-shrink-0">ع</span>
              {truncateText(customer.nameAr, MAX_DISPLAY_LENGTH)}
            </Badge>
          )}
          {customer.phone && (
            <Badge variant="outline" className="flex items-center gap-1 w-full justify-start text-xs max-w-full whitespace-normal break-words">
              <Phone className="h-3 w-3 flex-shrink-0" />
              {truncateText(customer.phone, MAX_DISPLAY_LENGTH)}
            </Badge>
          )}
          {customer.address && (
            <Badge variant="outline" className="flex items-center gap-1 w-full justify-start text-xs max-w-full whitespace-normal break-words" title={customer.address}>
              <MapPin className="h-3 w-3 flex-shrink-0" />
              {truncateText(customer.address, MAX_DISPLAY_LENGTH)}
            </Badge>
          )}
          {customer.vatNumber && (
            <Badge variant="default" className="flex items-center gap-1 w-full justify-start text-xs max-w-full whitespace-normal break-words bg-blue-100 text-blue-800 border-blue-200">
              <Receipt className="h-3 w-3 flex-shrink-0" />
              VAT: {truncateText(customer.vatNumber, MAX_DISPLAY_LENGTH)}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
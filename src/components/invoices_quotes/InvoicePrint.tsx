'use client';

import { Invoice, Payment, Organization, Customer, Supplier, TemplateType } from '@/types';
import EnglishInvoice from '@/components/templates/EnglishInvoice';
import ArabicInvoice from '@/components/templates/ArabicInvoice';
import { useRef, useEffect } from 'react';

interface InvoicePrintProps {
  invoice: Invoice;
  organization: Organization | null;
  customer?: Customer;
  supplier?: Supplier;
  payments?: Payment[];
}

export function InvoicePrint({ 
  invoice, 
  organization, 
  customer, 
  supplier, 
  payments = [] 
}: InvoicePrintProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (printRef.current) {
      // Trigger print when component mounts
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, []);

  // Determine template type based on invoice or default to English
  const templateType = invoice.template || TemplateType.ENGLISH;

  return (
    <div ref={printRef} className="w-full">
      {templateType === TemplateType.ARABIC ? (
        <ArabicInvoice
          invoice={invoice}
          organization={organization}
          customer={customer}
          supplier={supplier}
        />
      ) : (
        <EnglishInvoice
          invoice={invoice}
          organization={organization}
          customer={customer}
          supplier={supplier}
        />
      )}
    </div>
  );
}
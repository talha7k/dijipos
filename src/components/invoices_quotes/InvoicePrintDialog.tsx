'use client';

import { Invoice, Payment, Organization, Customer, Supplier, TemplateType } from '@/types';
import { useRef, useEffect, useState } from 'react';
import { renderReceiptTemplate } from '@/lib/template-renderer';

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
  const [renderedContent, setRenderedContent] = useState<string>('');

  useEffect(() => {
    const renderInvoice = async () => {
      try {
        // Create a receipt template object for the template renderer
        const template = {
          id: invoice.id,
          name: invoice.template === TemplateType.ARABIC ? 'Arabic Invoice' : 'English Invoice',
          type: (invoice.template === TemplateType.ARABIC ? 'arabic' : 'thermal') as 'thermal' | 'a4' | 'arabic',
          content: '', // Will use default template
          isDefault: true,
          organizationId: organization?.id || '',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        // Convert invoice to order format for template renderer
        const order = {
          id: invoice.id,
          organizationId: organization?.id || '',
          orderNumber: invoice.id,
          createdAt: invoice.createdAt,
          updatedAt: invoice.updatedAt,
          tableName: '',
          customerName: customer?.name || supplier?.name || '',
          customerPhone: customer?.phone || supplier?.phone || '',
          customerEmail: customer?.email || supplier?.email || '',
          status: invoice.status as 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled',
          paid: invoice.status === 'paid',
          items: invoice.items.map(item => ({
            id: item.id || '',
            type: 'product' as 'product' | 'service',
            name: item.name,
            description: item.description || '',
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          })),
          subtotal: invoice.subtotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          total: invoice.total,
          orderType: 'invoice',
          notes: invoice.notes,
          includeQR: true,
          createdById: '',
          createdByName: ''
        };

        // Render the template
        const htmlContent = await renderReceiptTemplate(template, order, organization);
        setRenderedContent(htmlContent);
      } catch (error) {
        console.error('Error rendering invoice:', error);
        setRenderedContent('<div>Error rendering invoice</div>');
      }
    };

    renderInvoice();
  }, [invoice, organization, customer, supplier]);

  useEffect(() => {
    if (printRef.current && renderedContent) {
      // Trigger print when content is rendered
      setTimeout(() => {
        window.print();
      }, 100);
    }
  }, [renderedContent]);

  return (
    <div 
      ref={printRef} 
      className="w-full"
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
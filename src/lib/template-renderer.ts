import { Order, Organization, ReceiptTemplate } from '@/types';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';

interface TemplateData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyVat: string;
  orderNumber: string;
  orderDate: string;
  tableName: string;
  customerName: string;
  paymentMethod: string;
  subtotal: string;
  vatRate: string;
  vatAmount: string;
  total: string;
  items: Array<{
    name: string;
    quantity: number;
    total: string;
  }>;
  includeQR: boolean;
  qrCodeUrl?: string;
}

export function renderReceiptTemplate(
  template: ReceiptTemplate,
  order: Order,
  organization: Organization | null
): string {
  // Prepare template data
  const data: TemplateData = {
    companyName: organization?.name || '',
    companyAddress: organization?.address || '',
    companyPhone: organization?.phone || '',
    companyVat: organization?.vatNumber || '',
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleString(),
    tableName: order.tableName || '',
    customerName: order.customerName || '',
    paymentMethod: 'Cash', // Default payment method
    subtotal: (order.subtotal || 0).toFixed(2),
    vatRate: (order.taxRate || 0).toString(),
    vatAmount: (order.taxAmount || 0).toFixed(2),
    total: (order.total || 0).toFixed(2),
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      total: item.total.toFixed(2)
    })),
    includeQR: order.includeQR || false,
    qrCodeUrl: order.includeQR ? generateZatcaQR(order, organization) : undefined
  };

  // Use template content or default template
  let templateContent = template.content;
  
  // If no template content, use default receipt template based on type
  if (!templateContent) {
    templateContent = getDefaultReceiptTemplate(template.type || 'thermal');
  }

  // Render the template
  return renderTemplate(templateContent, data);
}

function renderTemplate(template: string, data: TemplateData): string {
  let result = template;

  // Replace simple variables
  result = result.replace(/{{companyName}}/g, data.companyName);
  result = result.replace(/{{companyAddress}}/g, data.companyAddress);
  result = result.replace(/{{companyPhone}}/g, data.companyPhone);
  result = result.replace(/{{companyVat}}/g, data.companyVat);
  result = result.replace(/{{orderNumber}}/g, data.orderNumber);
  result = result.replace(/{{orderDate}}/g, data.orderDate);
  result = result.replace(/{{tableName}}/g, data.tableName);
  result = result.replace(/{{customerName}}/g, data.customerName);
  result = result.replace(/{{paymentMethod}}/g, data.paymentMethod);
  result = result.replace(/{{subtotal}}/g, data.subtotal);
  result = result.replace(/{{vatRate}}/g, data.vatRate);
  result = result.replace(/{{vatAmount}}/g, data.vatAmount);
  result = result.replace(/{{total}}/g, data.total);

  // Handle QR code conditional block (both syntaxes)
  if (data.includeQR && data.qrCodeUrl) {
    result = result.replace(/{{#includeQR}}([\s\S]*?){{\/includeQR}}/g, (match, content) => {
      return content.replace(/{{qrCodeUrl}}/g, data.qrCodeUrl || '');
    });
  } else {
    result = result.replace(/{{#includeQR}}[\s\S]*?{{\/includeQR}}/g, '');
  }

  // Handle general conditional blocks {{#variable}}content{{/variable}}
  result = result.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, variable, content) => {
    const value = (data as any)[variable];
    return value ? content : '';
  });

  // Handle VAT rate conditional specifically (check if vatRate is not 0)
  result = result.replace(/{{#vatRate}}([\s\S]*?){{\/vatRate}}/g, (match, content) => {
    return data.vatRate && data.vatRate !== '0' ? content : '';
  });

  // Handle items loop
  result = result.replace(/{{#each items}}([\s\S]*?){{\/each}}/g, (match, itemTemplate) => {
    return data.items.map(item => {
      return itemTemplate
        .replace(/{{name}}/g, item.name)
        .replace(/{{quantity}}/g, item.quantity.toString())
        .replace(/{{total}}/g, item.total);
    }).join('');
  });

  return result;
}

function getDefaultReceiptTemplate(templateType: string = 'thermal'): string {
  if (templateType === 'a4') {
    return defaultReceiptA4Template;
  }
  return defaultReceiptTemplate;
}

function generateZatcaQR(order: Order, organization: Organization | null): string {
  // This is a placeholder - in a real implementation, you would generate
  // an actual ZATCA-compliant QR code URL
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}
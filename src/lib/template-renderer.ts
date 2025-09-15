import { Order, Organization, ReceiptTemplate, Invoice, InvoiceTemplate, Customer, Supplier, Quote, QuoteTemplate } from '@/types';
import { OrderStatus } from '@/types/enums';
import { defaultReceiptTemplate } from '@/components/templates/default-receipt-thermal';
import { defaultReceiptA4Template } from '@/components/templates/default-receipt-a4';
import { defaultArabicReceiptTemplate } from '@/components/templates/default-arabic-receipt-thermal';
import { defaultArabicReceiptA4Template } from '@/components/templates/default-arabic-receipt-a4';
import { defaultEnglishInvoiceTemplate } from '@/components/templates/default-invoice-english';
import { defaultArabicInvoiceTemplate } from '@/components/templates/default-invoice-arabic';
import { defaultEnglishQuoteTemplate } from '@/components/templates/default-quote-english';
import { defaultArabicQuoteTemplate } from '@/components/templates/default-quote-arabic';
import { createReceiptQRData, generateZatcaQRCode } from '@/lib/zatca-qr';
import { ReceiptTemplateData, InvoiceTemplateData, QuoteTemplateData, TemplateData } from '@/types/template';



export async function renderReceiptTemplate(
  template: ReceiptTemplate,
  order: Order,
  organization: Organization | null
): Promise<string> {
  // Prepare template data
  const data: ReceiptTemplateData = {
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
    includeQR: true, // Always include QR code for receipts
    qrCodeUrl: await generateZatcaQR(order, organization)
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

function renderTemplate(template: string, data: ReceiptTemplateData): string {
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
    const value = data[variable as keyof TemplateData];
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

function getDefaultReceiptTemplate(templateType: string = 'english_thermal'): string {
  switch (templateType) {
    case 'english_a4':
      return defaultReceiptA4Template;
    case 'arabic_a4':
      return defaultArabicReceiptA4Template;
    case 'arabic_thermal':
      return defaultArabicReceiptTemplate;
    case 'english_thermal':
    default:
      return defaultReceiptTemplate;
  }
}

export async function renderInvoiceTemplate(
  template: InvoiceTemplate,
  invoice: Invoice,
  organization: Organization | null,
  customer?: Customer,
  supplier?: Supplier
): Promise<string> {
  // Prepare template data
  const data: InvoiceTemplateData = {
    invoiceId: invoice.id,
    invoiceDate: 'invoiceDate' in invoice && invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : new Date(invoice.createdAt).toLocaleDateString(),
    dueDate: new Date(invoice.dueDate).toLocaleDateString(),
    status: invoice.status,
    companyName: organization?.name || '',
    companyNameAr: organization?.nameAr || '',
    companyAddress: organization?.address || '',
    companyEmail: organization?.email || '',
    companyPhone: organization?.phone || '',
    companyVat: organization?.vatNumber || '',
    companyLogo: organization?.logoUrl || '',
    companyStamp: organization?.stampUrl || '',
    clientName: customer?.name || supplier?.name || '',
    customerNameAr: customer?.nameAr || supplier?.nameAr || '',
    clientAddress: customer?.address || supplier?.address || '',
    clientEmail: customer?.email || supplier?.email || '',
    clientVat: customer?.vatNumber || supplier?.vatNumber || '',
    customerLogo: customer?.logoUrl || supplier?.logoUrl || '',
    supplierName: supplier?.name || '',
    supplierNameAr: supplier?.nameAr || '',
    supplierAddress: supplier?.address || '',
    supplierEmail: supplier?.email || '',
    supplierVat: supplier?.vatNumber || '',
    supplierLogo: supplier?.logoUrl || '',
    subtotal: (invoice.subtotal || 0).toFixed(2),
    taxRate: (invoice.taxRate || 0).toString(),
    taxAmount: (invoice.taxAmount || 0).toFixed(2),
    total: (invoice.total || 0).toFixed(2),
    notes: invoice.notes || '',
    includeQR: 'includeQR' in invoice ? invoice.includeQR : false,
    qrCodeUrl: await generateInvoiceQR(invoice, organization),
    items: invoice.items.map(item => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2)
    }))
  };

  // Use template content or default template
  let templateContent = template.content;
  
  // If no template content, use default invoice template based on type
  if (!templateContent) {
    templateContent = getDefaultInvoiceTemplate(template.type || 'english');
  }

  // Render the template
  return renderInvoiceTemplateContent(templateContent, data);
}

function renderInvoiceTemplateContent(template: string, data: InvoiceTemplateData): string {
  let result = template;

  // Replace simple variables
  Object.keys(data).forEach(key => {
    const value = data[key as keyof InvoiceTemplateData];
    if (typeof value === 'string') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });

  // Handle QR code conditional block
  if (data.includeQR && data.qrCodeUrl) {
    result = result.replace(/{{#includeQR}}([\s\S]*?){{\/includeQR}}/g, (match, content) => {
      return content.replace(/{{qrCodeUrl}}/g, data.qrCodeUrl || '');
    });
  } else {
    result = result.replace(/{{#includeQR}}[\s\S]*?{{\/includeQR}}/g, '');
  }

  // Handle general conditional blocks
  result = result.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, variable, content) => {
    const value = data[variable as keyof InvoiceTemplateData];
    return value ? content : '';
  });

  // Handle items loop
  result = result.replace(/{{#each items}}([\s\S]*?){{\/each}}/g, (match, itemTemplate) => {
    return data.items.map((item) => {
      return itemTemplate
        .replace(/{{name}}/g, item.name)
        .replace(/{{description}}/g, item.description)
        .replace(/{{quantity}}/g, item.quantity.toString())
        .replace(/{{unitPrice}}/g, item.unitPrice)
        .replace(/{{total}}/g, item.total);
    }).join('');
  });

  return result;
}

function getDefaultInvoiceTemplate(templateType: string = 'english'): string {
  if (templateType === 'arabic') {
    return defaultArabicInvoiceTemplate;
  }
  return defaultEnglishInvoiceTemplate;
}

async function generateInvoiceQR(invoice: Invoice, organization: Organization | null): Promise<string> {
  try {
    // Convert invoice to order format for QR generation
    const order = {
      id: invoice.id,
      organizationId: organization?.id || '',
      orderNumber: invoice.id,
      createdAt: invoice.createdAt,
      updatedAt: invoice.updatedAt,
      tableName: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      status: OrderStatus.COMPLETED,
      paid: invoice.status === 'paid',
      items: invoice.items,
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
    
    const qrData = createReceiptQRData(order, organization);
    return await generateZatcaQRCode(qrData);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    // Return a placeholder if QR generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

export async function renderQuoteTemplate(
  template: QuoteTemplate,
  quote: Quote,
  organization: Organization | null,
  customer?: Customer
): Promise<string> {
  // Prepare template data
  const data: QuoteTemplateData = {
    quoteId: quote.id,
    quoteDate: new Date(quote.createdAt).toLocaleDateString(),
    validUntil: quote.validUntil ? new Date(quote.validUntil).toLocaleDateString() : '',
    status: quote.status,
    companyName: organization?.name || '',
    companyNameAr: organization?.nameAr || '',
    companyAddress: organization?.address || '',
    companyEmail: organization?.email || '',
    companyPhone: organization?.phone || '',
    companyVat: organization?.vatNumber || '',
    companyLogo: organization?.logoUrl || '',
    clientName: customer?.name || quote.clientName || '',
    customerNameAr: customer?.nameAr || '',
    clientAddress: customer?.address || quote.clientAddress || '',
    clientEmail: customer?.email || quote.clientEmail || '',
    clientVat: customer?.vatNumber || '',
    customerLogo: customer?.logoUrl || '',
    subtotal: (quote.subtotal || 0).toFixed(2),
    taxRate: (quote.taxRate || 0).toString(),
    taxAmount: (quote.taxAmount || 0).toFixed(2),
    total: (quote.total || 0).toFixed(2),
    notes: quote.notes || '',
    includeQR: false, // Quotes typically don't include QR codes
    qrCodeUrl: '',
    items: quote.items.map(item => ({
      name: item.name,
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2)
    }))
  };

  // Use template content or default template
  let templateContent = template.content;
  
  // If no template content, use default quote template based on type
  if (!templateContent) {
    templateContent = getDefaultQuoteTemplate(template.type || 'english');
  }

  // Render the template
  return renderQuoteTemplateContent(templateContent, data);
}

function renderQuoteTemplateContent(template: string, data: QuoteTemplateData): string {
  let result = template;

  // Replace simple variables
  Object.keys(data).forEach(key => {
    const value = data[key as keyof QuoteTemplateData];
    if (typeof value === 'string') {
      result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
  });

  // Handle QR code conditional block
  if (data.includeQR && data.qrCodeUrl) {
    result = result.replace(/{{#includeQR}}([\s\S]*?){{\/includeQR}}/g, (match, content) => {
      return content.replace(/{{qrCodeUrl}}/g, data.qrCodeUrl || '');
    });
  } else {
    result = result.replace(/{{#includeQR}}[\s\S]*?{{\/includeQR}}/g, '');
  }

  // Handle general conditional blocks
  result = result.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (match, variable, content) => {
    const value = data[variable as keyof QuoteTemplateData];
    return value ? content : '';
  });

  // Handle items loop
  result = result.replace(/{{#each items}}([\s\S]*?){{\/each}}/g, (match, itemTemplate) => {
    return data.items.map(item => {
      return itemTemplate
        .replace(/{{name}}/g, item.name)
        .replace(/{{description}}/g, item.description)
        .replace(/{{quantity}}/g, item.quantity.toString())
        .replace(/{{unitPrice}}/g, item.unitPrice)
        .replace(/{{total}}/g, item.total);
    }).join('');
  });

  return result;
}

function getDefaultQuoteTemplate(templateType: string = 'english'): string {
  if (templateType === 'arabic') {
    return defaultArabicQuoteTemplate;
  }
  return defaultEnglishQuoteTemplate;
}

async function generateQuoteQR(quote: Quote, organization: Organization | null): Promise<string> {
  try {
    // Convert quote to order format for QR generation
    const order = {
      id: quote.id,
      organizationId: organization?.id || '',
      orderNumber: quote.id,
      createdAt: quote.createdAt,
      updatedAt: quote.updatedAt,
      tableName: '',
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      status: OrderStatus.COMPLETED,
      paid: false,
      items: quote.items,
      subtotal: quote.subtotal,
      taxRate: quote.taxRate,
      taxAmount: quote.taxAmount,
      total: quote.total,
      orderType: 'quote',
      notes: quote.notes,
      includeQR: true,
      createdById: '',
      createdByName: ''
    };
    
    const qrData = createReceiptQRData(order, organization);
    return await generateZatcaQRCode(qrData);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    // Return a placeholder if QR generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

async function generateZatcaQR(order: Order, organization: Organization | null): Promise<string> {
  try {
    const qrData = createReceiptQRData(order, organization);
    return await generateZatcaQRCode(qrData);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    // Return a placeholder if QR generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}
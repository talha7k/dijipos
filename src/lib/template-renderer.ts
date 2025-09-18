import { Order, Organization, ReceiptTemplate, Invoice, InvoiceTemplate, Customer, Supplier, Quote, QuoteTemplate, OrderPayment } from '@/types';
import { OrderStatus } from '@/types/enums';
import { defaultEnglishReceiptTemplate } from '@/components/templates/receipt/default-receipt-thermal-english';
import { defaultReceiptA4Template } from '@/components/templates/receipt/default-receipt-a4-english';
import { defaultArabicReceiptTemplate } from '@/components/templates/receipt/default-receipt-thermal-arabic';
import { defaultArabicReceiptA4Template } from '@/components/templates/receipt/default-receipt-a4-arabic';
import { defaultInvoiceEnglish } from '@/components/templates/invoice/default-invoice-english';
import { defaultInvoiceArabic } from '@/components/templates/invoice/default-invoice-arabic';
import { defaultQuoteEnglish } from '@/components/templates/quotes/default-quote-english';
import { defaultQuoteArabic } from '@/components/templates/quotes/default-quote-arabic';
import { createReceiptQRData, generateZatcaQRCode } from '@/lib/zatca-qr';
import { ReceiptTemplateData, InvoiceTemplateData, QuoteTemplateData, TemplateData } from '@/types/template';
import { PrinterSettings } from '@/types';

// Utility function to convert image URL to base64
async function convertImageToBase64(imageUrl: string): Promise<string> {
  if (!imageUrl || !imageUrl.startsWith('http')) {
    return imageUrl; // Return as-is if not a URL
  }

  // Check if it's already a data URL
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }

  // For now, return the original URL and let html2canvas handle it
  // This is a temporary solution while we debug the CORS issues
  console.log('Returning original image URL for PDF generation:', imageUrl);
  return imageUrl;
}



export async function renderReceiptTemplate(
    template: ReceiptTemplate,
    order: Order,
    organization: Organization | null,
    payments: OrderPayment[] = [],
    printerSettings?: PrinterSettings
  ): Promise<string> {
    console.log('=== Receipt Template Debug ===');
    console.log('Template:', template);
    console.log('Template type:', template.type);
    console.log('Template content length:', template.content?.length || 0);
    console.log('Order:', order);
    console.log('Order fields:', {
      orderNumber: order.orderNumber,
      queueNumber: order.queueNumber,
      orderType: order.orderType,
      subtotal: order.subtotal,
      taxRate: order.taxRate,
      taxAmount: order.taxAmount,
      total: order.total,
      totalQty: order.items.reduce((sum, item) => sum + item.quantity, 0)
    });
    console.log('Organization:', organization);
    console.log('Organization logo URL:', organization?.logoUrl);
    console.log('Payments:', payments);

    // For PDF generation, use original URLs and let html2canvas handle them
    const companyLogoUrl = organization?.logoUrl || '';
    const qrCodeBase64 = await generateZatcaQR(order, organization);

    console.log('Company logo URL:', companyLogoUrl);
    console.log('QR code base64 length:', qrCodeBase64.length);

    // Calculate total quantity
    const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

   // Prepare template data
   const data: ReceiptTemplateData = {
     companyName: organization?.name || '',
     companyNameAr: organization?.nameAr || '',
     companyAddress: organization?.address || '',
     companyPhone: organization?.phone || '',
     companyVat: organization?.vatNumber || '',
     companyLogo: companyLogoUrl,
     orderNumber: order.orderNumber,
     queueNumber: order.queueNumber || '',
     orderDate: new Date(order.createdAt).toLocaleString(),
     tableName: order.tableName || '',
     customerName: order.customerName || '',
     createdByName: order.createdByName || '',
     orderType: order.orderType || 'dine-in',
     paymentMethod: 'Cash', // Default payment method
     subtotal: (order.subtotal || 0).toFixed(2),
     vatRate: (order.taxRate || 0).toString(),
     vatAmount: (order.taxAmount || 0).toFixed(2),
     total: (order.total || 0).toFixed(2),
       customHeader: template.customHeader || '',
       customFooter: template.customFooter || '',
       totalQty: totalQty,
       paperWidth: printerSettings?.paperWidth,
        marginTop: printerSettings?.receipts?.marginTop || 0,
        marginBottom: printerSettings?.receipts?.marginBottom || 0,
        marginLeft: printerSettings?.receipts?.marginLeft || 0,
        marginRight: printerSettings?.receipts?.marginRight || 0,
        paddingTop: printerSettings?.receipts?.paddingTop || 0,
        paddingBottom: printerSettings?.receipts?.paddingBottom || 0,
        paddingLeft: printerSettings?.receipts?.paddingLeft || 0,
        paddingRight: printerSettings?.receipts?.paddingRight || 0,
      items: order.items.map(item => ({
       name: item.name,
       quantity: item.quantity,
       total: item.total.toFixed(2)
     })),
     payments: payments.map(payment => ({
       paymentType: payment.paymentMethod,
       amount: payment.amount.toFixed(2)
     })),
     includeQR: true, // Always include QR code for receipts
     qrCodeUrl: qrCodeBase64
   };

  // Use template content or default template
  let templateContent = template.content;

  console.log('=== TEMPLATE SELECTION DEBUG ===');
  console.log('Template has content:', !!template.content);
  console.log('Template content length:', template.content?.length || 0);
  console.log('Template type:', template.type);

  // If no template content, use default receipt template based on type
  if (!templateContent) {
    console.log('Using default template for type:', template.type);
    templateContent = getDefaultReceiptTemplate(template.type || 'thermal');
  } else {
    console.log('Using custom template content');
  }

  console.log('Final template content length:', templateContent.length);
  console.log('Final template content preview:', templateContent.substring(0, 500) + '...');

  // Show specific sections of the template - more specific patterns
  const orderTypePattern = templateContent.match(/\{\{orderType\}\}/g);
  console.log('{{orderType}} found:', orderTypePattern);

  const queueNumberPattern = templateContent.match(/\{\{queueNumber\}\}/g);
  console.log('{{queueNumber}} found:', queueNumberPattern);

  const subtotalPattern = templateContent.match(/\{\{subtotal\}\}/g);
  console.log('{{subtotal}} found:', subtotalPattern);

  const arabicOrderPattern = templateContent.match(/النوع.*\{\{orderType\}\}/g);
  console.log('Arabic order type pattern:', arabicOrderPattern);

  const arabicQueuePattern = templateContent.match(/رقم الدور.*\{\{queueNumber\}\}/g);
  console.log('Arabic queue pattern:', arabicQueuePattern);

  // Render the template
  return renderTemplate(templateContent, data);
}

function renderTemplate(template: string, data: ReceiptTemplateData): string {
   console.log('=== Template Rendering Debug ===');
   console.log('Original template length:', template.length);
   console.log('Template data keys:', Object.keys(data));
   console.log('Sample data values:', {
     companyName: data.companyName,
     orderNumber: data.orderNumber,
     orderType: data.orderType,
     queueNumber: data.queueNumber,
     subtotal: data.subtotal,
     total: data.total,
     totalQty: data.totalQty,
     paymentsCount: data.payments.length
   });

   let result = template;

   // Replace simple variables
   console.log('=== STARTING PLACEHOLDER REPLACEMENT ===');
   console.log('Before replacement - template contains {{orderType}}:', result.includes('{{orderType}}'));
   console.log('Before replacement - template contains {{queueNumber}}:', result.includes('{{queueNumber}}'));
   console.log('Before replacement - template contains {{subtotal}}:', result.includes('{{subtotal}}'));

   result = result.replace(/{{companyName}}/g, data.companyName);
   result = result.replace(/{{companyNameAr}}/g, data.companyNameAr);
   result = result.replace(/{{companyAddress}}/g, data.companyAddress);
   result = result.replace(/{{companyPhone}}/g, data.companyPhone);
   result = result.replace(/{{companyVat}}/g, data.companyVat);
   result = result.replace(/{{companyLogo}}/g, data.companyLogo);
   result = result.replace(/{{orderNumber}}/g, data.orderNumber);
   result = result.replace(/{{orderDate}}/g, data.orderDate);
   result = result.replace(/{{tableName}}/g, data.tableName);
   result = result.replace(/{{customerName}}/g, data.customerName);
   result = result.replace(/{{createdByName}}/g, data.createdByName);
   result = result.replace(/{{paymentMethod}}/g, data.paymentMethod);
   result = result.replace(/{{subtotal}}/g, data.subtotal);
   result = result.replace(/{{vatRate}}/g, data.vatRate);
   result = result.replace(/{{vatAmount}}/g, data.vatAmount);
   result = result.replace(/{{total}}/g, data.total);
    result = result.replace(/{{customHeader}}/g, data.customHeader || '');
    result = result.replace(/{{customFooter}}/g, data.customFooter || '');
    result = result.replace(/{{totalQty}}/g, data.totalQty.toString());
    result = result.replace(/{{paperWidth}}/g, data.paperWidth?.toString() || '80');
    result = result.replace(/{{queueNumber}}/g, data.queueNumber || '');
    result = result.replace(/{{orderType}}/g, data.orderType);

   console.log('After simple replacements - template contains {{orderType}}:', result.includes('{{orderType}}'));
   console.log('After simple replacements - template contains {{queueNumber}}:', result.includes('{{queueNumber}}'));
   console.log('After simple replacements - template contains {{subtotal}}:', result.includes('{{subtotal}}'));
   console.log('After simple replacements - contains "Dine-in":', result.includes('Dine-in'));
   console.log('After simple replacements - contains "722":', result.includes('722'));
   console.log('After simple replacements - contains "1122.62":', result.includes('1122.62'));

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

  // Handle payments loop
  result = result.replace(/{{#each payments}}([\s\S]*?){{\/each}}/g, (match, paymentTemplate) => {
    return data.payments.map(payment => {
      return paymentTemplate
        .replace(/{{paymentType}}/g, payment.paymentType)
        .replace(/{{amount}}/g, payment.amount);
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
      return defaultEnglishReceiptTemplate;
  }
}

export async function renderInvoiceTemplate(
  template: InvoiceTemplate,
  invoice: Invoice,
  organization: Organization | null,
  customer?: Customer,
  supplier?: Supplier,
  printerSettings?: PrinterSettings
): Promise<string> {
  // For PDF generation, use original URLs and let html2canvas handle them
  const companyLogoUrl = organization?.logoUrl || '';
  const companyStampUrl = organization?.stampUrl || '';
  const customerLogoUrl = customer?.logoUrl || supplier?.logoUrl || '';
  const supplierLogoUrl = supplier?.logoUrl || '';
  const qrCodeBase64 = await generateInvoiceQR(invoice, organization);

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
    companyLogo: companyLogoUrl,
    companyStamp: companyStampUrl,
    clientName: customer?.name || supplier?.name || '',
    customerNameAr: customer?.nameAr || supplier?.nameAr || '',
    clientAddress: customer?.address || supplier?.address || '',
    clientEmail: customer?.email || supplier?.email || '',
    clientVat: customer?.vatNumber || supplier?.vatNumber || '',
    customerLogo: customerLogoUrl,
    supplierName: supplier?.name || '',
    supplierNameAr: supplier?.nameAr || '',
    supplierAddress: supplier?.address || '',
    supplierEmail: supplier?.email || '',
    supplierVat: supplier?.vatNumber || '',
    supplierLogo: supplierLogoUrl,
    subtotal: (invoice.subtotal || 0).toFixed(2),
    taxRate: (invoice.taxRate || 0).toString(),
    taxAmount: (invoice.taxAmount || 0).toFixed(2),
    total: (invoice.total || 0).toFixed(2),
    notes: invoice.notes || '',
    includeQR: 'includeQR' in invoice ? invoice.includeQR : false,
    qrCodeUrl: qrCodeBase64,
     marginTop: printerSettings?.invoices?.marginTop || 0,
     marginBottom: printerSettings?.invoices?.marginBottom || 0,
     marginLeft: printerSettings?.invoices?.marginLeft || 0,
     marginRight: printerSettings?.invoices?.marginRight || 0,
     paddingTop: printerSettings?.invoices?.paddingTop || 0,
     paddingBottom: printerSettings?.invoices?.paddingBottom || 0,
     paddingLeft: printerSettings?.invoices?.paddingLeft || 0,
     paddingRight: printerSettings?.invoices?.paddingRight || 0,
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

  console.log('Final rendered result length:', result.length);
  console.log('Final result preview:', result.substring(0, 500) + '...');

  // Check if key placeholders were replaced
  const hasOrderType = result.includes('Dine-in') || result.includes('dine-in');
  const hasQueueNumber = result.includes('989') || result.includes('Queue #:');
  const hasSubtotal = result.includes('1131.48') || result.includes('Items Value:');
  const hasPayments = result.includes('Payment Type') || result.includes('نوع الدفع');

  console.log('Template rendering verification:');
  console.log('- Order type present:', hasOrderType);
  console.log('- Queue number present:', hasQueueNumber);
  console.log('- Subtotal present:', hasSubtotal);
  console.log('- Payments section present:', hasPayments);

  return result;
}

function getDefaultInvoiceTemplate(templateType: string = 'english'): string {
  if (templateType === 'arabic') {
    return defaultInvoiceArabic;
  }
  return defaultInvoiceEnglish;
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
  customer?: Customer,
  printerSettings?: PrinterSettings
): Promise<string> {
  // For PDF generation, use original URLs and let html2canvas handle them
  const companyLogoUrl = organization?.logoUrl || '';
  const customerLogoUrl = customer?.logoUrl || '';

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
    companyLogo: companyLogoUrl,
    clientName: customer?.name || quote.clientName || '',
    customerNameAr: customer?.nameAr || '',
    clientAddress: customer?.address || quote.clientAddress || '',
    clientEmail: customer?.email || quote.clientEmail || '',
    clientVat: customer?.vatNumber || '',
    customerLogo: customerLogoUrl,
    subtotal: (quote.subtotal || 0).toFixed(2),
    taxRate: (quote.taxRate || 0).toString(),
    taxAmount: (quote.taxAmount || 0).toFixed(2),
    total: (quote.total || 0).toFixed(2),
    notes: quote.notes || '',
    includeQR: false, // Quotes typically don't include QR codes
    qrCodeUrl: '',
     marginTop: printerSettings?.quotes?.marginTop || 0,
     marginBottom: printerSettings?.quotes?.marginBottom || 0,
     marginLeft: printerSettings?.quotes?.marginLeft || 0,
     marginRight: printerSettings?.quotes?.marginRight || 0,
     paddingTop: printerSettings?.quotes?.paddingTop || 0,
     paddingBottom: printerSettings?.quotes?.paddingBottom || 0,
     paddingLeft: printerSettings?.quotes?.paddingLeft || 0,
     paddingRight: printerSettings?.quotes?.paddingRight || 0,
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
    return defaultQuoteArabic;
  }
  return defaultQuoteEnglish;
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
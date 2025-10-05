import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { Payment } from '@/types';
import { InvoiceType } from '@/types/enums';
import { adminDb } from '@/lib/firebase/server-config';
import { renderTemplate } from '@/lib/template-renderer';
import { InvoiceTemplateData } from '@/types/template';
import { createInvoiceQRData, generateZatcaQRCode } from '@/lib/zatca-qr';

import { salesInvoiceEnglish } from '@/components/templates/invoice/sales-invoice-english';
import { purchaseInvoiceEnglish } from '@/components/templates/invoice/purchase-invoice-english';
import { salesInvoiceArabic } from '@/components/templates/invoice/sales-invoice-arabic';
import { purchaseInvoiceArabic } from '@/components/templates/invoice/purchase-invoice-arabic';

// SMTP Error interface
interface SMTPErr {
  message?: string;
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
}

// Firestore Timestamp interface
interface FirestoreTimestamp {
  toDate(): Date;
}

// Invoice item interface for InvoiceData
interface InvoiceItemData {
  name?: string;
  quantity?: number;
  unitPrice?: number;
  total?: number;
}

// Invoice data interface for admin SDK
interface InvoiceData {
  id: string;
  organizationId: string;
  type: string;
  status: string;
  total: number;
  items: unknown[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  invoiceDate?: Date;
  validUntil?: Date;
  clientName?: string;
  supplierName?: string;
  customerNameAr?: string;
  supplierNameAr?: string;
  clientAddress?: string;
  supplierAddress?: string;
  clientEmail?: string;
  supplierEmail?: string;
  clientVAT?: string;
  supplierVAT?: string;
  customerLogo?: string;
  supplierLogo?: string;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
  notes?: string;
  [key: string]: unknown;
}

// Helper function to safely convert date fields
function convertDateField(field: unknown): Date | undefined {
  if (!field) return undefined;

  // If it's already a Date object
  if (field instanceof Date) return field;

  // If it's a Firestore Timestamp (has toDate method)
  if (typeof field === 'object' && field !== null && 'toDate' in field) {
    try {
      return (field as FirestoreTimestamp).toDate();
    } catch {
      // If toDate fails, continue to other checks
    }
  }

  // If it's a string or number, try to parse it
  if (typeof field === 'string' || typeof field === 'number') {
    const date = new Date(field);
    return isNaN(date.getTime()) ? undefined : date;
  }

  return undefined;
}

// Get invoice using Admin SDK
async function getInvoice(invoiceId: string): Promise<InvoiceData | null> {
  try {
    const docRef = adminDb.collection('invoices').doc(invoiceId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return null;
    }

    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertDateField(data?.createdAt) || new Date(),
      updatedAt: convertDateField(data?.updatedAt) || new Date(),
      invoiceDate: convertDateField(data?.invoiceDate),
      dueDate: convertDateField(data?.dueDate),
      validUntil: convertDateField(data?.validUntil),
    } as InvoiceData;
  } catch (error) {
    console.error('Error fetching invoice with admin SDK:', error);
    throw error;
  }
}

// SMTP configuration from environment variables
const smtpConfig = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
};

// Validate SMTP configuration
const validateSMTPConfig = () => {
  const missing = [];
  if (!smtpConfig.host) missing.push('SMTP_HOST');
  if (!smtpConfig.auth.user) missing.push('SMTP_USER');
  if (!smtpConfig.auth.pass) missing.push('SMTP_PASS');

  if (missing.length > 0) {
    const errorMsg = `SMTP configuration is incomplete. Missing environment variables: ${missing.join(', ')}. Please set these in your .env.local file.`;
    console.error('SMTP Configuration Error:', errorMsg);
    throw new Error(errorMsg);
  }

  // Validate port
  if (isNaN(smtpConfig.port) || smtpConfig.port < 1 || smtpConfig.port > 65535) {
    const errorMsg = `Invalid SMTP_PORT: ${process.env.SMTP_PORT}. Must be a valid port number between 1-65535.`;
    console.error('SMTP Configuration Error:', errorMsg);
    throw new Error(errorMsg);
  }

  console.log('SMTP Configuration validated successfully');
};

// Create transporter
const createTransporter = () => {
  validateSMTPConfig();
  return nodemailer.createTransport(smtpConfig);
};

// Get local template by ID and invoice type
function getLocalTemplate(templateId: string, invoiceType: string): string | null {
  switch (templateId) {
    case 'sales-invoice-english':
      return salesInvoiceEnglish;
    case 'purchase-invoice-english':
      return purchaseInvoiceEnglish;
    case 'sales-invoice-arabic':
      return salesInvoiceArabic;
    case 'purchase-invoice-arabic':
      return purchaseInvoiceArabic;
    // Legacy support for old template IDs
    case 'default-invoice-english':
    case 'english-invoice':
      return invoiceType === 'sales' ? salesInvoiceEnglish : purchaseInvoiceEnglish;
    case 'default-invoice-arabic':
    case 'arabic-invoice':
      return invoiceType === 'sales' ? salesInvoiceArabic : purchaseInvoiceArabic;
    default:
      // Default fallback based on invoice type
      console.warn(`Unknown template ID: ${templateId}, using default template for ${invoiceType}`);
      return invoiceType === 'sales' ? salesInvoiceEnglish : purchaseInvoiceEnglish;
  }
}

// Render invoice with template
async function renderInvoiceWithTemplate(
  templateContent: string,
  invoice: InvoiceData,
  organization: { name?: string; nameAr?: string; address?: string; email?: string; phone?: string; vatNumber?: string; logoUrl?: string; stampUrl?: string }
): Promise<string> {
  const qrCodeBase64 = await generateZatcaQRCode(
    createInvoiceQRData(invoice as InvoiceData & { clientName?: string; supplierName?: string; clientEmail?: string; supplierEmail?: string; clientVAT?: string; supplierVAT?: string }, organization),
  );

  const data: InvoiceTemplateData = {
    invoiceId: invoice.id,
    invoiceDate: convertDateField(invoice.createdAt)?.toLocaleDateString() || "",
    dueDate: convertDateField(invoice.dueDate)?.toLocaleDateString() || "N/A",
    status: invoice.status || "",
    invoiceType: invoice.type === 'sales' ? InvoiceType.SALES : invoice.type === 'purchase' ? InvoiceType.PURCHASE : InvoiceType.SALES,
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    companyAddress: organization?.address || "",
    companyEmail: organization?.email || "",
    companyPhone: organization?.phone || "",
    companyVat: organization?.vatNumber || "",
    companyLogo: organization?.logoUrl || "",
    companyStamp: organization?.stampUrl || "",
    clientName: invoice.clientName || invoice.supplierName || "",
    customerNameAr: invoice.customerNameAr || invoice.supplierNameAr || "",
    clientAddress: invoice.clientAddress || invoice.supplierAddress || "",
    clientEmail: invoice.clientEmail || invoice.supplierEmail || "",
    clientVat: invoice.clientVAT || invoice.supplierVAT || "",
    customerLogo: invoice.customerLogo || "",
    supplierName: invoice.supplierName || "",
    supplierNameAr: invoice.supplierNameAr || "",
    supplierAddress: invoice.supplierAddress || "",
    supplierEmail: invoice.supplierEmail || "",
    supplierVat: invoice.supplierVAT || "",
    supplierLogo: invoice.supplierLogo || "",
    subtotal: (invoice.subtotal || 0).toFixed(2),
    taxRate: (invoice.taxRate || 0).toString(),
    taxAmount: (invoice.taxAmount || 0).toFixed(2),
    total: (invoice.total || 0).toFixed(2),
    notes: invoice.notes || "",
    items: (invoice.items as Array<{ name?: string; description?: string; quantity?: number; unitPrice?: number; total?: number }> || []).map((item) => ({
      name: item.name || "",
      description: item.description || "",
      quantity: item.quantity || 0,
      unitPrice: (item.unitPrice || 0).toFixed(2),
      total: (item.total || 0).toFixed(2),
    })),
    includeQR: true,
    qrCodeUrl: qrCodeBase64,
    headingFont: "Arial, sans-serif",
    bodyFont: "Arial, sans-serif",
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  };

  return renderTemplate(templateContent, data);
}

// Generate PDF from HTML using Puppeteer (Vercel-compatible)
async function generatePDF(htmlContent: string): Promise<Buffer> {
  let browser;
  try {
    // Validate input
    if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.trim().length === 0) {
      throw new Error('Invalid HTML content provided for PDF generation');
    }

    // Environment-specific Puppeteer configuration
    const isVercel = !!process.env.VERCEL_ENV;
    let puppeteer: typeof import('puppeteer') | typeof import('puppeteer-core'),
      launchOptions: import('puppeteer').LaunchOptions & import('puppeteer-core').LaunchOptions = {
        headless: true,
      };

    if (isVercel) {
      // Use lightweight packages for Vercel
      const chromium = (await import("@sparticuz/chromium")).default;
      puppeteer = await import("puppeteer-core");
      launchOptions = {
        ...launchOptions,
        args: [
          ...chromium.args,
          '--font-render-hinting=none',
          '--disable-font-subpixel-positioning',
          '--force-color-profile=srgb',
          '--disable-font-lookup-optimization',
          '--enable-font-antialiasing',
          '--disable-gpu'
        ],
        executablePath: await chromium.executablePath(),
      };
    } else {
      // Use full Puppeteer for local development
      puppeteer = await import("puppeteer");
      launchOptions = {
        ...launchOptions,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--font-render-hinting=none',
          '--disable-font-subpixel-positioning',
          '--force-color-profile=srgb',
          '--disable-font-lookup-optimization',
          '--enable-font-antialiasing'
        ],
        timeout: 30000
      };
    }

    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // Set reasonable timeouts
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    // Set viewport for better PDF rendering
    await page.setViewport({ width: 1200, height: 800 });

    // Emulate screen media type for better font rendering
    await page.emulateMediaType('screen');

    // Use template HTML directly with enhanced font support
    const enhancedHtml = htmlContent.includes('<!DOCTYPE html>')
      ? htmlContent.replace('<head>', `<head>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
      <style>
        @font-face {
          font-family: 'ArabicFont';
          src: local('Noto Sans Arabic'), local('Tahoma'), local('Arial Unicode MS'), local('DejaVu Sans'), local('Geeza Pro');
          unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF;
          font-display: swap;
        }
         body, .invoice-template, .arabic-text, .table th, .table td, .invoice-title, .invoice-number, h1, h2, h3, h4, h5, h6, p, .company-info, .bill-to, .supplier, .bilingual, .english, .arabic {
           font-family: 'ArabicFont', 'Noto Sans Arabic', 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Geeza Pro', 'Arial', sans-serif !important;
         }
      </style>`)
      : `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <meta charset="utf-8">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <title>Invoice</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap" rel="stylesheet">
      <style>
        @font-face {
          font-family: 'ArabicFont';
          src: local('Noto Sans Arabic'), local('Tahoma'), local('Arial Unicode MS'), local('DejaVu Sans'), local('Geeza Pro');
          unicode-range: U+0600-06FF, U+0750-077F, U+FB50-FDFF, U+FE70-FEFF;
          font-display: swap;
        }
         body, .table th, .table td, .invoice-title, .invoice-number, h1, h2, h3, h4, h5, h6, p, .company-info, .bill-to, .supplier, .bilingual, .english, .arabic {
           font-family: 'ArabicFont', 'Noto Sans Arabic', 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Geeza Pro', 'Arial', sans-serif;
           direction: rtl;
           text-align: right;
           margin: 0;
           padding: 20px;
         }
        .arabic-text {
          font-family: 'ArabicFont', 'Noto Sans Arabic', 'Tahoma', 'Arial Unicode MS', 'DejaVu Sans', 'Geeza Pro', 'Arial', sans-serif !important;
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: embed !important;
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
    `;

    // Load HTML content with error handling
    try {
      await page.setContent(enhancedHtml, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
       // Wait for fonts to load properly
       try {
         await page.evaluate(() => document.fonts.ready);
         console.log('Fonts loaded successfully via document.fonts.ready');
       } catch (fontError) {
         console.warn('Font loading check failed, using fallback timeout:', fontError);
         await new Promise(resolve => setTimeout(resolve, 5000));
       }
      
      // Test Arabic rendering
      const arabicTest = await page.evaluate(() => {
        const elements = document.querySelectorAll('*');
        const arabicElements: Array<{
          text: string;
          fontFamily: string;
          direction: string;
        }> = [];
        elements.forEach((el: Element) => {
          if (el.textContent && /[\u0600-\u06FF]/.test(el.textContent)) {
            const computedStyle = window.getComputedStyle(el);
            arabicElements.push({
              text: el.textContent,
              fontFamily: computedStyle.fontFamily,
              direction: computedStyle.direction
            });
          }
        });
        return arabicElements;
      });
      
      console.log('Arabic elements found:', arabicTest);
      
    } catch (contentError) {
      console.error('Error setting page content:', contentError);
      throw new Error('Failed to load HTML content for PDF generation');
    }

    // Generate PDF with error handling
    let pdfBuffer;
    try {
       pdfBuffer = await page.pdf({
         format: 'A4',
         printBackground: true,
         scale: 0.92,
         margin: {
           top: '10px',
           right: '10px',
           bottom: '10px',
           left: '10px'
         },
         timeout: 30000,
         waitForFonts: true
      });
    } catch (pdfError) {
      console.error('Error creating PDF:', pdfError);
      throw new Error('Failed to create PDF from HTML content');
    }

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('Generated PDF is empty');
    }

    return Buffer.from(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Re-throw with more context
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during PDF generation');
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
  }
}

// Generate invoice content (fallback when PDF generation is not available)
const generateInvoiceContent = async (invoice: InvoiceData): Promise<{ buffer: Buffer; filename: string; contentType: string }> => {
  try {
    // Try to create a proper formatted text invoice
    const invoiceText = `
INVOICE #${invoice.id.slice(-8)}
=====================================
Type: ${invoice.type.toUpperCase()}
Status: ${invoice.status}
Date: ${convertDateField(invoice.createdAt)?.toLocaleDateString() || 'N/A'}
Due Date: ${convertDateField(invoice.dueDate)?.toLocaleDateString() || 'N/A'}

CLIENT INFORMATION:
${invoice.type === 'sales' ? `Client: ${invoice.clientName || 'N/A'}` : `Supplier: ${invoice.supplierName || 'N/A'}`}
${invoice.type === 'sales' ? `Email: ${invoice.clientEmail || 'N/A'}` : `Email: ${invoice.supplierEmail || 'N/A'}`}

ITEMS:
-------------------------------------
${(invoice.items as InvoiceItemData[]).map((item: InvoiceItemData, index: number) =>
  `${index + 1}. ${item.name || 'N/A'}
   Quantity: ${item.quantity || 0} × $${(item.unitPrice || 0).toFixed(2)} = $${(item.total || 0).toFixed(2)}`
).join('\n\n')}

SUMMARY:
-------------------------------------
Subtotal: $${(invoice.subtotal || 0).toFixed(2)}
Tax Rate: ${invoice.taxRate || 0}%
Tax Amount: $${(invoice.taxAmount || 0).toFixed(2)}
TOTAL: $${invoice.total.toFixed(2)}

PAYMENTS:
-------------------------------------
${'payments' in invoice && Array.isArray(invoice.payments) && invoice.payments.length > 0
  ? (invoice.payments as Payment[]).map((p: Payment) => `${p.paymentMethod}: $${p.amount.toFixed(2)} (${convertDateField(p.paymentDate)?.toLocaleDateString() || 'N/A'})`).join('\n')
  : 'No payments recorded'
}

Amount Due: $${(invoice.total - (('payments' in invoice && Array.isArray(invoice.payments) ? (invoice.payments as Payment[]).reduce((sum: number, p: Payment) => sum + p.amount, 0) : 0))).toFixed(2)}
=====================================

This invoice was generated from DijiPOS System.
For questions, please contact the sender.
    `.trim();

    return {
      buffer: Buffer.from(invoiceText, 'utf-8'),
      filename: `invoice-${invoice.id.slice(-8)}.txt`,
      contentType: 'text/plain'
    };
  } catch (error) {
    console.error('Error generating invoice content:', error);
    // Fallback to JSON
    const jsonContent = JSON.stringify(invoice, null, 2);
    return {
      buffer: Buffer.from(jsonContent, 'utf-8'),
      filename: `invoice-${invoice.id.slice(-8)}.json`,
      contentType: 'application/json'
    };
  }
};

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, recipientEmail, subject, message, organizationId, templateId } = await request.json();

    if (!invoiceId || !recipientEmail || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate SMTP configuration
    try {
      validateSMTPConfig();
    } catch (configError) {
      console.error('SMTP Configuration validation failed:', configError);
      return NextResponse.json(
        {
          error: configError instanceof Error ? configError.message : 'SMTP configuration error',
          code: 'SMTP_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    // Fetch real invoice data
    const invoice = await getInvoice(invoiceId);

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // Verify organization matches
    if (invoice.organizationId !== organizationId) {
      return NextResponse.json(
        { error: 'Unauthorized access to invoice' },
        { status: 403 }
      );
    }

    // Get organization data
    const orgDoc = await adminDb.collection('organizations').doc(organizationId).get();
    const organization = orgDoc.data() || {};

    // Generate invoice attachment
    let invoiceContent;
    if (templateId) {
      try {
        // Use specified template
        const templateContent = getLocalTemplate(templateId, invoice.type);
        if (!templateContent) {
          console.error(`Template not found: ${templateId}`);
          return NextResponse.json(
            { error: 'Invoice template not found. Please select a different template or contact support.' },
            { status: 404 }
          );
        }

        // Validate template has content
        if (!templateContent || templateContent.trim().length === 0) {
          console.error(`Template has no content: ${templateId}`);
          return NextResponse.json(
            { error: 'Invoice template is empty. Please select a different template or contact support.' },
            { status: 400 }
          );
        }

        let htmlContent;
        try {
          htmlContent = await renderInvoiceWithTemplate(templateContent, invoice, organization);
        } catch (renderError) {
          console.error('Error rendering invoice template:', renderError);
          return NextResponse.json(
            {
              error: 'Failed to render invoice template. The template may be corrupted.',
              details: process.env.NODE_ENV === 'development' ? String(renderError) : undefined
            },
            { status: 500 }
          );
        }

        // Validate rendered HTML
        if (!htmlContent || htmlContent.trim().length === 0) {
          console.error('Template rendering produced empty HTML');
          return NextResponse.json(
            { error: 'Invoice template rendering failed. Please try a different template.' },
            { status: 500 }
          );
        }

        let pdfBuffer;
        try {
          pdfBuffer = await generatePDF(htmlContent);
        } catch (pdfError) {
          console.error('Error generating PDF:', pdfError);
          return NextResponse.json(
            {
              error: 'Failed to generate PDF. Please try again or contact support.',
              details: process.env.NODE_ENV === 'development' ? String(pdfError) : undefined
            },
            { status: 500 }
          );
        }

        invoiceContent = {
          buffer: pdfBuffer,
          filename: `invoice-${invoice.id.slice(-8)}.pdf`,
          contentType: 'application/pdf'
        };
      } catch (templateError) {
        console.error('Unexpected error processing template:', templateError);
        return NextResponse.json(
          {
            error: 'An unexpected error occurred while processing the invoice template.',
            details: process.env.NODE_ENV === 'development' ? String(templateError) : undefined
          },
          { status: 500 }
        );
      }
    } else {
      // Fallback to text generation
      try {
        invoiceContent = await generateInvoiceContent(invoice);
      } catch (fallbackError) {
        console.error('Error generating fallback invoice content:', fallbackError);
        return NextResponse.json(
          {
            error: 'Failed to generate invoice content. Please contact support.',
            details: process.env.NODE_ENV === 'development' ? String(fallbackError) : undefined
          },
          { status: 500 }
        );
      }
    }

    // Create transporter and send email
    const transporter = createTransporter();

    const mailOptions = {
      from: smtpConfig.auth.user,
      to: recipientEmail,
      subject,
      text: message,
      attachments: [
        {
          filename: invoiceContent.filename,
          content: invoiceContent.buffer,
          contentType: invoiceContent.contentType,
        },
      ],
    };

    // Send email with detailed error handling
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to ${recipientEmail} for invoice ${invoiceId}`);
    } catch (smtpError: unknown) {
      const error = smtpError as SMTPErr;
      console.error('SMTP Error sending email:', {
        error: error?.message,
        code: error?.code,
        command: error?.command,
        response: error?.response,
        responseCode: error?.responseCode,
      });

      // Provide specific error messages based on SMTP error codes
      let errorMessage = 'Failed to send email due to SMTP error.';
      let errorCode = 'SMTP_ERROR';

      if (error?.code === 'EAUTH') {
        errorMessage = 'SMTP authentication failed. Please check your SMTP username and password.';
        errorCode = 'SMTP_AUTH_FAILED';
      } else if (error?.code === 'ECONNREFUSED') {
        errorMessage = 'Cannot connect to SMTP server. Please check your SMTP host and port settings.';
        errorCode = 'SMTP_CONNECTION_FAILED';
      } else if (error?.code === 'ETIMEDOUT') {
        errorMessage = 'SMTP connection timed out. Please check your network connection and SMTP server.';
        errorCode = 'SMTP_TIMEOUT';
      } else if (error?.responseCode === 550) {
        errorMessage = 'Email rejected by SMTP server. The recipient email address may be invalid.';
        errorCode = 'SMTP_RECIPIENT_REJECTED';
      } else if (error?.message) {
        errorMessage = `SMTP Error: ${error.message}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          code: errorCode,
          details: process.env.NODE_ENV === 'development' ? {
            smtpCode: error?.code,
            smtpResponse: error?.response,
            smtpResponseCode: error?.responseCode,
          } : undefined
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to send email',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
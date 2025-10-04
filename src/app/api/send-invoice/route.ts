import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Invoice, ItemType, InvoiceStatus, InvoiceType, Payment } from '@/types';
import { adminDb } from '@/lib/firebase/config';

// SMTP Error interface
interface SMTPErr {
  message?: string;
  code?: string;
  command?: string;
  response?: string;
  responseCode?: number;
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
  [key: string]: unknown;
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
      createdAt: data?.createdAt?.toDate() || new Date(),
      updatedAt: data?.updatedAt?.toDate() || new Date(),
      invoiceDate: data?.invoiceDate?.toDate(),
      dueDate: data?.dueDate?.toDate(),
      validUntil: data?.validUntil?.toDate(),
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

// Generate invoice content (fallback when PDF generation is not available)
const generateInvoiceContent = async (invoice: Invoice): Promise<{ buffer: Buffer; filename: string; contentType: string }> => {
  try {
    // Try to create a proper formatted text invoice
    const invoiceText = `
INVOICE #${invoice.id.slice(-8)}
=====================================
Type: ${invoice.type.toUpperCase()}
Status: ${invoice.status}
Date: ${new Date(invoice.createdAt).toLocaleDateString()}
Due Date: ${invoice.dueDate instanceof Date ? invoice.dueDate.toLocaleDateString() : new Date(invoice.dueDate).toLocaleDateString()}

CLIENT INFORMATION:
${invoice.type === 'sales' ? `Client: ${invoice.clientName}` : `Supplier: ${invoice.supplierId || 'N/A'}`}
${invoice.type === 'sales' ? `Email: ${invoice.clientEmail || 'N/A'}` : ''}

ITEMS:
-------------------------------------
${invoice.items.map((item, index) => 
  `${index + 1}. ${item.name}
   Quantity: ${item.quantity} × $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`
).join('\n\n')}

SUMMARY:
-------------------------------------
Subtotal: $${invoice.subtotal.toFixed(2)}
Tax Rate: ${invoice.taxRate}%
Tax Amount: $${invoice.taxAmount.toFixed(2)}
TOTAL: $${invoice.total.toFixed(2)}

PAYMENTS:
-------------------------------------
${'payments' in invoice && invoice.payments.length > 0
  ? invoice.payments.map((p: Payment) => `${p.paymentMethod}: $${p.amount.toFixed(2)} (${new Date(p.paymentDate).toLocaleDateString()})`).join('\n')
  : 'No payments recorded'
}

Amount Due: $${(invoice.total - (('payments' in invoice ? invoice.payments.reduce((sum: number, p: Payment) => sum + p.amount, 0) : 0))).toFixed(2)}
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
    const { invoiceId, recipientEmail, subject, message, organizationId } = await request.json();

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

    // Generate invoice attachment
    const invoiceContent = await generateInvoiceContent(invoice as unknown as Invoice);

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
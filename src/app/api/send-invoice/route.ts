import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Invoice, ItemType, InvoiceStatus, InvoiceType } from '@/types';
import { getInvoice } from '@/lib/firebase/firestore/invoices';

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

// Create transporter
const createTransporter = () => {
  if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS in your environment variables.');
  }

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
  ? invoice.payments.map((p: any) => `${p.paymentType}: $${p.amount.toFixed(2)} (${new Date(p.createdAt).toLocaleDateString()})`).join('\n')
  : 'No payments recorded'
}

Amount Due: $${(invoice.total - (('payments' in invoice ? invoice.payments.reduce((sum: number, p: any) => sum + p.amount, 0) : 0))).toFixed(2)}
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

    // Check if SMTP is configured
    if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
      return NextResponse.json(
        { 
          error: 'Email service is not configured. Please contact your administrator to set up SMTP settings.',
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
    const invoiceContent = await generateInvoiceContent(invoice);

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

    await transporter.sendMail(mailOptions);

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
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { Invoice, ItemType, InvoiceStatus } from '@/types';

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
    throw new Error('SMTP configuration is missing. Please check environment variables.');
  }

  return nodemailer.createTransport(smtpConfig);
};

// Generate PDF content (simplified version - you might want to use a proper PDF library)
const generatePDFContent = async (invoice: Invoice): Promise<Buffer> => {
  // This is a placeholder - in a real implementation, you would:
  // 1. Use a PDF library like puppeteer or jsPDF
  // 2. Generate the PDF using your existing invoice template
  // 3. Return the PDF as a Buffer
  
  // For now, we'll create a simple text representation
  const invoiceText = `
Invoice #${invoice.id.slice(-8)}
Type: ${invoice.type}
Total: $${invoice.total.toFixed(2)}
Due Date: ${invoice.dueDate instanceof Date ? invoice.dueDate.toLocaleDateString() : new Date(invoice.dueDate).toLocaleDateString()}
Status: ${invoice.status}

Items:
${invoice.items.map(item => `${item.name} - ${item.quantity} x $${item.unitPrice.toFixed(2)} = $${item.total.toFixed(2)}`).join('\n')}

Subtotal: $${invoice.subtotal.toFixed(2)}
Tax: $${invoice.taxAmount.toFixed(2)}
Total: $${invoice.total.toFixed(2)}
  `;

  return Buffer.from(invoiceText, 'utf-8');
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

    // Fetch invoice data (you'll need to implement this based on your data source)
    // For now, we'll create a mock invoice
    const mockInvoice: Invoice = {
      id: invoiceId,
      organizationId,
      type: 'sales',
      clientName: 'Test Client',
      clientEmail: recipientEmail,
      items: [
        {
          id: '1',
          type: ItemType.PRODUCT,
          name: 'Test Product',
          quantity: 1,
          unitPrice: 100,
          total: 100,
        }
      ],
      subtotal: 100,
      taxRate: 10,
      taxAmount: 10,
      total: 110,
      status: InvoiceStatus.DRAFT,
      dueDate: new Date(),
      payments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Generate PDF attachment
    const pdfBuffer = await generatePDFContent(mockInvoice);

    // Create transporter and send email
    const transporter = createTransporter();

    const mailOptions = {
      from: smtpConfig.auth.user,
      to: recipientEmail,
      subject,
      text: message,
      attachments: [
        {
          filename: `invoice-${invoiceId.slice(-8)}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
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
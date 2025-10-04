'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { SalesInvoice, PurchaseInvoice, Customer, Supplier, Organization } from '@/types';
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmailInvoiceDialogProps {
  invoice: SalesInvoice | PurchaseInvoice | null;
  customer?: Customer;
  supplier?: Supplier;
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplateId?: string;
}

export function EmailInvoiceDialog({
  invoice,
  customer,
  supplier,
  organization,
  open,
  onOpenChange,
  selectedTemplateId
}: EmailInvoiceDialogProps) {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Initialize form when invoice changes
  React.useEffect(() => {
    if (invoice && organization) {
      const recipient = invoice.type === 'sales' 
        ? customer?.email || ''
        : supplier?.email || '';
      
      const invoiceNumber = invoice.type === 'purchase'
        ? (invoice as PurchaseInvoice).invoiceNumber || invoice.id.slice(-8)
        : invoice.id.slice(-8);

      setRecipientEmail(recipient);
      setSubject(`Invoice #${invoiceNumber} from ${organization.name}`);
      
      const dueDate = invoice.dueDate instanceof Date 
        ? invoice.dueDate.toLocaleDateString()
        : new Date(invoice.dueDate).toLocaleDateString();
        
      setMessage(`Dear ${invoice.type === 'sales' ? customer?.name || 'Client' : supplier?.name || 'Supplier'},\n\nPlease find attached invoice #${invoiceNumber} for the amount of $${invoice.total.toFixed(2)}.\n\nDue date: ${dueDate}\n\nThank you for your business.\n\nBest regards,\n${organization.name}`);
    }
  }, [invoice, customer, supplier, organization]);

  const handleSendEmail = async () => {
    if (!invoice || !organization) return;

    if (!recipientEmail.trim()) {
      toast.error('Please enter a recipient email address');
      return;
    }

    if (!subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          recipientEmail,
          subject,
          message,
          organizationId: organization.id,
          templateId: selectedTemplateId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();

        // Handle specific SMTP error codes with user-friendly messages
        if (error.code === 'SMTP_NOT_CONFIGURED') {
          throw new Error('Email service is not configured. Please contact your administrator to set up SMTP settings.');
        } else if (error.code === 'SMTP_AUTH_FAILED') {
          throw new Error('Email authentication failed. Please check SMTP username and password configuration.');
        } else if (error.code === 'SMTP_CONNECTION_FAILED') {
          throw new Error('Cannot connect to email server. Please check SMTP host and port settings.');
        } else if (error.code === 'SMTP_TIMEOUT') {
          throw new Error('Email server connection timed out. Please check your network connection.');
        } else if (error.code === 'SMTP_RECIPIENT_REJECTED') {
          throw new Error('Email was rejected by the server. Please verify the recipient email address.');
        } else if (error.code === 'SMTP_ERROR') {
          throw new Error(error.error || 'Email sending failed due to server configuration issue.');
        }

        // Fallback to generic error message
        throw new Error(error.error || error.message || 'Failed to send email');
      }

      toast.success('Invoice sent successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send email');
    } finally {
      setIsSending(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Send Invoice via Email
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="recipient-email">Recipient Email *</Label>
            <Input
              id="recipient-email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="Enter recipient email address"
              required
            />
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message"
              rows={8}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendEmail}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
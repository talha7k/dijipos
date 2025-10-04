'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Invoice, Customer, Supplier, Organization } from '@/types';
import { Mail, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EmailInvoiceDialogProps {
  invoice: Invoice | null;
  customer?: Customer;
  supplier?: Supplier;
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmailInvoiceDialog({
  invoice,
  customer,
  supplier,
  organization,
  open,
  onOpenChange
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
        ? invoice.invoiceNumber || invoice.id.slice(-8)
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        if (error.code === 'SMTP_NOT_CONFIGURED') {
          throw new Error('Email service is not configured. Please contact your administrator to set up SMTP settings.');
        }
        
        throw new Error(error.message || 'Failed to send email');
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
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer } from 'lucide-react';
import { Quote, Organization, Customer, QuoteTemplate, PrinterSettings } from '@/types';
import { renderQuoteTemplate } from '@/lib/template-renderer';
import { toast } from 'sonner';

interface QuotePrintDialogProps {
  quote: Quote;
  organization: Organization | null;
  quoteTemplates: QuoteTemplate[];
  customer?: Customer;
  printerSettings?: PrinterSettings | null;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function QuotePrintDialog({
  quote,
  organization,
  quoteTemplates,
  customer,
  printerSettings,
  children,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange
}: QuotePrintDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledOnOpenChange || setInternalOpen;

  // Set default template on open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const defaultTemplate = quoteTemplates.find(t => t.isDefault);
      setSelectedTemplate(defaultTemplate?.id || quoteTemplates[0]?.id || '');
    }
    setOpen(newOpen);
  };

  const generateQuote = async () => {
    const template = quoteTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsGenerating(true);

    try {
      // Render the quote using template
      const renderedContent = await renderQuoteTemplate(template, quote, organization, customer, printerSettings || undefined);

      // Create a new window for printing (safer than manipulating current DOM)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.');
      }

      // Write the quote content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Quote - ${quote.id}</title>
            <style>
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
              }
            </style>
          </head>
          <body>
            ${renderedContent}
          </body>
        </html>
      `);

      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        // Close the window after printing (with a delay to allow print dialog)
        setTimeout(() => {
          printWindow.close();
          setIsGenerating(false);
          setOpen(false);
          toast.success('Quote sent to printer!');
        }, 1000);
      };

    } catch (error) {
      console.error('Error generating quote:', error);
      setIsGenerating(false);
      toast.error(error instanceof Error ? error.message : 'Error generating quote. Please try again.');
    }
  };



  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {controlledOpen === undefined && (
        <DialogTrigger asChild>
          {children}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Quote
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={generateQuote}
                disabled={!selectedTemplate || quoteTemplates.length === 0 || isGenerating}
                className="flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Print Quote'}
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Quote & Settings */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quote Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="font-medium py-1">Quote #:</td>
                      <td className="py-1">{quote.id}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-1">Date:</td>
                      <td className="py-1">{new Date(quote.createdAt).toLocaleString()}</td>
                    </tr>
                    {quote.validUntil && (
                      <tr>
                        <td className="font-medium py-1">Valid Until:</td>
                        <td className="py-1">{new Date(quote.validUntil).toLocaleDateString()}</td>
                      </tr>
                    )}
                    {customer && (
                      <>
                        <tr>
                          <td className="font-medium py-1">Customer:</td>
                          <td className="py-1">{customer.name}</td>
                        </tr>
                        {customer.email && (
                          <tr>
                            <td className="font-medium py-1">Email:</td>
                            <td className="py-1">{customer.email}</td>
                          </tr>
                        )}
                      </>
                    )}
                    <tr>
                      <td className="font-medium py-1">Total:</td>
                      <td className="py-1 font-bold">${(quote.total || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-1">Status:</td>
                      <td className="py-1">
                        <Badge variant="outline" className="ml-0">{quote.status}</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>

            
          </div>

          {/* Right Column - Template Selection & Actions */}
          <div className="space-y-6">
            {/* Template Selection */}
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Select Quote Template</CardTitle>
              </CardHeader>
              <CardContent>
                {quoteTemplates.length === 0 ? (
                  <p className="text-muted-foreground">No quote templates available. Please create templates in Settings.</p>
                ) : (
                  <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <div className="grid gap-3">
                      {quoteTemplates.map((template) => (
                        <div key={template.id} className="flex items-center space-x-3 p-3 border rounded hover:bg-accent/50">
                          <RadioGroupItem value={template.id} id={template.id} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Label htmlFor={template.id} className="font-medium cursor-pointer">
                                {template.name}
                              </Label>
                              {template.isDefault && <Badge variant="default">Default</Badge>}
                              <Badge variant="outline">{template.type}</Badge>
                            </div>
                            {template.description && (
                              <p className="text-sm text-muted-foreground">{template.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                )}
              </CardContent>
            </Card>


          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
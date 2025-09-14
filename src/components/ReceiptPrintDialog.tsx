import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';
import { Order, ReceiptTemplate, Organization } from '@/types';
import thermalPrinter from '@/lib/thermal-printer';
import { renderReceiptTemplate } from '@/lib/template-renderer';
import { toast } from 'sonner';
import html2pdf from 'html2pdf.js';

interface ReceiptPrintDialogProps {
  order: Order;
  organization: Organization | null;
  receiptTemplates: ReceiptTemplate[];
  children: React.ReactNode;
}

export function ReceiptPrintDialog({
  order,
  organization,
  receiptTemplates,
  children
}: ReceiptPrintDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Set default template on open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      const defaultTemplate = receiptTemplates.find(t => t.isDefault);
      setSelectedTemplate(defaultTemplate?.id || receiptTemplates[0]?.id || '');
    }
    setOpen(newOpen);
  };

  const generateReceipt = async () => {
    const template = receiptTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsGenerating(true);
    
    try {
      if (template.type === 'thermal') {
        try {
          // Print the receipt using the service
          await thermalPrinter.printReceipt({ order, organization });
          setIsGenerating(false);
          setOpen(false);
          toast.success('Receipt printed successfully!');
        } catch (error) {
          console.error('Printing failed:', error);
          setIsGenerating(false);
          toast.error(error instanceof Error ? error.message : 'Failed to print receipt. Please check printer connection.');
        }
      } else {
        // For A4 templates, render using template and print directly in current window
        const renderedContent = renderReceiptTemplate(template, order, organization);
        const originalContent = document.body.innerHTML;
        
        // Replace body content with rendered receipt
        document.body.innerHTML = renderedContent;

        // Print directly
        window.print();
        
        // Restore original content after printing
        setTimeout(() => {
          document.body.innerHTML = originalContent;
          setIsGenerating(false);
          setOpen(false);
          toast.success('Receipt sent to printer!');
        }, 100);
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      setIsGenerating(false);
      toast.error('Error generating receipt. Please try again.');
    }
  };

  const downloadReceipt = async () => {
    const template = receiptTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      // Generate HTML using template renderer
      const htmlContent = renderReceiptTemplate(template, order, organization);

      // Convert HTML to PDF and download
      const element = document.createElement('div');
      element.innerHTML = htmlContent;
      
      const opt = {
        margin: 10,
        filename: `receipt-${order.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Error downloading PDF. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Order & Settings */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="font-medium py-1">Order #:</td>
                      <td className="py-1">{order.orderNumber}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-1">Date:</td>
                      <td className="py-1">{new Date(order.createdAt).toLocaleString()}</td>
                    </tr>
                    {order.customerName && (
                      <tr>
                        <td className="font-medium py-1">Customer:</td>
                        <td className="py-1">{order.customerName}</td>
                      </tr>
                    )}
                    {order.customerPhone && (
                      <tr>
                        <td className="font-medium py-1">Phone:</td>
                        <td className="py-1">{order.customerPhone}</td>
                      </tr>
                    )}
                    {order.tableName && (
                      <tr>
                        <td className="font-medium py-1">Table:</td>
                        <td className="py-1">{order.tableName}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="font-medium py-1">Total:</td>
                      <td className="py-1 font-bold">${(order.total || 0).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="font-medium py-1">Status:</td>
                      <td className="py-1">
                        <Badge variant="outline" className="ml-0">{order.status}</Badge>
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
                <CardTitle className="text-lg">Select Receipt Template</CardTitle>
              </CardHeader>
              <CardContent>
                {receiptTemplates.length === 0 ? (
                  <p className="text-muted-foreground">No receipt templates available. Please create templates in Settings.</p>
                ) : (
                  <RadioGroup value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <div className="grid gap-3">
                      {receiptTemplates.map((template) => (
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

            {/* Actions */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={downloadReceipt}
                disabled={!selectedTemplate || receiptTemplates.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={generateReceipt}
                  disabled={!selectedTemplate || receiptTemplates.length === 0 || isGenerating}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  {isGenerating ? 'Generating...' : 'Print Receipt'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
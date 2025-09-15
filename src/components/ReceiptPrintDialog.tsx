import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Printer, Download } from 'lucide-react';
import { Order, ReceiptTemplate, Organization } from '@/types';
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
  const [isDownloading, setIsDownloading] = useState(false);

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
      // Render the receipt using template
      const renderedContent = await renderReceiptTemplate(template, order, organization);

      // Create a new window for printing (safer than manipulating current DOM)
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        throw new Error('Unable to open print window. Please check your popup blocker.');
      }

      // Write the receipt content to the new window
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${order.orderNumber}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @media print {
                body { margin: 0; }
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
          toast.success('Receipt sent to printer!');
        }, 1000);
      };

    } catch (error) {
      console.error('Error generating receipt:', error);
      setIsGenerating(false);
      toast.error(error instanceof Error ? error.message : 'Error generating receipt. Please try again.');
    }
  };

  const downloadReceipt = async () => {
    const template = receiptTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsDownloading(true);

    try {
      // Generate HTML using template renderer
      const htmlContent = await renderReceiptTemplate(template, order, organization);

      // Convert HTML to PDF and download
      const element = document.createElement('div');
      element.innerHTML = htmlContent;

      // Preload images before generating PDF
      const images = element.querySelectorAll('img');
      const imagePromises = Array.from(images).map(img => {
        return new Promise<void>((resolve) => {
          if (img.complete) {
            resolve();
          } else {
            img.onload = () => resolve();
            img.onerror = () => resolve(); // Continue even if image fails
          }
        });
      });

      // Wait for all images to load
      await Promise.all(imagePromises);

      const opt = {
        margin: 10,
        filename: `receipt-${order.orderNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: true,
          letterRendering: true,
          foreignObjectRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt).from(element).save();

      // Clean up the temporary element
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }

      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);

      // Provide more specific error messages
      let errorMessage = 'Error downloading PDF. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('html2canvas')) {
          errorMessage = 'Error rendering receipt content. Please try a different template.';
        } else if (error.message.includes('jsPDF')) {
          errorMessage = 'Error generating PDF. Please check your browser settings.';
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Receipt
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadReceipt}
                disabled={!selectedTemplate || receiptTemplates.length === 0 || isDownloading}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
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
                   <div className="space-y-3">
                     <Label htmlFor="template-select">Select Receipt Template</Label>
                     <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                       <SelectTrigger>
                         <SelectValue placeholder="Choose a template" />
                       </SelectTrigger>
                       <SelectContent>
                         {receiptTemplates.map((template) => (
                           <SelectItem key={template.id} value={template.id}>
                             <div className="flex items-center gap-2">
                               <span>{template.name}</span>
                               {template.isDefault && <Badge variant="default" className="text-xs">Default</Badge>}
                               <Badge variant="outline" className="text-xs">{template.type}</Badge>
                             </div>
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                     {selectedTemplate && (
                       <div className="p-3 bg-muted/50 rounded-md">
                         {(() => {
                           const template = receiptTemplates.find(t => t.id === selectedTemplate);
                           return template ? (
                             <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <span className="font-medium">{template.name}</span>
                                 {template.isDefault && <Badge variant="default">Default</Badge>}
                                 <Badge variant="outline">{template.type}</Badge>
                               </div>
                               {template.description && (
                                 <p className="text-sm text-muted-foreground">{template.description}</p>
                               )}
                             </div>
                           ) : null;
                         })()}
                       </div>
                     )}
                   </div>
                 )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-between">
               <Button
                 variant="outline"
                 onClick={downloadReceipt}
                 disabled={!selectedTemplate || receiptTemplates.length === 0 || isDownloading}
                 className="flex items-center gap-2"
               >
                 <Download className="h-4 w-4" />
                 {isDownloading ? 'Downloading...' : 'Download PDF'}
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
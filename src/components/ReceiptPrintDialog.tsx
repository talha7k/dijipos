import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';
import { Order, ReceiptTemplate, PrinterSettings, Organization, CHARACTER_SETS } from '@/types';
import thermalPrinter from '@/lib/thermal-printer';
import { toast } from 'sonner';

interface ReceiptPrintDialogProps {
  order: Order;
  organization: Organization | null;
  receiptTemplates: ReceiptTemplate[];
  printerSettings: PrinterSettings | null;
  children: React.ReactNode;
}

export function ReceiptPrintDialog({
  order,
  organization,
  receiptTemplates,
  printerSettings,
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
          // Update printer config if settings are available
          if (printerSettings) {
            thermalPrinter.updateConfig({
              paperWidth: printerSettings.paperWidth,
              fontSize: printerSettings.fontSize,
              characterSet: printerSettings.characterSet,
            });
          }

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
        // Prepare template data for A4 templates
        const templateData = {
          companyName: organization?.name || '',
          companyAddress: organization?.address || '',
          companyPhone: organization?.phone || '',
          companyVat: organization?.vatNumber || '',
          orderNumber: order.orderNumber,
          orderDate: new Date(order.createdAt).toLocaleString(),
          tableName: order.tableName || '',
          customerName: order.customerName || '',
          items: order.items,
           subtotal: (order.subtotal || 0).toFixed(2),
           vatRate: order.taxRate || 0,
           vatAmount: (order.taxAmount || 0).toFixed(2),
           total: (order.total || 0).toFixed(2),
          paymentMethod: 'Cash' // Default, can be enhanced later
        };

        // Simple template replacement
        let htmlContent = template.content;

        // Replace simple placeholders
        Object.entries(templateData).forEach(([key, value]) => {
          if (key !== 'items') {
            const regex = new RegExp(`{{${key}}}`, 'g');
            htmlContent = htmlContent.replace(regex, String(value));
          }
        });

        // Handle items loop
        const itemsRegex = /{{#each items}}([\s\S]*?){{\/each}}/;
        const itemsMatch = htmlContent.match(itemsRegex);
        if (itemsMatch && templateData.items) {
          const itemTemplate = itemsMatch[1];
          const itemsHtml = templateData.items.map(item => {
            let itemHtml = itemTemplate;
            Object.entries(item).forEach(([key, value]) => {
              const regex = new RegExp(`{{${key}}}`, 'g');
              itemHtml = itemHtml.replace(regex, String(value));
            });
            return itemHtml;
          }).join('');
          htmlContent = htmlContent.replace(itemsRegex, itemsHtml);
        }

        // Create and open print window
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();

          // Wait for content to load then print
          printWindow.onload = () => {
            printWindow.print();
            setIsGenerating(false);
            setOpen(false);
          };
        } else {
          setIsGenerating(false);
          toast.error('Please allow popups to print receipts');
        }
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      setIsGenerating(false);
      toast.error('Error generating receipt. Please try again.');
    }
  };

  const downloadReceipt = () => {
    const template = receiptTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      // Prepare template data (same as generateReceipt)
      const templateData = {
        companyName: organization?.name || '',
        companyAddress: organization?.address || '',
        companyPhone: organization?.phone || '',
        companyVat: organization?.vatNumber || '',
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleString(),
        tableName: order.tableName || '',
        customerName: order.customerName || '',
        items: order.items,
        subtotal: (order.subtotal || 0).toFixed(2),
         vatRate: order.taxRate || 0,
         vatAmount: (order.taxAmount || 0).toFixed(2),
         total: (order.total || 0).toFixed(2),
        paymentMethod: 'Cash'
      };

      let htmlContent = template.content;
      
      // Replace placeholders (same logic as above)
      Object.entries(templateData).forEach(([key, value]) => {
        if (key !== 'items') {
          const regex = new RegExp(`{{${key}}}`, 'g');
          htmlContent = htmlContent.replace(regex, String(value));
        }
      });

      const itemsRegex = /{{#each items}}([\s\S]*?){{\/each}}/;
      const itemsMatch = htmlContent.match(itemsRegex);
      if (itemsMatch && templateData.items) {
        const itemTemplate = itemsMatch[1];
        const itemsHtml = templateData.items.map(item => {
          let itemHtml = itemTemplate;
          Object.entries(item).forEach(([key, value]) => {
            const regex = new RegExp(`{{${key}}}`, 'g');
            itemHtml = itemHtml.replace(regex, String(value));
          });
          return itemHtml;
        }).join('');
        htmlContent = htmlContent.replace(itemsRegex, itemsHtml);
      }

      // Create and download file
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${order.orderNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast.error('Error downloading receipt. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <span data-print-receipt-trigger className="hidden">
          {children}
        </span>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Receipt
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Order #:</span>
                  <span className="ml-2">{order.orderNumber}</span>
                </div>
                <div>
                  <span className="font-medium">Date:</span>
                  <span className="ml-2">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <span className="ml-2 font-bold">${(order.total || 0).toFixed(2)}</span>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <Badge variant="outline" className="ml-2">{order.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Printer Settings */}
          {printerSettings && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Printer Settings</CardTitle>
              </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                     <span className="font-medium">Paper Width:</span>
                     <span className="ml-2">{printerSettings.paperWidth}mm</span>
                   </div>
                   <div>
                     <span className="font-medium">Font Size:</span>
                     <span className="ml-2">{printerSettings.fontSize}</span>
                   </div>
                   <div>
                     <span className="font-medium">Chars per Line:</span>
                     <span className="ml-2">{printerSettings.characterPerLine}</span>
                   </div>
                   <div>
                     <span className="font-medium">Character Set:</span>
                     <span className="ml-2">{printerSettings.characterSet}</span>
                   </div>
                 </div>

                 {/* Print Method Info */}
                 <div className="border-t pt-4 mt-4">
                   <h4 className="text-sm font-medium mb-2">Print Method:</h4>
                   <div className="bg-blue-50 border border-blue-200 rounded p-3">
                     <div className="flex items-center gap-2 text-blue-700 mb-1">
                       <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                       <span className="text-sm font-medium">Browser Print (Active)</span>
                     </div>
                     <p className="text-sm text-blue-600">
                       Receipt will open in your browser&apos;s print dialog, optimized for thermal printers.
                       Includes QR codes containing order details for easy scanning.
                     </p>
                   </div>
                 </div>
               </CardContent>
            </Card>
          )}

          {/* Template Selection */}
          <Card>
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
              Download HTML
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
      </DialogContent>
    </Dialog>
  );
}
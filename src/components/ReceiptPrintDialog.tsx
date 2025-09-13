import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';
import { Order, ReceiptTemplate, PrinterSettings, Tenant } from '@/types';
import thermalPrinter from '@/lib/thermal-printer';

interface ReceiptPrintDialogProps {
  order: Order;
  tenant: Tenant | null;
  receiptTemplates: ReceiptTemplate[];
  printerSettings: PrinterSettings | null;
  children: React.ReactNode;
}

export function ReceiptPrintDialog({
  order,
  tenant,
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
              type: printerSettings.printerType,
              width: printerSettings.characterPerLine,
              characterSet: printerSettings.characterSet,
              baudRate: printerSettings.baudRate,
            });
          }

          // Print the receipt using the service
          await thermalPrinter.printReceipt({ order, tenant });
          setIsGenerating(false);
          setOpen(false);
          alert('Receipt printed successfully!');
        } catch (error) {
          console.error('Printing failed:', error);
          setIsGenerating(false);
          alert(error instanceof Error ? error.message : 'Failed to print receipt. Please check printer connection.');
        }
      } else {
        // Prepare template data for A4 templates
        const templateData = {
        companyName: tenant?.name || '',
        companyAddress: tenant?.address || '',
        companyPhone: tenant?.phone || '',
        companyVat: tenant?.vatNumber || '',
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString(),
        tableName: order.tableName || '',
        customerName: order.customerName || '',
        items: order.items,
        subtotal: order.subtotal.toFixed(2),
        vatRate: order.taxRate,
        vatAmount: order.taxAmount.toFixed(2),
        total: order.total.toFixed(2),
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
          alert('Please allow popups to print receipts');
        }
      }
    } catch (error) {
      console.error('Error generating receipt:', error);
      setIsGenerating(false);
      alert('Error generating receipt. Please try again.');
    }
  };

  const downloadReceipt = () => {
    const template = receiptTemplates.find(t => t.id === selectedTemplate);
    if (!template) return;

    try {
      // Prepare template data (same as generateReceipt)
      const templateData = {
        companyName: tenant?.name || '',
        companyAddress: tenant?.address || '',
        companyPhone: tenant?.phone || '',
        companyVat: tenant?.vatNumber || '',
        orderNumber: order.orderNumber,
        orderDate: new Date(order.createdAt).toLocaleDateString(),
        tableName: order.tableName || '',
        customerName: order.customerName || '',
        items: order.items,
        subtotal: order.subtotal.toFixed(2),
        vatRate: order.taxRate,
        vatAmount: order.taxAmount.toFixed(2),
        total: order.total.toFixed(2),
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
      alert('Error downloading receipt. Please try again.');
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
                  <span className="ml-2">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium">Total:</span>
                  <span className="ml-2 font-bold">${order.total.toFixed(2)}</span>
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
                    <span className="font-medium">Auto Cut:</span>
                    <Badge variant={printerSettings.autoCut ? "default" : "secondary"} className="ml-2">
                      {printerSettings.autoCut ? "Enabled" : "Disabled"}
                    </Badge>
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
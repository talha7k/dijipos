import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Printer, Download } from 'lucide-react';
import { Order, ReceiptTemplate, PrinterSettings, Organization } from '@/types';
import thermalPrinter from '@/lib/thermal-printer';
import { toast } from 'sonner';
import Receipt from '@/components/templates/Receipt';

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
        // For A4 templates, use the Receipt template component
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          // Create a complete HTML document with the Receipt component rendered
          const receiptHtml = `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Receipt - ${order.orderNumber}</title>
              <style>
                body { 
                  font-family: system-ui, -apple-system, sans-serif; 
                  margin: 0; 
                  padding: 20px; 
                  background: white;
                }
                .receipt-container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 20px;
                  border: 1px solid #ddd;
                }
                @media print {
                  body { padding: 0; }
                  .receipt-container { border: none; }
                }
              </style>
            </head>
            <body>
              <div class="receipt-container">
                <div style="text-align: center; margin-bottom: 20px;">
                  <h2 style="margin: 0 0 10px 0;">${organization?.name || ''}</h2>
                  <p style="margin: 5px 0;">${organization?.address || ''}</p>
                  <p style="margin: 5px 0;">Tel: ${organization?.phone || ''}</p>
                  ${organization?.vatNumber ? `<p style="margin: 5px 0;">VAT: ${organization.vatNumber}</p>` : ''}
                  <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                  <p style="margin: 5px 0;"><strong>Order #:</strong> ${order.orderNumber}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                  ${order.tableName ? `<p style="margin: 5px 0;"><strong>Table:</strong> ${order.tableName}</p>` : ''}
                  ${order.customerName ? `<p style="margin: 5px 0;"><strong>Customer:</strong> ${order.customerName}</p>` : ''}
                  <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
                </div>
                
                <div style="margin-bottom: 20px;">
                  ${order.items.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0;">
                      <span>${item.name} (${item.quantity}x)</span>
                      <span style="font-weight: 500;">$${item.total.toFixed(2)}</span>
                    </div>
                  `).join('')}
                </div>
                
                <div style="border-top: 2px solid #000; padding-top: 15px; margin-top: 20px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Subtotal:</span>
                    <span>$${(order.subtotal || 0).toFixed(2)}</span>
                  </div>
                  ${(order.taxRate || 0) > 0 ? `
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>VAT (${order.taxRate || 0}%):</span>
                    <span>$${(order.taxAmount || 0).toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                    <span>TOTAL:</span>
                    <span>$${(order.total || 0).toFixed(2)}</span>
                  </div>
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
                  <p>Thank you for your business!</p>
                </div>
              </div>
              
              <script>
                window.onload = function() {
                  setTimeout(function() {
                    window.print();
                    window.close();
                  }, 500);
                };
              </script>
            </body>
            </html>
          `;

          printWindow.document.write(receiptHtml);
          printWindow.document.close();
          
          setIsGenerating(false);
          setOpen(false);
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
      // Generate proper HTML using the Receipt template structure
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
            }
            .receipt-container {
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
              border: 1px solid #ddd;
            }
            @media print {
              body { padding: 0; }
              .receipt-container { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="margin: 0 0 10px 0;">${organization?.name || ''}</h2>
              <p style="margin: 5px 0;">${organization?.address || ''}</p>
              <p style="margin: 5px 0;">Tel: ${organization?.phone || ''}</p>
              ${organization?.vatNumber ? `<p style="margin: 5px 0;">VAT: ${organization.vatNumber}</p>` : ''}
              <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
              <p style="margin: 5px 0;"><strong>Order #:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
              ${order.tableName ? `<p style="margin: 5px 0;"><strong>Table:</strong> ${order.tableName}</p>` : ''}
              ${order.customerName ? `<p style="margin: 5px 0;"><strong>Customer:</strong> ${order.customerName}</p>` : ''}
              <hr style="margin: 15px 0; border: none; border-top: 1px solid #ddd;">
            </div>
            
            <div style="margin-bottom: 20px;">
              ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 5px 0;">
                  <span>${item.name} (${item.quantity}x)</span>
                  <span style="font-weight: 500;">$${item.total.toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            
            <div style="border-top: 2px solid #000; padding-top: 15px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>Subtotal:</span>
                <span>$${(order.subtotal || 0).toFixed(2)}</span>
              </div>
              ${(order.taxRate || 0) > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span>VAT (${order.taxRate || 0}%):</span>
                <span>$${(order.taxAmount || 0).toFixed(2)}</span>
              </div>
              ` : ''}
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ddd;">
                <span>TOTAL:</span>
                <span>$${(order.total || 0).toFixed(2)}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
              <p>Thank you for your business!</p>
            </div>
          </div>
        </body>
        </html>
      `;

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
                </CardContent>
              </Card>
            )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
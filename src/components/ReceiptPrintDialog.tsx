import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TemplateSelector } from "@/components/ui/TemplateSelector";
import { PrinterSettingsPreview } from "@/components/ui/printer-settings-preview";
import { Printer } from "lucide-react";
import {
  Order,
  ReceiptTemplate,
  Organization,
  OrderPayment,
  PrinterSettings,
} from "@/types";
import { renderReceiptTemplate } from "@/lib/template-renderer";
import { toast } from "sonner";
import { useState } from "react";

interface ReceiptPrintDialogProps {
  order: Order;
  organization: Organization | null;
  receiptTemplates: ReceiptTemplate[];
  payments?: OrderPayment[];
  printerSettings?: PrinterSettings | null;
  children: React.ReactNode;
}

interface LayoutSettings {
  paperWidth: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
}

export function ReceiptPrintDialog({
  order,
  organization,
  receiptTemplates,
  payments = [],
  printerSettings,
  children,
}: ReceiptPrintDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Set default template on open
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      console.log(`[ReceiptPrintDialog] Opening dialog with:`, {
        templatesCount: receiptTemplates.length,
        printerSettings: printerSettings
          ? {
              receipts: printerSettings.receipts?.defaultTemplateId,
              invoices: printerSettings.invoices?.defaultTemplateId,
              quotes: printerSettings.quotes?.defaultTemplateId,
            }
          : null,
        templates: receiptTemplates.map((t) => ({ id: t.id, name: t.name })),
      });

      // First try to get default template from printer settings
      const printerDefaultId = printerSettings?.receipts?.defaultTemplateId;
      let selectedId = "";

      if (printerDefaultId) {
        const printerDefaultTemplate = receiptTemplates.find(
          (t) => t.id === printerDefaultId,
        );
        if (printerDefaultTemplate) {
          selectedId = printerDefaultTemplate.id;
          console.log(
            `[ReceiptPrintDialog] Using printer default template: ${printerDefaultTemplate.name}`,
          );
        } else {
          console.log(
            `[ReceiptPrintDialog] Printer default template not found: ${printerDefaultId}`,
          );
        }
      }

      

      // Final fallback to first template
      if (!selectedId && receiptTemplates.length > 0) {
        selectedId = receiptTemplates[0].id;
        console.log(
          `[ReceiptPrintDialog] Using first template as fallback: ${receiptTemplates[0].name}`,
        );
      }

      setSelectedTemplate(selectedId);
    }
    setOpen(newOpen);
  };

  const generateReceipt = async () => {
    const template = receiptTemplates.find((t) => t.id === selectedTemplate);
    if (!template) return;

    setIsGenerating(true);

    try {
      // Render the receipt using template
      const renderedContent = await renderReceiptTemplate(
        template,
        order,
        organization,
        payments,
        printerSettings || undefined,
      );

      console.log("=== RECEIPT PRINT DEBUG ===");
      console.log("Template ID:", template.id);
      console.log("Template Type:", template.type);
      console.log("Rendered Content Length:", renderedContent.length);
      console.log(
        "Rendered Content Preview:",
        renderedContent.substring(0, 300) + "...",
      );

      // Check if key fields are present in rendered content
      const hasOrderType =
        renderedContent.includes("Dine-in") ||
        renderedContent.includes("dine-in");
      const hasQueueNumber =
        renderedContent.includes("Queue #") ||
        renderedContent.includes("رقم الدور");
      const hasSubtotal =
        renderedContent.includes("Items Value") ||
        renderedContent.includes("قيمة الأصناف");
      const hasVAT =
        renderedContent.includes("VAT") || renderedContent.includes("الضريبة");
      const hasTotal =
        renderedContent.includes("TOTAL AMOUNT") ||
        renderedContent.includes("المبلغ الإجمالي");
      const hasPayments =
        renderedContent.includes("Payment Type") ||
        renderedContent.includes("نوع الدفع");
      const hasDijibill =
        renderedContent.includes("Powered by") ||
        renderedContent.includes("مشغل بواسطة");

      console.log("Rendered Content Field Check:");
      console.log("- Order Type:", hasOrderType);
      console.log("- Queue Number:", hasQueueNumber);
      console.log("- Subtotal:", hasSubtotal);
      console.log("- VAT:", hasVAT);
      console.log("- Total:", hasTotal);
      console.log("- Payments:", hasPayments);
      console.log("- Dijibill Branding:", hasDijibill);

      // Extract layout settings
      const layoutSettings: LayoutSettings = {
        paperWidth: printerSettings?.receipts?.paperWidth || 80,
        marginTop: printerSettings?.receipts?.marginTop || 0,
        marginBottom: printerSettings?.receipts?.marginBottom || 0,
        marginLeft: printerSettings?.receipts?.marginLeft || 0,
        marginRight: printerSettings?.receipts?.marginRight || 0,
        paddingTop: printerSettings?.receipts?.paddingTop || 0,
        paddingBottom: printerSettings?.receipts?.paddingBottom || 0,
        paddingLeft: printerSettings?.receipts?.paddingLeft || 0,
        paddingRight: printerSettings?.receipts?.paddingRight || 0,
      };

      // Calculate appropriate window width based on paper width
      const paperWidthMm = layoutSettings.paperWidth;
      // Convert mm to pixels (assuming 96 DPI) and add some padding for UI
      const windowWidth = Math.max(400, Math.min(1000, paperWidthMm * 3.78 + 200));
      const windowHeight = 600;

      // Create a new window for printing (safer than manipulating current DOM)
      const printWindow = window.open("", "_blank", `width=${windowWidth},height=${windowHeight}`);
      if (!printWindow) {
        throw new Error(
          "Unable to open print window. Please check your popup blocker.",
        );
      }

      // Write the receipt content to the new window
      const fullHtmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${order.orderNumber}</title>
              <style>
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
                @media print {
                  @page {
                    margin: ${layoutSettings.marginTop}mm ${layoutSettings.marginRight}mm ${layoutSettings.marginBottom}mm ${layoutSettings.marginLeft}mm;
                  }
                  body {
                    max-width: ${layoutSettings.paperWidth}mm;
                    margin: 0;
                    padding: ${layoutSettings.paddingTop}mm ${layoutSettings.paddingRight}mm ${layoutSettings.paddingBottom}mm ${layoutSettings.paddingLeft}mm;
                  }
                  .item-col {
                    width: calc(${layoutSettings.paperWidth}mm - 120px);
                  }
                  * {
                    box-sizing: border-box;
                  }
                }
              </style>
          </head>
          <body>
            ${renderedContent}
          </body>
        </html>
      `;

      console.log("=== PRINT WINDOW DEBUG ===");
      console.log("Full HTML Content Length:", fullHtmlContent.length);
      console.log(
        "Full HTML Content Preview:",
        fullHtmlContent.substring(0, 500) + "...",
      );

      printWindow.document.write(fullHtmlContent);

      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        // Close the window after printing (with a delay to allow print dialog)
        setTimeout(() => {
          printWindow.close();
          setIsGenerating(false);
          setOpen(false);
          toast.success("Receipt sent to printer!");
        }, 6000);
      };
    } catch (error) {
      console.error("Error generating receipt:", error);
      setIsGenerating(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error generating receipt. Please try again.",
      );
    }
  };

  const actions = (
    <>
      <Button variant="outline" onClick={() => setOpen(false)}>
        Cancel
      </Button>
      <Button
        onClick={generateReceipt}
        disabled={
          !selectedTemplate ||
          receiptTemplates.length === 0 ||
          isGenerating
        }
        className="flex items-center gap-2"
      >
        <Printer className="h-4 w-4" />
        {isGenerating ? "Generating..." : "Print Receipt"}
      </Button>
    </>
  );

  return (
    <DialogWithActions
      open={open}
      onOpenChange={handleOpenChange}
      title="Print Receipt"
      description="Select a receipt template and print your order receipt"
      actions={actions}
      trigger={children}
      
    >
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
                    <td className="py-1">
                      {new Date(order.createdAt).toLocaleString()}
                    </td>
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
                    <td className="py-1 font-bold">
                      ${(order.total || 0).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td className="font-medium py-1">Status:</td>
                    <td className="py-1">
                      <Badge variant="outline" className="ml-0">
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
             </CardContent>
            </Card>

            {/* Printer Settings Preview */}
            <PrinterSettingsPreview
              printerSettings={printerSettings}
              documentType="receipts"
            />
          </div>

         {/* Right Column - Template Selection */}
         <div className="space-y-6">
           {/* Template Selection */}
            <Card>
             <CardHeader>
               <CardTitle className="text-lg">
                 Select Receipt Template
               </CardTitle>
             </CardHeader>
             <CardContent>
               {receiptTemplates.length === 0 ? (
                 <p className="text-muted-foreground">
                   No receipt templates available. Please create templates in
                   Settings.
                 </p>
               ) : (
                 <TemplateSelector
                   templates={receiptTemplates}
                   selectedTemplate={selectedTemplate}
                   onTemplateChange={setSelectedTemplate}
                   label="Select Receipt Template"
                   placeholder="Choose a template"
                   printerSettings={printerSettings}
                   templateType="receipts"
                 />
               )}
             </CardContent>
           </Card>
         </div>
       </div>
    </DialogWithActions>
  );
}

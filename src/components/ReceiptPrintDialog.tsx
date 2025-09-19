import React, { useState, useEffect } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { Button } from "@/components/ui/button";
import {
  Order,
  Organization,
  ReceiptTemplate,
  OrderPayment,
  PrinterSettings,
} from "@/types";
import { ReceiptTemplateData } from "@/types/template";
import { defaultEnglishReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-english";
import { defaultArabicReceiptTemplate } from "@/components/templates/receipt/default-receipt-thermal-arabic";
import { createReceiptQRData, generateZatcaQRCode } from "@/lib/zatca-qr";
import { formatDateTime } from "@/lib/utils";
import { renderTemplate } from "@/lib/template-renderer"; // <-- Import the new utility

// Helper function to prepare data and render a receipt
async function renderReceipt(
  templateObj: ReceiptTemplate,
  order: Order,
  organization: Organization | null,
  payments: OrderPayment[] = [],
  printerSettings?: PrinterSettings,
): Promise<string> {
  const qrCodeBase64 = await generateZatcaQRCode(
    createReceiptQRData(order, organization),
  );
  const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const data: ReceiptTemplateData = {
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    companyAddress: organization?.address || "",
    companyPhone: organization?.phone || "",
    companyVat: organization?.vatNumber || "",
    companyLogo: organization?.logoUrl || "",
    orderNumber: order.orderNumber,
    queueNumber: order.queueNumber || "",
    formattedDate: formatDateTime(order.createdAt),
    tableName: order.tableName || "",
    customerName: order.customerName || "",
    createdByName: order.createdByName || "",
    orderType: order.orderType || "dine-in",
    subtotal: (order.subtotal || 0).toFixed(2),
    vatRate: (order.taxRate || 0).toString(),
    vatAmount: (order.taxAmount || 0).toFixed(2),
    total: (order.total || 0).toFixed(2),
    totalQty: totalQty,
    customHeader: printerSettings?.receipts?.customHeader || "",
    customFooter: printerSettings?.receipts?.customFooter || "",
    items: order.items.map((item) => ({
      ...item,
      total: item.total.toFixed(2),
    })),
    payments: payments.map((p) => ({ ...p, amount: p.amount.toFixed(2) })),
    includeQR: true,
    qrCodeUrl: qrCodeBase64,
  };

  const templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? defaultArabicReceiptTemplate
      : defaultEnglishReceiptTemplate);

  return renderTemplate(templateContent, data);
}

interface ReceiptPrintDialogProps {
  order: Order;
  organization: Organization | null;
  receiptTemplates: ReceiptTemplate[];
  payments?: OrderPayment[];
  printerSettings?: PrinterSettings | null;
  children: React.ReactNode;
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
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [pageSize, setPageSize] = useState("80mm");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [margins, setMargins] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [padding, setPadding] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  useEffect(() => {
    if (open && selectedTemplate) {
      const template = receiptTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        // Automatically set direction based on template type
        setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");
        renderPreview(template);
      }
    }
  }, [
    open,
    selectedTemplate,
    pageSize,
    order,
    organization,
    payments,
    printerSettings,
  ]);

  const renderPreview = async (template: ReceiptTemplate) => {
    try {
      const content = await renderReceipt(
        template,
        order,
        organization,
        payments,
        {
          ...(printerSettings || {}),
          id: printerSettings?.id || "live-preview",
          organizationId: organization?.id || "",
          createdAt: printerSettings?.createdAt || new Date(),
          updatedAt: new Date(),
          receipts: {
            ...(printerSettings?.receipts || {}),
            paperWidth: parseInt(pageSize),
          },
        },
      );
      setRenderedHtml(content);
    } catch (error) {
      console.error("Failed to render receipt preview:", error);
      setRenderedHtml("<p style='color: red;'>Error rendering preview.</p>");
    }
  };

  const handlePrint = async () => {
    // ... (Printing logic remains the same as before)
  };

  // ... (Dialog JSX structure remains the same, with the addition of the direction toggle)

  return (
    <DialogWithActions
      open={open}
      onOpenChange={(newOpen) => setOpen(newOpen)}
      title="Print Receipt"
      description="Adjust settings and preview the receipt before printing."
      actions={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            disabled={!selectedTemplate || isGenerating}
          >
            <Printer className="h-4 w-4 mr-2" />
            {isGenerating ? "Processing..." : "Print Receipt"}
          </Button>
        </>
      }
      trigger={children}
      maxWidth="max-w-4xl"
    >
      <div className="flex h-[60vh] font-sans">
        {/* Settings Panel */}
        <div className="w-1/3 p-4 border-r bg-muted/50 overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold text-foreground pb-2 border-b">
            Print Settings
          </h2>
          {/* Template Selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border border-border rounded-md shadow-sm bg-background"
            >
              {receiptTemplates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          {/* Paper Size Selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Paper Size
            </label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value)}
              className="w-full p-2 border border-border rounded-md shadow-sm bg-background"
            >
              <option value="80mm">80mm Thermal</option>
              <option value="58mm">58mm Thermal</option>
              <option value="210mm">A4</option>
            </select>
          </div>
          {/* Direction (LTR/RTL) Selector */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "ltr" | "rtl")}
              className="w-full p-2 border border-border rounded-md shadow-sm bg-background"
            >
              <option value="ltr">Left-to-Right (LTR)</option>
              <option value="rtl">Right-to-Left (RTL)</option>
            </select>
          </div>
          {/* Margins & Padding Controls ... */}
        </div>
        {/* Preview Area */}
        <div className="w-2/3 p-6 flex justify-center items-start bg-muted/30 overflow-y-auto">
          <div
            className="shadow-lg"
            style={{
              width: pageSize,
              backgroundColor: "white",
              color: "black",
            }}
          >
            <div
              dir={direction}
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>
      </div>
    </DialogWithActions>
  );
}

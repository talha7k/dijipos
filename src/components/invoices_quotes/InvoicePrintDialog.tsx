import React, { useState, useEffect, ReactNode, useMemo } from "react";
import { renderTemplate } from "@/lib/template-renderer";
import { SalesInvoice, PurchaseInvoice } from "@/types/invoice-quote";
import { InvoiceType } from "@/types";
import { Organization } from "@/types/organization-user";
import { InvoiceTemplate, InvoiceTemplateData } from "@/types/template";
import { Customer, Supplier } from "@/types/customer-supplier";
import { createInvoiceQRData, generateZatcaQRCode } from "@/lib/zatca-qr";
import { DocumentPrintSettings } from "@/types"; // Assuming types are in @/types
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { Button } from "@/components/ui/button";
import { Printer, Mail } from "lucide-react";
import { toast } from "sonner";
import { salesInvoiceEnglish } from "@/components/templates/invoice/sales-invoice-english";
import { salesInvoiceArabic } from "@/components/templates/invoice/sales-invoice-arabic";
import { purchaseInvoiceEnglish } from "@/components/templates/invoice/purchase-invoice-english";
import { purchaseInvoiceArabic } from "@/components/templates/invoice/purchase-invoice-arabic";
// --- END: Mock Dependencies ---

async function renderInvoice(
  templateObj: InvoiceTemplate,
  invoice: SalesInvoice | PurchaseInvoice,
  organization: Organization | null,
  customer?: Customer,
  supplier?: Supplier,
): Promise<string> {
  const qrCodeBase64 = await generateZatcaQRCode(
    createInvoiceQRData(invoice, organization),
  );
  const data: InvoiceTemplateData = {
    invoiceId: invoice.id,
    invoiceDate: new Date(invoice.createdAt).toLocaleDateString(),
    dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "",
    status: invoice.status,
    invoiceType: invoice.type,
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    companyAddress: organization?.address || "",
    companyEmail: organization?.email || "",
    companyPhone: organization?.phone || "",
    companyVat: organization?.vatNumber || "",
    companyLogo: organization?.logoUrl || "",
    companyStamp: organization?.stampUrl || "",
    clientName: customer?.name || supplier?.name || "",
    customerNameAr: customer?.nameAr || supplier?.nameAr || "",
    clientAddress: customer?.address || supplier?.address || "",
    clientEmail: customer?.email || supplier?.email || "",
    clientVat: customer?.vatNumber || supplier?.vatNumber || "",
    customerLogo: customer?.logoUrl || "",
    supplierName: supplier?.name || "",
    supplierNameAr: supplier?.nameAr || "",
    supplierAddress: supplier?.address || "",
    supplierEmail: supplier?.email || "",
    supplierVat: supplier?.vatNumber || "",
    supplierLogo: supplier?.logoUrl || "",
    subtotal: (invoice.subtotal || 0).toFixed(2),
    taxRate: invoice.taxRate?.toString() || "0",
    taxAmount: (invoice.taxAmount || 0).toFixed(2),
    total: (invoice.total || 0).toFixed(2),
    notes: invoice.notes || "",
    items: (invoice.items || []).map((item) => ({
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2),
    })),
    includeQR: true,
    qrCodeUrl: qrCodeBase64,
    // Add missing template variables
    headingFont: "Arial, sans-serif",
    bodyFont: "Arial, sans-serif",
    marginTop: 10,
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 15,
    paddingRight: 15,
  };
  // Determine if this is a purchase invoice (has supplier) or sales invoice (has customer)
  const isPurchaseInvoice = !!supplier;

  let templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? (isPurchaseInvoice ? purchaseInvoiceArabic : salesInvoiceArabic)
      : (isPurchaseInvoice ? purchaseInvoiceEnglish : salesInvoiceEnglish));

  // Ensure the template has items support
  if (!templateContent.includes('{{#each items}}')) {
    templateContent = templateObj.type?.includes("arabic")
      ? (isPurchaseInvoice ? purchaseInvoiceArabic : salesInvoiceArabic)
      : (isPurchaseInvoice ? purchaseInvoiceEnglish : salesInvoiceEnglish);
  }

  console.log('Template content preview:', templateContent.substring(0, 200));
  console.log('Template data:', data);
  const result = renderTemplate(templateContent, data);
  console.log('Rendered result preview:', result.substring(0, 200));
  return result;
}

// Helper component for settings inputs
const SettingsInputGroup = ({ label, values, onChange }: { label: string; values: Record<string, number>; onChange: (key: string, value: string) => void }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}
    >
      {Object.keys(values).map((key) => (
        <div key={key}>
          <label className="block text-xs capitalize text-gray-600">
            {key}
          </label>
          <input
            type="number"
            value={values[key]}
            onChange={(e) => onChange(key, e.target.value)}
            className="w-full p-1 border rounded text-sm"
          />
        </div>
      ))}
    </div>
  </div>
);

interface InvoicePrintDialogProps {
  invoice: SalesInvoice | PurchaseInvoice;
  organization: Organization | null;
  invoiceTemplates: InvoiceTemplate[];
  customer?: Customer;
  supplier?: Supplier;
  children: React.ReactNode;
  settings?: DocumentPrintSettings | null; // Use the new settings type
  previewMode?: boolean;
  onEmail?: (invoice: SalesInvoice | PurchaseInvoice, templateId: string) => void;
}

export function InvoicePrintDialog({
  invoice,
  organization,
  invoiceTemplates = [],
  customer,
  supplier,
  children,
  settings,
  previewMode = false,
  onEmail,
}: InvoicePrintDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");
  const [pageSize, setPageSize] = useState("210mm"); // A4 default
  const [isGenerating, setIsGenerating] = useState(false);
  const [margins, setMargins] = useState({
    top: 10,
    right: 10,
    bottom: 10,
    left: 10,
  });
  const [paddings, setPaddings] = useState({
    top: 15,
    right: 15,
    bottom: 15,
    left: 15,
  });

  // Filter templates based on invoice type
  const filteredTemplates = useMemo(() => {
    return invoiceTemplates?.filter((template) => {
      if (invoice.type === InvoiceType.SALES) {
        return template.id.includes('sales-invoice') || template.id.includes('custom');
      } else if (invoice.type === InvoiceType.PURCHASE) {
        return template.id.includes('purchase-invoice') || template.id.includes('custom');
      }
      return true; // Show all for other cases
    }) || [];
  }, [invoiceTemplates, invoice.type]);

  // Effect to initialize all settings when the dialog opens
  useEffect(() => {
    if (open) {
      // 1. Set default template
      const defaultTemplateId = settings?.defaultTemplateId;
      const isValidDefault =
        defaultTemplateId &&
        filteredTemplates?.some((t) => t.id === defaultTemplateId);
      setSelectedTemplate(
        isValidDefault ? defaultTemplateId : filteredTemplates?.[0]?.id || "",
      );

      // 2. Set paper size
      setPageSize(settings?.paperWidth ? `${settings.paperWidth}mm` : "210mm");

      // 3. Set margins and paddings
      setMargins({
        top: settings?.marginTop ?? 10,
        right: settings?.marginRight ?? 10,
        bottom: settings?.marginBottom ?? 10,
        left: settings?.marginLeft ?? 10,
      });
      setPaddings({
        top: settings?.paddingTop ?? 15,
        right: settings?.paddingRight ?? 15,
        bottom: settings?.paddingBottom ?? 15,
        left: settings?.paddingLeft ?? 15,
      });
    } else {
      setRenderedHtml(""); // Clear preview on close
    }
  }, [open, settings, filteredTemplates]);

  // Effect to render the preview when settings change
  useEffect(() => {
    if (open && selectedTemplate) {
      const template = filteredTemplates?.find((t) => t.id === selectedTemplate);
      if (template) {
        setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");
        renderPreview(template);
      }
    }
  }, [open, selectedTemplate, invoice, organization, customer, supplier, filteredTemplates]);

  // Effect to handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (open && (event.ctrlKey || event.metaKey) && event.key === 'p') {
        event.preventDefault();
        handlePrint();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, selectedTemplate, renderedHtml, pageSize, margins, paddings, filteredTemplates, invoice]);

  const renderPreview = async (template: InvoiceTemplate) => {
    const content = await renderInvoice(
      template,
      invoice,
      organization,
      customer,
      supplier,
    );
    setRenderedHtml(content);
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      console.log("Print button clicked", { selectedTemplate, hasRenderedHtml: !!renderedHtml });
      
      if (!selectedTemplate || !renderedHtml) {
        toast.error("No template selected or preview not ready");
        return;
      }

      // Get the selected template to determine direction
      const template = filteredTemplates?.find((t) => t.id === selectedTemplate);
      const direction = template?.type?.includes("arabic") ? "rtl" : "ltr";

      // Create the print HTML with proper styling
      const printHtml = `
        <!DOCTYPE html>
        <html dir="${direction}">
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.id}</title>
          <style>
            @media print {
              @page {
                size: ${pageSize === "210mm" ? "A4" : pageSize === "80mm" ? "80mm 297mm" : "58mm 297mm"};
                margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm;
              }
              body {
                margin: 0;
                padding: 0;
                font-family: Arial, sans-serif;
              }
              .print-container {
                width: 100%;
                padding: ${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm;
                box-sizing: border-box;
              }
              .no-print {
                display: none !important;
              }
            }
            @media screen {
              body {
                margin: 20px;
                font-family: Arial, sans-serif;
                background: #f5f5f5;
              }
              .print-container {
                max-width: ${pageSize};
                margin: 0 auto;
                background: white;
                padding: ${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                box-sizing: border-box;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${renderedHtml}
          </div>
          <script>
            // Auto-trigger print dialog when page loads
            window.onload = function() {
              setTimeout(() => {
                window.print();
                // Optional: close window after printing (user can cancel)
                setTimeout(() => {
                  window.close();
                }, 1000);
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        // Fallback: try to print current content using iframe
        const printFrame = document.createElement('iframe');
        printFrame.style.position = 'absolute';
        printFrame.style.left = '-9999px';
        printFrame.style.top = '-9999px';
        document.body.appendChild(printFrame);
        
        const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
        if (frameDoc) {
          frameDoc.write(printHtml);
          frameDoc.close();
          printFrame.contentWindow?.print();
          
          // Clean up
          setTimeout(() => {
            document.body.removeChild(printFrame);
          }, 1000);
        } else {
          toast.error("Please allow popups to print invoices");
        }
        return;
      }

      // Write the HTML to the new window
      printWindow.document.write(printHtml);
      printWindow.document.close();

      console.log("Print window opened successfully");
      toast.success("Print dialog opened");
    } catch (error) {
      console.error("Error printing invoice:", error);
      toast.error("Failed to print invoice");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEmail = () => {
    if (onEmail && selectedTemplate) {
      onEmail(invoice, selectedTemplate);
      setOpen(false);
    }
  };

  return (
    <DialogWithActions
      open={open}
      onOpenChange={setOpen}
      title={previewMode ? "Preview Invoice" : "Print Invoice"}
      actions={
        <>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {previewMode ? "Close" : "Cancel"}
          </Button>
          {previewMode && onEmail && (
            <Button
              variant="outline"
              onClick={handleEmail}
              disabled={!selectedTemplate}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          )}
          {!previewMode && (
            <Button
              onClick={handlePrint}
              disabled={!selectedTemplate || isGenerating}
            >
              <Printer className="h-4 w-4 mr-2" />
              {isGenerating ? "Processing..." : "Print Invoice"}
            </Button>
          )}
        </>
      }
      trigger={children}
    >
      <div
        className="flex h-[80vh] font-sans"
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <div className={`${previewMode ? 'w-1/5' : 'w-1/4'} p-4 border-r bg-muted overflow-y-auto space-y-4`}>
          <h2 className="text-lg font-bold">Settings</h2>
          <div>
            <label className="block text-sm font-medium">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {filteredTemplates?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          {!previewMode && (
            <>
              <div>
                <label className="block text-sm font-medium">Paper Size</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="210mm">A4 (210mm)</option>
                  <option value="80mm">80mm Thermal</option>
                  <option value="58mm">58mm Thermal</option>
                </select>
              </div>
              <SettingsInputGroup
                label="Margins (mm)"
                values={margins}
                onChange={(key, value) =>
                  setMargins((m) => ({ ...m, [key]: Number(value) }))
                }
              />
              <SettingsInputGroup
                label="Paddings (mm)"
                values={paddings}
                onChange={(key, value) =>
                  setPaddings((p) => ({ ...p, [key]: Number(value) }))
                }
              />
            </>
          )}
        </div>
        <div className={`${previewMode ? 'w-4/5' : 'w-3/4'} p-6 bg-gray-200 overflow-y-auto flex justify-center items-start`}>
          <div
            className="bg-white shadow-lg"
            style={{
              width: pageSize,
              minHeight: pageSize === "210mm" ? "297mm" : "auto",
              margin: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
              padding: `${paddings.top}mm ${paddings.right}mm ${paddings.bottom}mm ${paddings.left}mm`,
              boxSizing: "border-box",
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

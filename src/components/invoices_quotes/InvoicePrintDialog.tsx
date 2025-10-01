import React, { useState, useEffect, ReactNode } from "react";
import { renderTemplate } from "@/lib/template-renderer";
import { Invoice } from "@/types/invoice-quote";
import { Organization } from "@/types/organization-user";
import { InvoiceTemplate, InvoiceTemplateData } from "@/types/template";
import { Customer, Supplier } from "@/types/customer-supplier";
import { createInvoiceQRData, generateZatcaQRCode } from "@/lib/zatca-qr";
import { DocumentPrintSettings } from "@/types"; // Assuming types are in @/types
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";
const defaultInvoiceEnglish = `<!DOCTYPE html><html><body><h1>Invoice {{invoiceId}}</h1></body></html>`;
const defaultInvoiceArabic = `<!DOCTYPE html><html dir="rtl"><body><h1>فاتورة {{invoiceId}}</h1></body></html>`;
// --- END: Mock Dependencies ---

async function renderInvoice(
  templateObj: InvoiceTemplate,
  invoice: Invoice,
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
    items: invoice.items.map((item) => ({
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
  const templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? defaultInvoiceArabic
      : defaultInvoiceEnglish);
  return renderTemplate(templateContent, data);
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
  invoice: Invoice;
  organization: Organization | null;
  invoiceTemplates: InvoiceTemplate[];
  customer?: Customer;
  supplier?: Supplier;
  children: React.ReactNode;
  settings?: DocumentPrintSettings | null; // Use the new settings type
}

export function InvoicePrintDialog({
  invoice,
  organization,
  invoiceTemplates = [],
  customer,
  supplier,
  children,
  settings,
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

  // Effect to initialize all settings when the dialog opens
  useEffect(() => {
    if (open) {
      // 1. Set default template
      const defaultTemplateId = settings?.defaultTemplateId;
      const isValidDefault =
        defaultTemplateId &&
        invoiceTemplates?.some((t) => t.id === defaultTemplateId);
      setSelectedTemplate(
        isValidDefault ? defaultTemplateId : invoiceTemplates?.[0]?.id || "",
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
  }, [open, settings, invoiceTemplates]);

  // Effect to render the preview when settings change
  useEffect(() => {
    if (open && selectedTemplate) {
      const template = invoiceTemplates?.find((t) => t.id === selectedTemplate);
      if (template) {
        setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");
        renderPreview(template);
      }
    }
  }, [open, selectedTemplate, invoice, organization, customer, supplier, invoiceTemplates]);

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
      // Print logic would go here
      toast.info("Printing logic not implemented in this example.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DialogWithActions
      open={open}
      onOpenChange={setOpen}
      title="Print Invoice"
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
            {isGenerating ? "Processing..." : "Print Invoice"}
          </Button>
        </>
      }
      trigger={children}
    >
      <div
        className="flex h-[80vh] font-sans"
        style={{ maxHeight: "calc(100vh - 100px)" }}
      >
        <div className="w-1/4 p-4 border-r bg-muted overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <div>
            <label className="block text-sm font-medium">Template</label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {invoiceTemplates?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
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
        </div>
        <div className="w-3/4 p-6 bg-gray-200 overflow-y-auto flex justify-center items-start">
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

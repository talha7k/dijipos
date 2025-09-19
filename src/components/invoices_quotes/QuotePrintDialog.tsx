import React, { useState, useEffect, ReactNode } from "react";
import { renderTemplate } from "@/lib/template-renderer";
import { Quote } from "@/types/invoice-quote";
import { Organization } from "@/types/organization-user";
import { QuoteTemplate, QuoteTemplateData } from "@/types/template";
import { Customer } from "@/types/customer-supplier";
import { DocumentPrintSettings } from "@/types"; // Assuming types are in @/types
import { DialogWithActions } from "@/components/ui/DialogWithActions";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { toast } from "sonner";
const defaultQuoteEnglish = `<!DOCTYPE html><html><body><h1>Quote {{quoteId}}</h1></body></html>`;
const defaultQuoteArabic = `<!DOCTYPE html><html dir="rtl"><body><h1>عرض سعر {{quoteId}}</h1></body></html>`;
// --- END: Mock Dependencies ---

async function renderQuote(
  templateObj: QuoteTemplate,
  quote: Quote,
  organization: Organization | null,
  customer?: Customer,
): Promise<string> {
  const data: QuoteTemplateData = {
    quoteId: quote.id,
    quoteDate: new Date(quote.createdAt).toLocaleDateString(),
    validUntil: quote.validUntil
      ? new Date(quote.validUntil).toLocaleDateString()
      : "N/A",
    status: quote.status,
    companyName: organization?.name || "",
    companyNameAr: organization?.nameAr || "",
    companyAddress: organization?.address || "",
    companyEmail: organization?.email || "",
    companyPhone: organization?.phone || "",
    companyVat: organization?.vatNumber || "",
    companyLogo: organization?.logoUrl || "",
    clientName: customer?.name || quote.clientName || "",
    customerNameAr: customer?.nameAr || "",
    clientAddress: customer?.address || quote.clientAddress || "",
    clientEmail: customer?.email || "",
    clientVat: customer?.vatNumber || "",
    customerLogo: customer?.logoUrl || "",
    subtotal: (quote.subtotal || 0).toFixed(2),
    taxRate: "0",
    taxAmount: (quote.taxAmount || 0).toFixed(2),
    total: (quote.total || 0).toFixed(2),
    notes: quote.notes || "",
    items: quote.items.map((item) => ({
      name: item.name,
      description: item.description || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2),
    })),
    includeQR: false,
  };
  const templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? defaultQuoteArabic
      : defaultQuoteEnglish);
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

interface QuotePrintDialogProps {
  quote: Quote;
  organization: Organization | null;
  quoteTemplates: QuoteTemplate[];
  customer?: Customer;
  children: React.ReactNode;
  settings?: DocumentPrintSettings | null; // Use the new settings type
}

export function QuotePrintDialog({
  quote,
  organization,
  quoteTemplates,
  customer,
  children,
  settings,
}: QuotePrintDialogProps) {
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
        quoteTemplates.some((t) => t.id === defaultTemplateId);
      setSelectedTemplate(
        isValidDefault ? defaultTemplateId : quoteTemplates[0]?.id || "",
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
  }, [open, settings, quoteTemplates]);

  // Effect to render the preview when settings change
  useEffect(() => {
    if (open && selectedTemplate) {
      const template = quoteTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        setDirection(template.type?.includes("arabic") ? "rtl" : "ltr");
        renderPreview(template);
      }
    }
  }, [open, selectedTemplate, quote, organization, customer]);

  const renderPreview = async (template: QuoteTemplate) => {
    const content = await renderQuote(template, quote, organization, customer);
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
      title="Print Quote"
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
            {isGenerating ? "Processing..." : "Print Quote"}
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
              {quoteTemplates.map((t) => (
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

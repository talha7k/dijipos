import React, { useState, useEffect, ReactNode } from "react";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { renderTemplate } from "@/lib/template-renderer"; // Assuming local file

// --- START: Self-Contained Dependencies ---

const DialogWithActions = ({
  open,
  onOpenChange,
  title,
  trigger,
  children,
  maxWidth,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  trigger: ReactNode;
  children: ReactNode;
  maxWidth?: string;
}) => {
  if (!open) return <div onClick={() => onOpenChange(true)}>{trigger}</div>;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "800px",
          color: "black",
        }}
      >
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  );
};
const Button = (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...props} />
);

type Quote = {
  id: string;
  createdAt: Date;
  validUntil?: Date;
  status: string;
  clientName: string;
  clientAddress: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes: string;
  items: any[];
};
type Organization = {
  name: string;
  nameAr?: string;
  address: string;
  phone: string;
  vatNumber: string;
  logoUrl?: string;
};
type QuoteTemplate = {
  id: string;
  name: string;
  type?: string;
  content?: string;
};
type Customer = { name: string; address: string; vatNumber: string };
type QuoteTemplateData = { [key: string]: any };

const defaultQuoteEnglish = `<!DOCTYPE html><html><body><h1>Quote {{quoteId}}</h1></body></html>`;
const defaultQuoteArabic = `<!DOCTYPE html><html dir="rtl"><body><h1>عرض سعر {{quoteId}}</h1></body></html>`;

// --- END: Self-Contained Dependencies ---

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
    clientName: customer?.name || quote.clientName || "",
    clientAddress: customer?.address || quote.clientAddress || "",
    subtotal: (quote.subtotal || 0).toFixed(2),
    taxAmount: (quote.taxAmount || 0).toFixed(2),
    total: (quote.total || 0).toFixed(2),
    notes: quote.notes || "",
    items: quote.items.map((item) => ({
      ...item,
      unitPrice: item.unitPrice.toFixed(2),
      total: item.total.toFixed(2),
    })),
  };
  const templateContent =
    templateObj.content ||
    (templateObj.type?.includes("arabic")
      ? defaultQuoteArabic
      : defaultQuoteEnglish);
  return renderTemplate(templateContent, data);
}

interface QuotePrintDialogProps {
  quote: Quote;
  organization: Organization | null;
  quoteTemplates: QuoteTemplate[];
  customer?: Customer;
  children: React.ReactNode;
}

export function QuotePrintDialog({
  quote,
  organization,
  quoteTemplates,
  customer,
  children,
}: QuotePrintDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr");

  useEffect(() => {
    if (open && quoteTemplates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(quoteTemplates[0].id);
    }
  }, [open, quoteTemplates, selectedTemplate]);

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

  return (
    <DialogWithActions
      open={open}
      onOpenChange={setOpen}
      title="Print Quote"
      trigger={children}
      maxWidth="max-w-4xl"
    >
      <div className="flex h-[80vh] font-sans">
        <div className="w-1/4 p-4 border-r bg-gray-100 overflow-y-auto space-y-4">
          <h2 className="text-lg font-bold">Settings</h2>
          <div>
            <label className="block text-sm font-medium">Quote Template</label>
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
            <label className="block text-sm font-medium">Direction</label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as "ltr" | "rtl")}
              className="w-full p-2 border rounded"
            >
              <option value="ltr">Left-to-Right (LTR)</option>
              <option value="rtl">Right-to-Left (RTL)</option>
            </select>
          </div>
        </div>
        <div className="w-3/4 p-6 bg-gray-200 overflow-y-auto flex justify-center items-start">
          <div className="w-[210mm] min-h-[297mm] bg-white shadow-lg p-8">
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
